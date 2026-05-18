import { useState } from 'react';
import { Music2, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase
      .from('newsletter_subscriptions')
      .insert({ email });

    setLoading(false);
    if (err) {
      if (err.code === '23505') {
        setError("You're already subscribed.");
      } else {
        setError('Something went wrong. Please try again.');
      }
    } else {
      setSuccess(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <Music2 size={16} className="text-white" />
            </div>
            <span className="font-semibold text-white text-base">South Florida Arts Foundation</span>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
            Connecting generous donors with students who deserve the gift of music.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">Contact Us</h3>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-3">
              <Mail size={15} className="text-amber-500 mt-0.5 shrink-0" />
              <span>hello@FOUNDATIONEMAIL.org</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={15} className="text-amber-500 mt-0.5 shrink-0" />
              <span>(555) 555-5555 </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-2">Join Our Community</h3>
          <p className="text-sm text-stone-400 mb-5 leading-relaxed">
            Receive quarterly updates on our impact, student stories, and upcoming instrument drives.
          </p>

          {success ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle size={16} />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="flex-1 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5 text-sm font-medium"
                >
                  {loading ? '...' : <><Send size={14} /> Subscribe</>}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <span>© 2026 Noteworthy Foundation. All rights reserved. 501(c)(3) Non-Profit Organization.</span>
          <div className="flex gap-5">
            {['home', 'about', 'donate'].map((p) => (
              <button key={p} onClick={() => onNavigate(p)} className="capitalize hover:text-stone-300 transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
