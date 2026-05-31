import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Mail, PackageOpen } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  instrument_type: string;
  condition_description: string | null;
  status: string;
  created_at: string;
}

interface Subscription {
  id: string;
  email: string;
  subscribed_at: string;
}

type Tab = 'donations' | 'emails';

const statusStyles: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

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

export default function Admin() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('donations');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === 'donations') {
      setLoading(true);
      supabase
        .from('instrument_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setInquiries(data as Inquiry[]);
          setLoading(false);
        });
    } else {
      setLoading(true);
      supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setSubscriptions(data as Subscription[]);
          setLoading(false);
        });
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Admin Dashboard</h1>
            <p className="text-sm text-stone-500 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-amber-600 font-medium hover:underline"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('donations')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'donations'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600'
            }`}
          >
            <PackageOpen size={16} />
            Donation Inquiries
          </button>
          <button
            onClick={() => setTab('emails')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'emails'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600'
            }`}
          >
            <Mail size={16} />
            Newsletter Subscriptions
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400 text-sm">Loading...</div>
        ) : tab === 'donations' ? (
          inquiries.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-sm">No donation inquiries yet.</div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">{inq.name}</h3>
                      <p className="text-sm text-amber-600">{inq.email}</p>
                    </div>
                    <span className="text-xs text-stone-400 shrink-0 ml-4">
                      {formatDate(inq.created_at)}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-stone-600 mb-4">
                    <p>
                      <span className="font-medium text-stone-800">Instrument:</span>{' '}
                      {inq.instrument_type}
                    </p>
                    {inq.condition_description && (
                      <p>
                        <span className="font-medium text-stone-800">Condition:</span>{' '}
                        {inq.condition_description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-block text-xs font-medium px-3 py-1 rounded-full border ${
                      statusStyles[inq.status] ?? 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20 text-stone-400 text-sm">No subscribers yet.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-6 py-4 font-semibold text-stone-700">#</th>
                  <th className="text-left px-6 py-4 font-semibold text-stone-700">Email</th>
                  <th className="text-right px-6 py-4 font-semibold text-stone-700">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, i) => (
                  <tr key={sub.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                    <td className="px-6 py-4 text-stone-900">{sub.email}</td>
                    <td className="px-6 py-4 text-right text-stone-500">
                      {formatDate(sub.subscribed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
