import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  activeView: 'portfolio' | 'dashboard';
  onChangeView: (view: 'portfolio' | 'dashboard') => void;
  showAdminLink: boolean;
}

export function Header({
  isDark,
  onToggleTheme,
  activeView,
  onChangeView,
  showAdminLink,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigateToSection = (sectionId: string) => {
    setMobileOpen(false);
    if (activeView !== 'portfolio') {
      onChangeView('portfolio');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => {
            onChangeView('portfolio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          Soumyajit Biswas
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => navigateToSection('work')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            Work
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('story')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            Story
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('ventures')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            Choreos & Life
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contact')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            Contact
          </button>
          {(showAdminLink || activeView === 'dashboard') && (
            <button
              type="button"
              onClick={() => {
                onChangeView(activeView === 'dashboard' ? 'portfolio' : 'dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4 ${
                activeView === 'dashboard'
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Lead Dashboard
            </button>
          )}
        </nav>

        {/* Zone 3: Theme toggle + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contact')}
            className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book a Chat
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden h-11 w-11 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => navigateToSection('work')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Work
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('story')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Story
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('ventures')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Choreos & Life
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contact')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Contact & Booking
          </button>
          {(showAdminLink || activeView === 'dashboard') && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onChangeView(activeView === 'dashboard' ? 'portfolio' : 'dashboard');
              }}
              className="w-full text-left px-3 py-3 text-sm font-semibold rounded-lg text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {activeView === 'dashboard' ? 'Back to Portfolio' : 'Lead Dashboard'}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
