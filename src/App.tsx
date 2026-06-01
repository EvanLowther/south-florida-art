import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Donate from './pages/Donate';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { useAuth } from './contexts/AuthContext';

type Page = 'home' | 'about' | 'events' | 'donate' | 'login' | 'admin';

const pathToPage = (): Page => {
  const path = window.location.pathname.slice(1);
  if (path === 'about') return 'about';
  if (path === 'events') return 'events';
  if (path === 'donate') return 'donate';
  if (path === 'login') return 'login';
  if (path === 'admin') return 'admin';
  return 'home';
};

const publicPages: Page[] = ['home', 'about', 'events', 'donate'];

const pageTitles: Record<Page, string> = {
  home: 'South Florida Arts Foundation — Music For Every Student',
  about: 'About Us — South Florida Arts Foundation',
  events: 'Events & Programs — South Florida Arts Foundation',
  donate: 'Donate — South Florida Arts Foundation',
  login: 'Admin Login — South Florida Arts Foundation',
  admin: 'Admin Dashboard — South Florida Arts Foundation',
};

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page>(pathToPage);

  const navigate = (target: string) => {
    const p = target as Page;
    setPage(p);
    window.history.pushState({ page: p }, '', p === 'home' ? '/' : `/${p}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      setPage(e.state?.page ?? pathToPage());
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    document.title = pageTitles[page];
  }, [page]);

  useEffect(() => {
    if (page === 'admin' && !authLoading && !user) {
      navigate('login');
    }
  }, [page, authLoading, user]);

  const isPublic = publicPages.includes(page);

  if (page === 'admin' && authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isPublic && <Header currentPage={page} onNavigate={navigate} />}
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'about' && <About />}
        {page === 'events' && <Events />}
        {page === 'donate' && <Donate />}
        {page === 'login' && <Login onNavigate={navigate} />}
        {page === 'admin' && user && <Admin />}
      </main>
      {isPublic && <Footer onNavigate={navigate} />}
    </div>
  );
}
