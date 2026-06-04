import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthMFAEnrollResponse, AuthMFAListFactorsResponse, AuthMFAChallengeResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  mfaEnroll: () => Promise<AuthMFAEnrollResponse['data'] | null>;
  mfaChallenge: (factorId: string) => Promise<string | null>;
  mfaVerify: (factorId: string, challengeId: string, code: string) => Promise<boolean>;
  hasMfaFactors: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const mfaEnroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) return null;
    return data;
  };

  const mfaChallenge = async (factorId: string) => {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) return null;
    return data.id;
  };

  const mfaVerify = async (factorId: string, challengeId: string, code: string) => {
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) return false;
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s) {
      setSession(s);
      setUser(s.user ?? null);
    }
    return true;
  };

  const hasMfaFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return false;
    return data.all.some((f) => f.status === 'verified');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, mfaEnroll, mfaChallenge, mfaVerify, hasMfaFactors }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
