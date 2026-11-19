import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDownRight, Download, Instagram, Linkedin } from 'lucide-react';
import { PORTFOLIO_ASSETS, PROFILE_LINKS } from '../data/portfolioData';
import { UI_COPY } from '../data/translations';
import { useLanguage } from '../lib/i18n';

interface HeroProps {
  onOpenChat: () => void;
}

export function Hero({ onOpenChat }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const { lang } = useLanguage();
  const t = UI_COPY[lang].hero;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 68]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.88, 0.28]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const kpiY = useTransform(scrollYProgress, [0, 1], [0, -14]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left column: Human voice & intro */}
        <motion.div
          style={{ y: textY }}
          className="lg:col-span-7 flex flex-col justify-between py-4 relative z-10"
        >
          <div>
            <p className="text-xs font-mono tracking-wide text-zinc-500 dark:text-zinc-400 mb-5">
              {t.kicker}
            </p>

            <h1
              className="font-display font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.06] mb-6"
              style={{
                fontSize: 'clamp(2.25rem, 4.1vw, 3.65rem)',
                textWrap: 'balance',
              }}
            >
              {t.headline}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mb-8">
              {t.bioBeforeLink}
              <a
                href={PROFILE_LINKS.choreosLabs}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Choreos Labs
              </a>
              {t.bioAfterLink}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <a
                href={PORTFOLIO_ASSETS.cvPdfPath}
                download="Soumyajit_Biswas_CV.pdf"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                {t.grabCv}
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0"
              >
                {t.bookProject}
                <ArrowDownRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.talkAi}
              </button>
            </div>
          </div>

          {/* Direct social channels */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
            <a
              href={PROFILE_LINKS.choreosGithub}
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium"
            >
              Choreos Labs
            </a>
            <a
              href={PROFILE_LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href={PROFILE_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>@fr_soumyajit</span>
            </a>
          </div>
        </motion.div>

        {/* Right column: Single natural studio portrait blended seamlessly into canvas */}
        <motion.div
          style={{ y: imageY, scale: imageScale, opacity: imageOpacity }}
          className="lg:col-span-5 relative flex flex-col justify-end min-h-[400px] lg:min-h-[500px]"
        >
          <div className="relative flex-1 min-h-[360px] lg:min-h-[440px] flex items-end justify-center overflow-hidden">
            {/* Soft ambient cobalt halo behind portrait */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(37,99,235,0.12),transparent_64%)]"
            />

            {!imgFailed ? (
              <img
                src={PORTFOLIO_ASSETS.heroPortrait}
                alt={t.portraitAlt}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 80% 84% at 50% 44%, #000 50%, transparent 96%)',
                  maskImage:
                    'radial-gradient(ellipse 80% 84% at 50% 44%, #000 50%, transparent 96%)',
                }}
                className="w-full h-full max-h-[470px] object-cover object-top select-none"
              />
            ) : (
              <div className="w-full h-full min-h-[360px] flex items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-400 font-display text-3xl font-bold">
                SB
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-left">
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-0.5">
              {t.availabilityLine}
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {t.portraitCaption}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Full-width 4-column proof strip directly below hero split */}
      <motion.div
        style={{ y: kpiY }}
        className="mt-12 grid grid-cols-2 lg:grid-cols-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/60 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800"
      >
        {t.kpis.map((kpi) => (
          <div key={kpi.value} className="p-6">
            <p className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {kpi.value}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
