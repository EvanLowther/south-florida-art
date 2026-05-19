import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Donate from './pages/Donate';

type Page = 'home' | 'about' | 'donate';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const navigate = (target: string) => {
    setPage(target as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const titles: Record<Page, string> = {
      home: 'South Florida Arts Foundation — Music For Every Student',
      about: 'About Us — South Florida Arts Foundation',
      donate: 'Donate — South Florida Arts Foundation',
    };
    document.title = titles[page];
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={page} onNavigate={navigate} />
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'about' && <About onNavigate={navigate} />}
        {page === 'donate' && <Donate />}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}
