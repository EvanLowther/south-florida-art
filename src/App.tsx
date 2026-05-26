import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Donate from './pages/Donate';

type Page = 'home' | 'about' | 'events' | 'donate';

const pathToPage = (): Page => {
  const path = window.location.pathname.slice(1);
  if (path === 'about') return 'about';
  if (path === 'events') return 'events';
  if (path === 'donate') return 'donate';
  return 'home';
};

const pageTitles: Record<Page, string> = {
  home: 'South Florida Arts Foundation — Music For Every Student',
  about: 'About Us — South Florida Arts Foundation',
  events: 'Events & Programs — South Florida Arts Foundation',
  donate: 'Donate — South Florida Arts Foundation',
};

export default function App() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={page} onNavigate={navigate} />
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'about' && <About onNavigate={navigate} />}
        {page === 'events' && <Events onNavigate={navigate} />}
        {page === 'donate' && <Donate />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
