import { useState, useEffect } from 'react';
import { Music2, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'donate', label: 'Donate' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center transition-transform group-hover:scale-105">
            <Music2 size={18} className="text-white" />
          </div>
          <span className={`font-semibold text-lg tracking-tight transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
            South Florida Arts Foundation
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-sm font-medium tracking-wide transition-colors ${
                currentPage === item.id
                  ? scrolled ? 'text-amber-600' : 'text-amber-300'
                  : scrolled ? 'text-stone-600 hover:text-stone-900' : 'text-white/80 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => onNavigate('donate')}
            className="ml-2 px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition-colors"
          >
            Give Now
          </button>
        </nav>

        <button
          className={`md:hidden transition-colors ${scrolled ? 'text-stone-700' : 'text-white'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`text-left text-sm font-medium ${
                currentPage === item.id ? 'text-amber-600' : 'text-stone-600'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { onNavigate('donate'); setMobileOpen(false); }}
            className="w-full py-2.5 bg-amber-600 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition-colors"
          >
            Give Now
          </button>
        </div>
      )}
    </header>
  );
}
