import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronDown, ChevronUp, Edit3, Plus, Trash2, X } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  sort_order: number;
  has_signup_button: boolean;
}

interface EventForm {
  title: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  has_signup_button: boolean;
}

type ModalMode = 'add' | 'edit' | null;

const emptyForm: EventForm = { title: '', date: '', description: '', location: '', image_url: '', has_signup_button: false };

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const loadEvents = useCallback(() => {
    setLoading(true);
    supabase
      .from('events')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setEvents(data as Event[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const resetModal = () => {
    setModalMode(null);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const openAddModal = () => {
    setModalMode('add');
    setForm(emptyForm);
    setError('');
    setFileInputKey(k => k + 1);
  };

  const openEditModal = (event: Event) => {
    setModalMode('edit');
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: event.date,
      description: event.description,
      location: event.location,
      image_url: event.image_url,
      has_signup_button: event.has_signup_button,
    });
    setError('');
    setFileInputKey(k => k + 1);
  };

  const updateField = (field: keyof EventForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Accepted: JPEG, PNG, WebP, GIF');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Maximum is 20MB (${(file.size / 1024 / 1024).toFixed(1)}MB selected)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const resized = canvas.toDataURL('image/jpeg', 0.8);
        setForm(prev => ({ ...prev, image_url: resized }));
        setError('');
      };
      img.onerror = () => {
        setError('Failed to process image. Please try again.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.description || !form.location || !form.image_url) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    const token = await getAuthToken();
    if (!token) {
      setError('Authentication error. Please sign in again.');
      setSubmitting(false);
      return;
    }

    try {
      if (modalMode === 'add') {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/admin-create-event`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              title: form.title,
              date: form.date,
              description: form.description,
              location: form.location,
              image_url: form.image_url,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to create event.');
          setSubmitting(false);
          return;
        }
      } else if (modalMode === 'edit' && editingId) {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/admin-update-event`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              id: editingId,
              title: form.title,
              date: form.date,
              description: form.description,
              location: form.location,
              image_url: form.image_url,
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Failed to update event.');
          setSubmitting(false);
          return;
        }
      }

      resetModal();
      loadEvents();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
    }

    setSubmitting(false);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= events.length) return;

    setMovingId(id);

    const token = await getAuthToken();
    if (!token) {
      setMovingId(null);
      return;
    }

    const id1 = id;
    const id2 = events[swapIdx].id;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-reorder-events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ id1, id2 }),
        }
      );

      if (response.ok) {
        loadEvents();
      } else {
        const data = await response.json().catch(() => ({}));
        setActionError(data.error || 'Failed to reorder event.');
        setTimeout(() => setActionError(''), 4000);
      }
    } catch (err) {
      console.error('Reorder error:', err);
      setActionError('Network error. Please try again.');
      setTimeout(() => setActionError(''), 4000);
    }

    setMovingId(null);
  };

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) return;

    setDeletingId(event.id);

    const token = await getAuthToken();
    if (!token) {
      setDeletingId(null);
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-delete-event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ id: event.id }),
        }
      );

      if (response.ok) {
        loadEvents();
      } else {
        const data = await response.json().catch(() => ({}));
        setActionError(data.error || 'Failed to delete event.');
        setTimeout(() => setActionError(''), 4000);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setActionError('Network error. Please try again.');
      setTimeout(() => setActionError(''), 4000);
    }

    setDeletingId(null);
  };

  const handleToggleSignup = async (event: Event) => {
    const newValue = !event.has_signup_button;
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, has_signup_button: newValue } : e));

    const token = await getAuthToken();
    if (!token) {
      loadEvents();
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-update-event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ id: event.id, has_signup_button: newValue }),
        }
      );

      if (!response.ok) {
        loadEvents();
      }
    } catch {
      loadEvents();
    }
  };

  const formValid = form.title && form.date && form.description && form.location && form.image_url;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-stone-900">Events Management</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm">
          No events yet. Add your first event!
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 text-sm truncate">{event.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{event.date}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(event.id, 'up')}
                  disabled={idx === 0 || movingId === event.id}
                  className="p-2 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(event.id, 'down')}
                  disabled={idx === events.length - 1 || movingId === event.id}
                  className="p-2 text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-500 select-none" title="Enable signup button">
                <span>Sign Up</span>
                <div className={`relative w-9 h-5 rounded-full transition-colors ${event.has_signup_button ? 'bg-amber-600' : 'bg-stone-300'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${event.has_signup_button ? 'translate-x-4' : ''}`} />
                  <input type="checkbox" checked={event.has_signup_button} onChange={() => handleToggleSignup(event)} className="sr-only" />
                </div>
              </label>

              <button
                onClick={() => openEditModal(event)}
                className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                title="Edit event"
              >
                <Edit3 size={16} />
              </button>

              <button
                onClick={() => handleDelete(event)}
                disabled={deletingId === event.id}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete event"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {modalMode === 'add' ? 'Add Event' : 'Edit Event'}
              </h3>
              <button onClick={resetModal} className="text-stone-400 hover:text-stone-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Event title"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                  Date *
                </label>
                <input
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  placeholder="e.g. March, Annually"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                  Location *
                </label>
                <input
                  value={form.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Event location"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  placeholder="Event description"
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                  Image *
                </label>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-stone-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-colors"
                />
                <p className="text-xs text-stone-400 mt-1.5">Max 20MB. Resized to 1200px wide automatically.</p>
                {form.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

              {modalMode === 'edit' && (
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${form.has_signup_button ? 'bg-amber-600' : 'bg-stone-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.has_signup_button ? 'translate-x-4' : ''}`} />
                      <input type="checkbox" checked={form.has_signup_button} onChange={() => setForm(prev => ({ ...prev, has_signup_button: !prev.has_signup_button }))} className="sr-only" />
                    </div>
                    <span className="text-sm font-medium text-stone-700">Show Sign Up button on public page</span>
                  </label>
                </div>
              )}

            <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-100">
              <button
                onClick={resetModal}
                className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formValid || submitting}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? 'Saving...' : (modalMode === 'add' ? 'Add Event' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
