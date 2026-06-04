import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Signup {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
}

export default function AdminSignups() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEventId, setFilterEventId] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);

    const eventPromise = supabase
      .from('events')
      .select('id, title')
      .order('sort_order', { ascending: true })
      .then(({ data }) => data as Event[] || []);

    const signupPromise = supabase
      .from('event_signups')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => data as Signup[] || []);

    Promise.all([eventPromise, signupPromise]).then(([eventsData, signupsData]) => {
      setEvents(eventsData);
      setSignups(signupsData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSignups = filterEventId
    ? signups.filter(s => s.event_id === filterEventId)
    : signups;

  const getEventTitle = (eventId: string) =>
    events.find(e => e.id === eventId)?.title || 'Unknown Event';

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-stone-900 mb-6">Event Signups</h2>

      <div className="mb-6">
        <select
          value={filterEventId}
          onChange={(e) => setFilterEventId(e.target.value)}
          className="w-full sm:w-72 px-4 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:border-amber-500 transition-colors"
        >
          <option value="">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">Loading signups...</div>
      ) : filteredSignups.length === 0 ? (
        <div className="text-center py-20 text-stone-400 text-sm">
          {filterEventId ? 'No signups for this event yet.' : 'No signups yet.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-4 font-semibold text-stone-700">#</th>
                <th className="text-left px-6 py-4 font-semibold text-stone-700">Event</th>
                <th className="text-left px-6 py-4 font-semibold text-stone-700">First Name</th>
                <th className="text-left px-6 py-4 font-semibold text-stone-700">Last Name</th>
                <th className="text-left px-6 py-4 font-semibold text-stone-700">Email</th>
                <th className="text-right px-6 py-4 font-semibold text-stone-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignups.map((s, i) => (
                <tr key={s.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                  <td className="px-6 py-4 text-stone-900 font-medium">
                    {getEventTitle(s.event_id)}
                  </td>
                  <td className="px-6 py-4 text-stone-700">{s.first_name}</td>
                  <td className="px-6 py-4 text-stone-700">{s.last_name}</td>
                  <td className="px-6 py-4 text-stone-600">{s.email}</td>
                  <td className="px-6 py-4 text-right text-stone-500 whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
