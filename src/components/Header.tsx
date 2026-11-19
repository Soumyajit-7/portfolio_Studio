import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { UI_COPY } from '../data/translations';
import { useLanguage, type Language } from '../lib/i18n';

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
  const { lang, setLang } = useLanguage();

  // Keep Owner Portal / CRM strictly in English
  const effectiveLang: Language = activeView === 'dashboard' ? 'en' : lang;
  const t = UI_COPY[effectiveLang].header;

  // Show opposite-language hint overlay on every page entry (portfolio view only)
  const [showLangHint, setShowLangHint] = useState<boolean>(activeView === 'portfolio');

  useEffect(() => {
    if (activeView === 'dashboard') {
      setShowLangHint(false);
    }
  }, [activeView]);

  const handleSelectLang = (next: Language) => {
    setLang(next);
    setShowLangHint(false);
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
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
            {t.work}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('story')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            {t.story}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('ventures')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            {t.choreosLife}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contact')}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4"
          >
            {t.contact}
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

        {/* Zone 3: Language switch + Theme toggle + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeView === 'portfolio' && (
            <div className="relative">
              <div
                role="group"
                aria-label={t.langSwitchAria}
                className="inline-flex items-center h-10 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono"
              >
                <button
                  type="button"
                  onClick={() => handleSelectLang('en')}
                  aria-pressed={lang === 'en'}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lang === 'en'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLang('de')}
                  aria-pressed={lang === 'de'}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lang === 'de'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  DE
                </button>
              </div>

              {/* Small anchored language-switch info overlay (opposite language to current site) */}
              <AnimatePresence>
                {showLangHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    role="status"
                    aria-live="polite"
                    className="absolute -right-16 sm:right-0 mt-3 w-[min(19rem,calc(100vw-2rem))] sm:w-80 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg p-3.5 text-left z-50"
                  >
                    {/* Upward pointer caret */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 right-[5.5rem] sm:right-6 h-3 w-3 rotate-45 border-l border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                    <div className="relative flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-200">
                          {t.langHintBody}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectLang(lang === 'en' ? 'de' : 'en')}
                          className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {t.langHintAction}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLangHint(false)}
                        aria-label={t.langHintDismiss}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? t.themeLight : t.themeDark}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contact')}
            className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.bookChat}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={t.menuToggle}
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
            {t.work}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('story')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {t.story}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('ventures')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {t.choreosLife}
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('contact')}
            className="w-full text-left px-3 py-3 text-sm font-medium rounded-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {t.contactBooking}
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
