import { PORTFOLIO_ASSETS, PROFILE_LINKS } from '../data/portfolioData';

interface FooterProps {
  onOpenDashboard: () => void;
}

export function Footer({ onOpenDashboard }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          <p className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Soumyajit Biswas
          </p>
          <p className="mt-1">54295 Trier, Germany · Co-Founder at Choreos Labs · Sports & Trail Addict</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <a
            href={PORTFOLIO_ASSETS.cvPdfPath}
            download="Soumyajit_Biswas_CV.pdf"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Download CV
          </a>
          <a
            href={PROFILE_LINKS.choreosLabs}
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Choreos Labs
          </a>
          <a
            href={PROFILE_LINKS.choreosGithub}
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            @choreoslabs
          </a>
          <a
            href={PROFILE_LINKS.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={PROFILE_LINKS.instagram}
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Instagram
          </a>
          <a
            href={`mailto:${PROFILE_LINKS.email}`}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Email
          </a>
          <button
            type="button"
            onClick={() => {
              onOpenDashboard();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Owner Portal
          </button>
        </div>
      </div>
    </footer>
  );
}
