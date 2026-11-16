import { useEffect, useState } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { ActivityPulse } from './components/ActivityPulse';
import { ChatbotWidget } from './components/ChatbotWidget';
import { ContactBooking } from './components/ContactBooking';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LeadDashboard } from './components/LeadDashboard';
import { MarqueeRibbon } from './components/MarqueeRibbon';
import { WorkSection } from './components/WorkSection';
import { type SocialMilestone } from './data/portfolioData';
import { db, isAdminUser, subscribeAuth } from './lib/firebase';

function PortfolioContent() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [activeView, setActiveView] = useState<'portfolio' | 'dashboard'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'dashboard';
    }
    return 'portfolio';
  });
  const [user, setUser] = useState<User | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [socialUpdates, setSocialUpdates] = useState<SocialMilestone[]>([]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem('sb-theme', next ? 'dark' : 'light');
      } catch {
        // Ignore storage restrictions
      }
      return next;
    });
  };

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveView('dashboard');
      }
    };
    window.addEventListener('hashchange', onHashChange);

    const unsubAuth = subscribeAuth((nextUser) => {
      setUser(nextUser);
    });

    const socialQuery = query(collection(db, 'social_updates'), orderBy('createdAt', 'desc'));
    const unsubSocial = onSnapshot(
      socialQuery,
      (snapshot) => {
        const items: SocialMilestone[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            platform: data.platform === 'instagram' ? 'instagram' : 'linkedin',
            title: String(data.title || ''),
            caption: String(data.caption || ''),
            dateLabel: String(data.dateLabel || ''),
            externalUrl: String(data.externalUrl || ''),
            category: String(data.category || ''),
          };
        });
        setSocialUpdates(items);
      },
      (err) => {
        console.warn('Social updates listener:', err.message);
      }
    );

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      unsubAuth();
      unsubSocial();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Scroll progress indicator */}
      <motion.div
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-blue-600 z-50 pointer-events-none"
      />

      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onChangeView={setActiveView}
        showAdminLink={isAdminUser(user)}
      />

      <main className="flex-1">
        {activeView === 'portfolio' ? (
          <>
            <Hero onOpenChat={() => setChatOpen(true)} />
            <MarqueeRibbon />
            <WorkSection />
            <ExperienceTimeline />
            <ActivityPulse socialUpdates={socialUpdates} />
            <ContactBooking user={user} onUserSignedIn={(u) => setUser(u)} />
          </>
        ) : (
          <LeadDashboard
            user={user}
            onUserChanged={(u) => setUser(u)}
            onBackToPortfolio={() => {
              if (window.location.hash === '#admin') {
                history.replaceState(null, '', window.location.pathname);
              }
              setActiveView('portfolio');
            }}
          />
        )}
      </main>

      <Footer onOpenDashboard={() => setActiveView('dashboard')} />

      <ChatbotWidget isOpen={chatOpen} onToggle={setChatOpen} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <PortfolioContent />
      </MotionConfig>
    </ErrorBoundary>
  );
}
