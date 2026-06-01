import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, DollarSign, LogOut, Mail, PackageOpen, Trash2 } from 'lucide-react';

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

interface Donation {
  id: string;
  stripe_session_id: string;
  amount: number;
  donor_name: string | null;
  donor_email: string | null;
  status: string;
  created_at: string;
}

type Tab = 'inquiries' | 'financial' | 'emails';

const statusStyles: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const donationStatusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-red-50 text-red-700 border-red-200',
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

const statusOptions = ['new', 'contacted', 'completed', 'cancelled'];

export default function Admin() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const prev = inquiries.find((i) => i.id === id)?.status;
    setInquiries((prevInq) =>
      prevInq.map((i) => (i.id === id ? { ...i, status } : i))
    );
    setOpenDropdown(null);
    const { error } = await supabase
      .from('instrument_inquiries')
      .update({ status })
      .eq('id', id);
    if (error) {
      setInquiries((prevInq) =>
        prevInq.map((i) => (i.id === id ? { ...i, status: prev ?? i.status } : i))
      );
    }
  };

  const handleDelete = async (table: string, id: string, label: string) => {
    const msg = table === 'instrument_inquiries'
      ? `Are you sure you want to delete this inquiry from ${label}?`
      : `Are you sure you want to delete this subscription from ${label}?`;
    if (!window.confirm(msg)) return;

    setDeletingId(id);
    if (table === 'instrument_inquiries') {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } else {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      location.reload();
    }
    setDeletingId(null);
  };

  const loadData = useCallback(() => {
    if (tab === 'inquiries') {
      setLoading(true);
      supabase
        .from('instrument_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setInquiries(data as Inquiry[]);
          setLoading(false);
        });
    } else if (tab === 'financial') {
      setLoading(true);
      supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setDonations(data as Donation[]);
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

  useEffect(() => {
    loadData();
    if (tab === 'financial') {
      const interval = setInterval(loadData, 15000);
      return () => clearInterval(interval);
    }
  }, [loadData, tab]);

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
            onClick={() => setTab('inquiries')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'inquiries'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600'
            }`}
          >
            <PackageOpen size={16} />
            Instrument Inquiries
          </button>
          <button
            onClick={() => setTab('financial')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === 'financial'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600'
            }`}
          >
            <DollarSign size={16} />
            Financial Donations
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
        ) : tab === 'inquiries' ? (
          inquiries.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-sm">No instrument inquiries yet.</div>
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
                  <div className="flex items-center justify-between">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === inq.id ? null : inq.id)}
                        className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                          statusStyles[inq.status] ?? 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                        <ChevronDown size={12} />
                      </button>
                      {openDropdown === inq.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 z-10 w-36 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          {statusOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleStatusChange(inq.id, opt)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                opt === inq.status
                                  ? 'text-stone-400 cursor-not-allowed'
                                  : 'text-stone-700 hover:bg-stone-50'
                              }`}
                              disabled={opt === inq.status}
                            >
                              {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete('instrument_inquiries', inq.id, inq.name)}
                      disabled={deletingId === inq.id}
                      className="text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'financial' ? (
          donations.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-sm">No financial donations yet.</div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left px-6 py-4 font-semibold text-stone-700">#</th>
                    <th className="text-left px-6 py-4 font-semibold text-stone-700">Name</th>
                    <th className="text-left px-6 py-4 font-semibold text-stone-700">Email</th>
                    <th className="text-right px-6 py-4 font-semibold text-stone-700">Amount</th>
                    <th className="text-center px-6 py-4 font-semibold text-stone-700">Status</th>
                    <th className="text-right px-6 py-4 font-semibold text-stone-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d, i) => (
                    <tr key={d.id} className="border-b border-stone-50 last:border-0">
                      <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                      <td className="px-6 py-4 text-stone-900">{d.donor_name ?? '—'}</td>
                      <td className="px-6 py-4 text-stone-600">{d.donor_email ?? '—'}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        ${(d.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${donationStatusStyles[d.status] ?? 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-stone-500">
                        {formatDate(d.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <th className="w-16"></th>
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
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete('newsletter_subscriptions', sub.id, sub.email)}
                        disabled={deletingId === sub.id}
                        className="text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
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
