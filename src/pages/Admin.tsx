import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar, ChevronDown, DollarSign, LayoutDashboard, LogOut, Mail,
  PackageOpen, ClipboardList, Trash2,
} from 'lucide-react';
import AdminEvents from './AdminEvents';
import AdminSignups from './AdminSignups';

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

type Tab = 'dashboard' | 'events' | 'signups' | 'inquiries' | 'financial' | 'emails';

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

const sidebarItems: { tab: Tab; label: string; icon: React.ReactNode }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { tab: 'events', label: 'Events Management', icon: <Calendar size={18} /> },
  { tab: 'signups', label: 'Event Signups', icon: <ClipboardList size={18} /> },
  { tab: 'inquiries', label: 'Instrument Inquiries', icon: <PackageOpen size={18} /> },
  { tab: 'financial', label: 'Financial Donations', icon: <DollarSign size={18} /> },
  { tab: 'emails', label: 'Newsletter Subscriptions', icon: <Mail size={18} /> },
];

export default function Admin() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Dashboard stats
  const [eventCount, setEventCount] = useState(0);
  const [signupCount, setSignupCount] = useState(0);

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
    } else if (tab === 'dashboard') {
      setLoading(true);
      Promise.all([
        supabase.from('events').select('*'),
        supabase.from('event_signups').select('*'),
        supabase.from('instrument_inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('donations').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscriptions').select('*').order('subscribed_at', { ascending: false }),
      ]).then(([eventsRes, signupsRes, inquiriesRes, donationsRes, subsRes]) => {
        if (!eventsRes.error && eventsRes.data) setEventCount(eventsRes.data.length);
        if (!signupsRes.error && signupsRes.data) setSignupCount(signupsRes.data.length);
        if (!inquiriesRes.error && inquiriesRes.data) setInquiries(inquiriesRes.data as Inquiry[]);
        if (!donationsRes.error && donationsRes.data) setDonations(donationsRes.data as Donation[]);
        if (!subsRes.error && subsRes.data) setSubscriptions(subsRes.data as Subscription[]);
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

  const totalDonations = donations.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0);
  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-20 text-stone-400 text-sm">Loading...</div>;
    }

    switch (tab) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <p className="text-3xl font-bold text-amber-600">{eventCount}</p>
                <p className="text-sm text-stone-500 mt-1">Events</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <p className="text-3xl font-bold text-amber-600">{signupCount}</p>
                <p className="text-sm text-stone-500 mt-1">Event Signups</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <p className="text-3xl font-bold text-amber-600">{inquiries.length}</p>
                <p className="text-sm text-stone-500 mt-1">Total Inquiries</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <p className="text-3xl font-bold text-amber-600">{newInquiries}</p>
                <p className="text-sm text-stone-500 mt-1">New Inquiries</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <p className="text-3xl font-bold text-amber-600">
                  ${(totalDonations / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-stone-500 mt-1">Donations Collected</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <p className="text-3xl font-bold text-amber-600">{subscriptions.length}</p>
                <p className="text-sm text-stone-500 mt-1">Subscribers</p>
              </div>
            </div>
          </div>
        );

      case 'events':
        return <AdminEvents />;

      case 'signups':
        return <AdminSignups />;

      case 'inquiries':
        return inquiries.length === 0 ? (
          <div className="text-center py-20 text-stone-400 text-sm">No instrument inquiries yet.</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Instrument Inquiries</h2>
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
        );

      case 'financial':
        return donations.length === 0 ? (
          <div className="text-center py-20 text-stone-400 text-sm">No financial donations yet.</div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-4">Financial Donations</h2>
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
          </div>
        );

      case 'emails':
        return subscriptions.length === 0 ? (
          <div className="text-center py-20 text-stone-400 text-sm">No subscribers yet.</div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-stone-900 mb-4">Newsletter Subscriptions</h2>
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
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-stone-700">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <p className="text-xs text-stone-500 mt-1 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                tab === item.tab
                  ? 'bg-amber-600 text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-700">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 pt-24 pb-16">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
