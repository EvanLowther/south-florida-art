import { useState } from 'react';
import { CheckCircle, DollarSign, Guitar, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

const INSTRUMENT_TYPES = [
  'Violin',
  'Viola',
  'Cello',
  'Double Bass',
  'Flute',
  'Clarinet',
  'Oboe',
  'Bassoon',
  'Alto Saxophone',
  'Tenor Saxophone',
  'Trumpet',
  'French Horn',
  'Trombone',
  'Euphonium / Baritone',
  'Tuba',
  'Percussion Kit',
  'Snare Drum',
  'Marimba / Xylophone',
  'Acoustic Guitar',
  'Piano / Keyboard',
  'Other',
];

interface FormState {
  name: string;
  email: string;
  instrument_type: string;
  condition_description: string;
}

export default function Donate() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    instrument_type: '',
    condition_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('instrument_inquiries').insert({
      name: form.name,
      email: form.email,
      instrument_type: form.instrument_type,
      condition_description: form.condition_description,
    });

    setLoading(false);
    if (err) {
      setError('Something went wrong submitting your inquiry. Please try again.');
    } else {
      setSuccess(true);
    }
  };

  const donationAmounts = [25, 50, 100, 250, 500, 1000];

  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-20 bg-stone-900 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Students in music class"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Give</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 max-w-2xl leading-tight">
            Support Music Education
          </h1>
          <p className="text-stone-300 mt-4 text-lg max-w-xl">
            Two powerful ways to make a lasting difference in a student's life.
          </p>
        </div>
      </section>

      <div className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">

          {/* Financial Giving */}
          <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
                <DollarSign size={22} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Financial Contribution</h2>
                <p className="text-xs text-stone-500">Fully tax-deductible</p>
              </div>
            </div>

            <p className="text-stone-600 leading-relaxed text-sm mb-8">
              Financial contributions directly fund instrument maintenance, replacement parts — reeds, strings, bows, valve oil — and the logistics infrastructure that gets instruments to students quickly. They also fuel new school partnerships and program expansion in under-served districts.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {donationAmounts.map((amt) => (
                <button
                  key={amt}
                  className="py-3 border-2 border-stone-200 text-stone-700 font-semibold rounded-xl hover:border-amber-500 hover:text-amber-600 transition-colors text-sm"
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex gap-2.5 items-start">
                <Info size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-800 text-xs leading-relaxed">
                  Secure payment processing is handled by our verified payment partner. Your financial data is never stored on our servers. All donations are acknowledged with a tax receipt within 48 hours.
                </p>
              </div>
            </div>

            <button className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm">
              Proceed to Secure Checkout
            </button>
            <p className="text-center text-xs text-stone-400 mt-3">Powered by Stripe · SSL Encrypted</p>
          </div>

          {/* Instrument Donation */}
          <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center">
                <Guitar size={22} className="text-sky-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Donate an Instrument</h2>
                <p className="text-xs text-stone-500">Submit a logistics inquiry</p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-5 mb-7 text-sm text-stone-600 leading-relaxed space-y-2">
              <p className="font-semibold text-stone-800">What we accept:</p>
              <ul className="list-disc list-inside space-y-1 text-stone-500">
                <li>Band and orchestral instruments in playable or repairable condition</li>
                <li>Cases, bows, mouthpieces, and accessories welcome</li>
                <li>No instruments that require complete structural rebuilds</li>
              </ul>
              
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <CheckCircle size={40} className="text-emerald-500" />
                <h3 className="text-lg font-bold text-stone-900">Inquiry Received!</h3>
                <p className="text-stone-500 text-sm max-w-xs">
                  Thank you for your generosity. Our team will reach out within 1–2 business days to coordinate your donation.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-sm text-amber-600 font-medium hover:underline"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                      Full Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@email.com"
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                    Instrument Type *
                  </label>
                  <select
                    name="instrument_type"
                    value={form.instrument_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500 transition-colors text-sm bg-white"
                  >
                    <option value="">Select instrument type...</option>
                    {INSTRUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                    Condition Description
                  </label>
                  <textarea
                    name="condition_description"
                    value={form.condition_description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the instrument's condition, any known repairs needed, and whether the case is included..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60"
                >
                  {loading ? 'Submitting...' : 'Submit Instrument Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
