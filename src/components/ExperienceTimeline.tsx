import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { PORTFOLIO_ASSETS } from '../data/portfolioData';
import {
  getEducationList,
  getExperienceList,
  getTechnicalSkills,
  UI_COPY,
} from '../data/translations';
import { useLanguage } from '../lib/i18n';

export function ExperienceTimeline() {
  const { lang } = useLanguage();
  const t = UI_COPY[lang].story;
  const experienceList = getExperienceList(lang);
  const educationList = getEducationList(lang);
  const technicalSkills = getTechnicalSkills(lang);

  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 78%', 'end 62%'],
  });
  const lineScaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <section
      id="story"
      className="py-20 border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Sticky Rail: Human Story + Workbench Scene + Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45 }}
          className="lg:col-span-5 space-y-8 lg:sticky lg:top-24"
        >
          <div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">{t.kicker}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              {t.headline}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.intro}
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={PORTFOLIO_ASSETS.storyWorkbench}
                alt={t.workbenchAlt}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-5 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                {t.workbenchTag}
              </p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{t.workbenchCaption}</p>
            </div>
          </div>

          {/* Skills Matrix */}
          <div className="space-y-4 pt-2">
            <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t.toolsHeading}
            </h3>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
              {technicalSkills.map((group) => (
                <div key={group.group} className="py-3.5">
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                    {group.group}
                  </p>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200">
                    {group.items.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Scroll-Drawn Experience Timeline + Education */}
        <div className="lg:col-span-7 space-y-12">
          <div>
            <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
              {t.experienceHeading}
            </h3>

            <div ref={timelineRef} className="relative pl-6 sm:pl-8">
              {/* Static track line */}
              <div
                aria-hidden="true"
                className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-200 dark:bg-zinc-800"
              />
              {/* Scroll-drawn cobalt progress rail */}
              <motion.div
                aria-hidden="true"
                style={{ scaleY: lineScaleY, transformOrigin: '50% 0%' }}
                className="absolute left-[7px] top-2 bottom-2 w-px bg-blue-600"
              />

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
                {experienceList.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="relative py-6"
                  >
                    {/* Milestone tick on vertical track */}
                    <span
                      aria-hidden="true"
                      className="absolute -left-6 sm:-left-8 top-8 h-3.5 w-3.5 rounded-full border-2 border-blue-600 bg-zinc-50 dark:bg-zinc-950"
                    />

                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h4 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h4>
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {item.period}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {item.organization}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                      {item.website && (
                        <>
                          <span aria-hidden="true">·</span>
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {t.websiteLink} <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                    <ul className="space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {item.summaryPoints.map((pt) => (
                        <li key={pt} className="flex items-start gap-2">
                          <span className="text-zinc-400 dark:text-zinc-600 select-none">—</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
              {t.educationHeading}
            </h3>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
              {educationList.map((edu, idx) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.38, delay: idx * 0.05 }}
                  className="py-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h4 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {edu.degree}
                    </h4>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {edu.institution} · {edu.location}
                  </p>
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                    {edu.detail}
                  </p>
                </motion.div>
              ))}
              <div className="py-5">
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
                  {t.certHeading}
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{t.certBody}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
