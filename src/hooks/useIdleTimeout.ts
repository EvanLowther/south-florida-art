import { useEffect, useRef, useState } from 'react';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const WARNING_MS = 30 * 1000;

export function useIdleTimeout(signOut: () => void) {
  const [showWarning, setShowWarning] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  };

  const resetTimer = () => {
    clearTimers();
    setShowWarning(false);

    warningTimer.current = setTimeout(() => setShowWarning(true), IDLE_TIMEOUT_MS - WARNING_MS);
    idleTimer.current = setTimeout(() => {
      setShowWarning(false);
      signOut();
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimers();
    };
  }, []);

  const stay = () => {
    setShowWarning(false);
    resetTimer();
  };

  return { showWarning, stay, signOutNow: signOut };
}
