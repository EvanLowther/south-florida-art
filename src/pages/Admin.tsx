import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar, ChevronDown, DollarSign, LayoutDashboard, LogOut, Mail,
  PackageOpen, ClipboardList, Trash2,
} from 'lucide-react';
import AdminEvents from './AdminEvents';
import AdminSignups from './AdminSignups';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

async function adminFetch(action: string, body: Record<string, unknown> = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...body }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

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
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const [adminAuthorized, setAdminAuthorized] = useState(false);

  const [eventCount, setEventCount] = useState(0);
  const [signupCount, setSignupCount] = useState(0);

  useEffect(() => {
    adminFetch('check')
      .then(() => setAdminAuthorized(true))
      .catch(() => setAdminAuthorized(false))
      .finally(() => setAdminCheckDone(true));
  }, []);

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
    try {
      await adminFetch('update_inquiry_status', { id, status });
    } catch {
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
    const action = table === 'instrument_inquiries' ? 'delete_inquiry' : 'delete_subscription';
    if (table === 'instrument_inquiries') {
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } else {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }

    try {
      await adminFetch(action, { id });
    } catch {
      window.location.reload();
    }
    setDeletingId(null);
  };

  const loadData = useCallback(() => {
    setLoading(true);

    if (tab === 'dashboard') {
      Promise.all([
        adminFetch('get_inquiries'),
        adminFetch('get_donations'),
        adminFetch('get_subscriptions'),
      ]).then(([inqData, donData, subData]) => {
        setInquiries(inqData.data as Inquiry[]);
        setDonations(donData.data as Donation[]);
        setSubscriptions(subData.data as Subscription[]);
        setEventCount(0);
        setSignupCount(0);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else if (tab === 'inquiries') {
      adminFetch('get_inquiries')
        .then((res) => setInquiries(res.data as Inquiry[]))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === 'financial') {
      adminFetch('get_donations')
        .then((res) => setDonations(res.data as Donation[]))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (tab === 'emails') {
      adminFetch('get_subscriptions')
        .then((res) => setSubscriptions(res.data as Subscription[]))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (adminAuthorized) loadData();
  }, [loadData, adminAuthorized]);

  useEffect(() => {
    if (tab === 'financial' && adminAuthorized) {
      const interval = setInterval(loadData, 15000);
      return () => clearInterval(interval);
    }
  }, [tab, loadData, adminAuthorized]);

  const totalDonations = donations.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0);
  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  if (!adminCheckDone) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><p className="text-stone-400 text-sm">Verifying access...</p></div>;
  }

  if (!adminAuthorized) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Access Denied</h1>
          <p className="text-sm text-stone-500 mb-6">Your account is not authorized to access the admin panel.</p>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

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
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${donationStatusStyles[d.status] ?? ''}`}>
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-stone-500 whitespace-nowrap">
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
          <div className="text-center py-20 text-stone-400 text-sm">No newsletter subscriptions yet.</div>
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
                    <th className="text-center px-6 py-4 font-semibold text-stone-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub, i) => (
                    <tr key={sub.id} className="border-b border-stone-50 last:border-0">
                      <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                      <td className="px-6 py-4 text-stone-900">{sub.email}</td>
                      <td className="px-6 py-4 text-right text-stone-500 whitespace-nowrap">
                        {formatDate(sub.subscribed_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col shrink-0">
        <div className="px-5 pt-8 pb-6 border-b border-stone-800">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors text-left ${
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
        <div className="p-3 border-t border-stone-800">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-stone-500 mb-2 truncate">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
            {user?.email}
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
