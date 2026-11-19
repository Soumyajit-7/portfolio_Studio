import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, Instagram, Linkedin } from 'lucide-react';
import {
  PORTFOLIO_ASSETS,
  PROFILE_LINKS,
  type SocialMilestone,
} from '../data/portfolioData';
import {
  getAdventureSnapshots,
  getCurrentFocus,
  getDefaultSocialMilestones,
  UI_COPY,
} from '../data/translations';
import { useLanguage } from '../lib/i18n';

interface ActivityPulseProps {
  socialUpdates: SocialMilestone[];
}

export function ActivityPulse({ socialUpdates }: ActivityPulseProps) {
  const { lang } = useLanguage();
  const t = UI_COPY[lang].ventures;
  const currentFocusItems = getCurrentFocus(lang);
  const adventureSnapshots = getAdventureSnapshots(lang);
  const defaultMilestones = getDefaultSocialMilestones(lang);

  const [socialFilter, setSocialFilter] = useState<'all' | 'instagram' | 'linkedin'>('all');
  const choreosRef = useRef<HTMLDivElement>(null);
  const adventureRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: choreosScroll } = useScroll({
    target: choreosRef,
    offset: ['start end', 'end start'],
  });
  const choreosImageScale = useTransform(choreosScroll, [0, 0.5, 1], [1.06, 1, 1.04]);

  const { scrollYProgress: adventureScroll } = useScroll({
    target: adventureRef,
    offset: ['start end', 'end start'],
  });
  const reelParallax = useTransform(adventureScroll, [0, 1], [18, -18]);

  const combinedSocial = socialUpdates.length > 0 ? socialUpdates : defaultMilestones;
  const visibleSocial =
    socialFilter === 'all'
      ? combinedSocial
      : combinedSocial.filter((item) => item.platform === socialFilter);

  return (
    <section
      id="ventures"
      className="py-20 border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20"
    >
      {/* Part 1: Startup Spotlight (Choreos Labs) & Current Focus */}
      <div ref={choreosRef}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">{t.kicker1}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t.headline1}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={PROFILE_LINKS.choreosGithub}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              github.com/choreoslabs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href={PROFILE_LINKS.choreosLabs}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              choreoslabs.com
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Choreos Labs Showcase Card — strictly one Choreos Labs picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={PORTFOLIO_ASSETS.choreosLogo}
                  alt="Choreos Labs emblem"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                />
                <div>
                  <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Choreos Labs Pvt. Ltd.
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {t.choreosSub}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                {t.choreosP1Before}
                <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Inference</strong>
                {t.choreosP1After}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.choreosP2}
              </p>
            </div>

            <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <span>Kotlin Native Android</span>
              <span>Python + PostgreSQL + Redis</span>
              <span>Docker on Google Cloud</span>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[320px] lg:min-h-[420px] overflow-hidden bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800">
            <motion.img
              style={{ scale: choreosImageScale }}
              src={PORTFOLIO_ASSETS.choreosShowcase}
              alt="Choreos Labs Inference tactical cognitive game view"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <p className="absolute bottom-4 left-5 right-5 text-xs font-mono text-zinc-200">
              {t.choreosImageCaption}
            </p>
          </div>
        </motion.div>

        {/* Currently Working On Strip */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentFocusItems.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-2"
            >
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{item.tag}</p>
              <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Part 2: Sports, Extreme Adventure & Travel + Live Social Feed */}
      <div ref={adventureRef}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">{t.kicker2}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t.headline2}
            </h2>
          </div>

          <a
            href={PROFILE_LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Instagram className="w-3.5 h-3.5" />
            {t.seeFullFeed}
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Adventure & Sports Photo Reel with subtle scroll parallax */}
          <motion.div
            style={{ y: reelParallax }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {adventureSnapshots.map((snap, idx) => (
              <motion.a
                key={snap.id}
                href={snap.instagramUrl}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.42, delay: idx * 0.06 }}
                className={`group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col ${
                  idx === 0 ? 'sm:col-span-2' : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-zinc-900 ${
                    idx === 0 ? 'aspect-[16/9]' : 'aspect-[4/4]'
                  }`}
                >
                  <img
                    src={snap.imageUrl}
                    alt={snap.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                      idx === 0 ? 'object-center' : 'object-top'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <p className="absolute bottom-3 left-4 right-4 text-xs font-mono text-zinc-200">
                    {snap.tag} · {snap.location}
                  </p>
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {snap.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {snap.caption}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Right 5 columns: Live Social Dispatches (LinkedIn + Instagram) */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.recentNotes}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.syncedSub}</p>
                </div>

                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  {(['all', 'instagram', 'linkedin'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSocialFilter(tab)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                        socialFilter === tab
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab === 'all' ? t.tabAll : tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 mt-2">
                {visibleSocial.map((item) => (
                  <a
                    key={item.id}
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block py-4 group"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                        {item.platform === 'instagram' ? (
                          <Instagram className="w-3.5 h-3.5" />
                        ) : (
                          <Linkedin className="w-3.5 h-3.5" />
                        )}
                        {item.platform === 'instagram' ? 'Instagram' : 'LinkedIn'}
                        <span aria-hidden="true">·</span>
                        {item.category}
                      </span>
                      <span className="font-mono tabular-nums">{item.dateLabel}</span>
                    </div>
                    <h4 className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                      {item.caption}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <a
                href={PROFILE_LINKS.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Instagram className="w-3.5 h-3.5" />
                @fr_soumyajit
              </a>
              <a
                href={PROFILE_LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Linkedin className="w-3.5 h-3.5" />
                {t.linkedinProfile}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
