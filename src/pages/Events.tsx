import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EventsMain from '../assets/images/EventsMain.jpg';

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

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const signupEvents = events.filter(e => e.has_signup_button);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setEvents(data as Event[]);
        }
        setLoading(false);
      });
  }, []);

  const openSignupModal = (eventId?: string) => {
    setSelectedEventId(eventId || '');
    setFirstName('');
    setLastName('');
    setEmail('');
    setModalError('');
    setModalSuccess(false);
    setShowModal(true);
  };

  const handleSignupSubmit = async () => {
    if (!selectedEventId || !firstName.trim() || !lastName.trim() || !email.trim()) {
      setModalError('All fields are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setModalError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/admin-create-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            event_id: selectedEventId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setModalError(data.error || 'Failed to submit signup.');
        setSubmitting(false);
        return;
      }

      setModalSuccess(true);
    } catch {
      setModalError('Network error. Please try again.');
    }

    setSubmitting(false);
  };

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900 overflow-hidden">
        <img
          src={EventsMain}
          alt="Community event"
          className="absolute inset-0 w-full h-full object-cover object-[50%_45%] opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Events & Programs</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 max-w-2xl leading-tight">
            Events & Programs
          </h1>
          <p className="text-stone-300 mt-4 text-lg max-w-xl">
            Explore our events and programs that connect students, empower artists, and strengthen the arts community.
          </p>
        </div>
      </section>

      <section className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {loading ? (
            <div className="text-center py-20 text-stone-400 text-sm">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-sm">No upcoming events at this time.</div>
          ) : (
            events.map((event, i) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden grid md:grid-cols-2"
              >
                <div className={`relative aspect-[4/3] md:aspect-auto ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-amber-600 text-xs font-semibold uppercase tracking-widest">
                    {event.date}
                  </span>
                  <h2 className="text-2xl font-bold text-stone-900 mt-2 mb-4 leading-snug">
                    {event.title}
                  </h2>
                  <p className="text-stone-600 leading-relaxed text-sm mb-6">
                    {event.description}
                  </p>
                  <div className="flex items-start gap-2.5 text-stone-500 text-sm mb-6">
                    <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  {event.has_signup_button && (
                    <div>
                      <button
                        onClick={() => openSignupModal(event.id)}
                        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                      >
                        Get Involved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Signup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">Get Involved</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalSuccess ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-stone-900 font-semibold text-lg">You're signed up!</p>
                <p className="text-stone-500 text-sm mt-1">
                  We'll be in touch with more details.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {modalError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {modalError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                    Event / Program *
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  >
                    <option value="">Select an event...</option>
                    {signupEvents.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                      First Name *
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                      Last Name *
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                  />
                </div>

                <button
                  onClick={handleSignupSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
