import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { UI_COPY } from '../data/translations';
import { useLanguage } from '../lib/i18n';

export function MarqueeRibbon() {
  const { lang } = useLanguage();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 120, damping: 24 });
  const scrollScrubX = useTransform(smoothVelocity, [-1800, 0, 1800], [-90, 0, 90]);

  const phrase = UI_COPY[lang].marquee;

  return (
    <div className="border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 py-3.5 overflow-hidden select-none">
      <motion.div style={{ x: scrollScrubX }} className="will-change-transform">
        <div className="animate-marquee">
          <span className="text-xs font-mono tracking-wide text-zinc-500 dark:text-zinc-400 pr-4">
            {phrase}
            {phrase}
          </span>
          <span
            aria-hidden="true"
            className="text-xs font-mono tracking-wide text-zinc-500 dark:text-zinc-400 pr-4"
          >
            {phrase}
            {phrase}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
