import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EventsMain from '../assets/images/EventsMain.jpg';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  sort_order: number;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <section className="relative pt-32 pb-20 bg-stone-900 overflow-hidden">
        <img
          src={EventsMain}
          alt="Community event"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Events & Programs</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 max-w-2xl leading-tight">
            Events & Programs
          </h1>
          <p className="text-stone-300 mt-4 text-lg max-w-xl">
            Join us in making music education accessible to every student.
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
                  <div className="flex items-start gap-2.5 text-stone-500 text-sm">
                    <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
