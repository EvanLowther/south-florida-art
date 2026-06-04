import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { signIn, hasMfaFactors, mfaChallenge, mfaVerify } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'mfa' | 'setup'>('credentials');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const err = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    const hasFactors = await hasMfaFactors();
    if (!hasFactors) {
      setStep('setup');
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.mfa.listFactors();
    const totpFactor = data?.all.find((f) => f.factor_type === 'totp' && f.status === 'verified');
    if (!totpFactor) {
      setError('No verified MFA factor found. Please contact support.');
      setLoading(false);
      return;
    }

    const challengeIdResult = await mfaChallenge(totpFactor.id);
    if (!challengeIdResult) {
      setError('Failed to start MFA challenge. Please try again.');
      setLoading(false);
      return;
    }

    setFactorId(totpFactor.id);
    setChallengeId(challengeIdResult);
    setStep('mfa');
    setLoading(false);
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!factorId || !challengeId || code.trim().length !== 6) {
      setError('Please enter a valid 6-digit code.');
      setLoading(false);
      return;
    }

    const ok = await mfaVerify(factorId, challengeId, code.trim());
    if (!ok) {
      setError('Invalid code. Make sure the time on your phone is correct.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onNavigate('admin');
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <SetupMfaForm onComplete={() => onNavigate('admin')} />
        </div>
      </div>
    );
  }

  if (step === 'mfa') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
            <h1 className="text-xl font-bold text-stone-900 mb-1">Two-Factor Authentication</h1>
            <p className="text-sm text-stone-500 mb-6">Enter the 6-digit code from Google Authenticator.</p>

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-colors text-sm disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Admin Login</h1>
          <p className="text-sm text-stone-500 mb-6">Sign in to manage submissions.</p>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function SetupMfaForm({ onComplete }: { onComplete: () => void }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [step, setStep] = useState<'enroll' | 'verify' | 'done'>('enroll');

  useEffect(() => {
    supabase.auth.mfa.enroll({ factorType: 'totp' }).then(({ data, error }) => {
      if (error || !data) {
        setError('Failed to start enrollment. Please try again.');
        return;
      }
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('verify');
      supabase.auth.mfa.challenge({ factorId: data.id }).then(({ data: challengeData }) => {
        if (challengeData) setChallengeId(challengeData.id);
      });
    });
  }, []);

  const handleVerify = async () => {
    if (!factorId || !challengeId || code.trim().length !== 6) return;
    setLoading(true);
    setError('');

    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId, code: code.trim() });
    if (verifyError) {
      setError('Invalid code. Make sure the time on your phone is correct.');
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.all.find((f) => f.id === factorId);
    const codes = factor?.recovery_codes;
    if (codes) setRecoveryCodes(codes);

    setStep('done');
    setLoading(false);
  };

  if (step === 'done') {
    return (
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Two-Factor Authentication Enabled</h1>
        <p className="text-sm text-stone-500 mb-6">Your account is now protected with Google Authenticator.</p>

        {recoveryCodes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-left">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">Recovery Codes</p>
            <p className="text-xs text-amber-700 mb-3">Save these somewhere safe. Each code can be used once if you lose access to your phone.</p>
            <div className="bg-white rounded-lg p-3 font-mono text-xs text-stone-700 space-y-1">
              {recoveryCodes.map((rc, i) => (
                <div key={i}>{rc}</div>
              ))}
            </div>
            <button
              onClick={() => {
                const text = recoveryCodes.join('\n');
                navigator.clipboard.writeText(text);
              }}
              className="mt-3 text-xs font-medium text-amber-700 hover:underline"
            >
              Copy to clipboard
            </button>
          </div>
        )}

        <button
          onClick={onComplete}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Continue to Admin Panel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
      <h1 className="text-xl font-bold text-stone-900 mb-1">Set Up Two-Factor Authentication</h1>
      <p className="text-sm text-stone-500 mb-6">
        Scan the QR code below with Google Authenticator, then enter the 6-digit code.
      </p>

      {qrCode && (
        <div className="flex justify-center mb-6">
          <img src={qrCode} alt="QR Code" className="w-48 h-48 border border-stone-200 rounded-xl" />
        </div>
      )}

      {secret && (
        <div className="bg-stone-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-xs text-stone-500 mb-1">Or enter this code manually:</p>
          <p className="font-mono text-sm font-bold text-stone-800 break-all select-all">{secret}</p>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-1.5">
              Authentication Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-semibold rounded-xl transition-colors text-sm disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </button>
        </div>
      )}

      {!qrCode && !error && (
        <p className="text-center text-stone-400 text-sm">Generating QR code...</p>
      )}

      {error && !qrCode && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
