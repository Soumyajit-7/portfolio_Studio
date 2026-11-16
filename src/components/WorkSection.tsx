import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, ExternalLink, X } from 'lucide-react';
import { CASE_STUDIES, type ProjectCaseStudy } from '../data/portfolioData';

type CategoryFilter = 'All' | 'Applied AI' | 'Systems & Mobile' | 'Sports & Hardware';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Applied AI',
  'Systems & Mobile',
  'Sports & Hardware',
];

export function WorkSection() {
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [selectedProject, setSelectedProject] = useState<ProjectCaseStudy | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const driftUp = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const driftDown = useTransform(scrollYProgress, [0, 1], [-14, 18]);

  useEffect(() => {
    if (!selectedProject) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  const visibleProjects =
    filter === 'All'
      ? CASE_STUDIES
      : CASE_STUDIES.filter((project) => project.category === filter);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
            01. Things I Have Actually Built
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Less buzzword bingo, more working hardware & shipped code
          </h2>
        </div>

        {/* Interactive segmented filter bar */}
        <div
          role="tablist"
          aria-label="Filter projects by discipline"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        >
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={filter === category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === category
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetric Bento Grid with scroll-linked depth offset */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleProjects.map((project, idx) => (
          <motion.article
            key={project.id}
            layout
            style={
              filter === 'All' && idx > 0
                ? { y: idx % 2 === 1 ? driftUp : driftDown }
                : undefined
            }
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setSelectedProject(project)}
            className={`group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 ${
              filter === 'All' && project.spanClass ? project.spanClass : ''
            }`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
              <img
                src={project.imageUrl}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                <p className="text-xs font-mono text-zinc-200">{project.impactMetric}</p>
                <span className="h-8 w-8 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  <span>{project.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{project.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.organization}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                  {project.summary}
                </p>
              </div>

              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {project.stack.join(' · ')}
              </p>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Fullscreen Lightbox Case Study Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden">
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close case study"
                className="absolute top-4 right-4 h-10 w-10 rounded-lg bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
                  {selectedProject.category} · {selectedProject.role} · {selectedProject.year}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                  {selectedProject.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedProject.summary}
                </p>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5">
                <h4 className="text-sm font-semibold mb-3">How It Actually Came Together</h4>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {selectedProject.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="text-blue-600 dark:text-blue-400 font-mono">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {selectedProject.stack.join(' / ')}
                </p>
                {selectedProject.liveUrl && (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Visit Choreos Labs
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
