import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronDown, ChevronUp, Edit3, ImagePlus, Plus, Trash2, X } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  sort_order: number;
}

interface EventForm {
  title: string;
  date: string;
  description: string;
  location: string;
}

type ModalMode = 'add' | 'edit' | null;

const emptyForm: EventForm = { title: '', date: '', description: '', location: '' };

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  const openAddModal = () => {
    setModalMode('add');
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setError('');
  };

  const openEditModal = (event: Event) => {
    setModalMode('edit');
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: event.date,
      description: event.description,
      location: event.location,
    });
    setImagePreview(event.image_url);
    setImageFile(null);
    setError('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Only PNG and JPG/JPEG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imagePreview;

    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setError('Failed to upload image. Please try again.');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const getAuthToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.description || !form.location) {
      setError('All fields are required.');
      return;
    }

    if (!imageFile && !imagePreview) {
      setError('Please select an image.');
      return;
    }

    if (modalMode === 'add' && !imageFile) {
      setError('Please select an image.');
      return;
    }

    setSubmitting(true);
    setError('');

    const imageUrl = await uploadImage();
    if (!imageUrl) {
      setSubmitting(false);
      return;
    }

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
              image_url: imageUrl,
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
            method: 'PATCH',
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
              image_url: imageUrl,
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
          method: 'PUT',
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
      }
    } catch (err) {
      console.error('Reorder error:', err);
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
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ id: event.id, image_url: event.image_url }),
        }
      );

      if (response.ok) {
        loadEvents();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }

    setDeletingId(null);
  };

  const formValid = form.title && form.date && form.description && form.location && (imageFile || imagePreview);

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
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
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
                  onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
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
                  onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
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
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
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
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 text-stone-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-xl py-8 flex flex-col items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors"
                  >
                    <ImagePlus size={28} />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">PNG or JPG, max 5MB</span>
                  </button>
                )}
              </div>
            </div>

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
