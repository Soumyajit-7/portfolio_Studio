export interface ProjectCaseStudy {
  id: string;
  title: string;
  category: 'Applied AI' | 'Systems & Mobile' | 'Sports & Hardware';
  year: string;
  role: string;
  organization: string;
  summary: string;
  impactMetric: string;
  stack: string[];
  imageUrl: string;
  liveUrl?: string;
  highlights: string[];
  spanClass?: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  location: string;
  title: string;
  organization: string;
  website?: string;
  summaryPoints: string[];
}

export interface EducationItem {
  id: string;
  period: string;
  location: string;
  degree: string;
  institution: string;
  detail: string;
}

export interface SocialMilestone {
  id: string;
  platform: 'instagram' | 'linkedin';
  title: string;
  caption: string;
  dateLabel: string;
  externalUrl: string;
  category: string;
  imageUrl?: string;
}

export interface AdventureSnapshot {
  id: string;
  title: string;
  location: string;
  caption: string;
  imageUrl: string;
  instagramUrl: string;
  tag: string;
}

export const PORTFOLIO_ASSETS = {
  heroPortrait: '/src/assets/images/hero_soumyajit.webp',
  choreosLogo: '/assets/soumyajit/choreos-logo.webp',
  choreosShowcase: '/assets/soumyajit/inference-tactical.webp',
  projectChoreos: '/src/assets/images/project_choreos_inference.webp',
  thermalVision: '/src/assets/images/project_thermal_vision.webp',
  combatVision: '/src/assets/images/combat_vision.webp',
  genBiSql: '/src/assets/images/project_gen_bi_sql.webp',
  saferouteCv: '/src/assets/images/project_saferoute_cv.webp',
  roboticSorter: '/src/assets/images/project_robotic_sorter.webp',
  storyWorkbench: '/src/assets/images/story_builder_desk.webp',
  igTrierStart: '/assets/soumyajit/ig-trier-start.webp',
  igBoxingDrill: '/assets/soumyajit/ig-boxing-drill.webp',
  igCampingStars: '/assets/soumyajit/ig-camping-stars.webp',
  cvPdfPath: '/assets/aistudio/Soumyajit_Biswas_CV_da758d74.pdf',
};

export const PROFILE_LINKS = {
  github: 'https://github.com/Soumyajit-7',
  choreosGithub: 'https://github.com/choreoslabs',
  choreosLabs: 'https://choreoslabs.com/',
  linkedin: 'https://www.linkedin.com/in/soumyajit-biswas-909a671a0/',
  instagram: 'https://www.instagram.com/fr_soumyajit/',
  email: 'soumyajit.biswas.14444@gmail.com',
  phone: '(+49) 15905647762',
};

export const CASE_STUDIES: ProjectCaseStudy[] = [
  {
    id: 'choreos-inference',
    title: 'Inference — Brain Training That Feels Like Sport',
    category: 'Systems & Mobile',
    year: '2025 – 2026',
    role: 'Co-Founder & Builder',
    organization: 'Choreos Labs Pvt. Ltd.',
    summary:
      'Co-founded Choreos Labs to build mobile apps where neuroscience meets tight game feel. Inference packs 50+ reaction, tactical board, and scroll-based cognitive modes backed by a containerized Python, PostgreSQL, and Redis stack.',
    impactMetric: '50+ Game Modes · Native Kotlin + GCP Backend',
    stack: ['Kotlin', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Google Cloud'],
    imageUrl: PORTFOLIO_ASSETS.projectChoreos,
    liveUrl: 'https://choreoslabs.com/',
    spanClass: 'md:col-span-2 md:row-span-2',
    highlights: [
      'Built native Android experiences in Kotlin designed around reaction speed, working memory, and pattern recognition.',
      'Containerized the Python backend with PostgreSQL and Redis in Docker and deployed it onto Google Cloud Platform.',
      'Shipped private alpha and beta builds directly to early testers and iterated fast on cognitive analytics.',
    ],
  },
  {
    id: 'iisco-thermal-vision',
    title: 'Watching Molten Steel Without Blinking',
    category: 'Applied AI',
    year: '2024',
    role: 'R&D Intern',
    organization: 'Hi-Tech Systems & Services Ltd.',
    summary:
      'Walked onto the IISCO Burnpur steelworks floor with FLIR thermal cameras to catch structural weak spots in molten-iron torpedo vessels before they turn into expensive emergencies.',
    impactMetric: '92% Precision · Sub-Second On-Site Inference',
    stack: ['Python', 'FLIR Thermal', 'Object Detection', 'Edge Server'],
    imageUrl: PORTFOLIO_ASSETS.thermalVision,
    highlights: [
      'Collected raw FLIR thermal imagery manually on-site next to live torpedo ladle operations.',
      'Trained an object-detection pipeline hitting 92% validation precision on the real deployment server.',
      'Tuned inference down to sub-second response times right on the plant floor hardware.',
    ],
  },
  {
    id: 'combat-biomechanics',
    title: 'Teaching a Webcam to Read Strike Mechanics',
    category: 'Sports & Hardware',
    year: '2024',
    role: 'Computer Vision Builder',
    organization: 'Personal Lab',
    summary:
      'Built a real-time MediaPipe and TensorFlow pose tracker that reads stance geometry and strike trajectories straight from webcam video—turning athletic movement into clean biomechanical telemetry.',
    impactMetric: 'Real-Time Pose & Strike Classification',
    stack: ['MediaPipe', 'TensorFlow', 'Python', 'OpenCV'],
    imageUrl: PORTFOLIO_ASSETS.combatVision,
    highlights: [
      'Extracts skeletal joint landmarks directly from standard video without clunky wrist sensors.',
      'Classifies strikes and defensive guard stances on the fly during athletic drills.',
    ],
  },
  {
    id: 'setu-gen-bi',
    title: 'Talking to SQL Databases in Plain English',
    category: 'Applied AI',
    year: '2024',
    role: 'GenAI & BI Intern',
    organization: 'SETU Business School × NASSCOM',
    summary:
      'Built a generative BI assistant so event teams could ask normal human questions and immediately get verified SQL queries, tables, and charts—no late-night JOIN debugging required.',
    impactMetric: 'NASSCOM Event Analytics · LangChain + PandasAI',
    stack: ['Python', 'LangChain', 'SQLite', 'Streamlit', 'PandasAI'],
    imageUrl: PORTFOLIO_ASSETS.genBiSql,
    highlights: [
      'Wired Python and LangChain to translate plain-English prompts into safe SQLite queries.',
      'Added PandasAI auto-charting and full query audit logging so nothing ran like a black box.',
    ],
  },
  {
    id: 'saferoute-ai',
    title: 'SafeRoute AI: Dashcam Pothole Hunter',
    category: 'Applied AI',
    year: '2024',
    role: 'Creator',
    organization: 'Computer Vision',
    summary:
      'A YOLOv8 dashcam pipeline that spots potholes in real time, grades how nasty they are, and drops GPS-stamped CSV/SQL reports.',
    impactMetric: 'Automated Geo-Tagged Severity Reports',
    stack: ['YOLOv8', 'OpenCV', 'SQL', 'Python'],
    imageUrl: PORTFOLIO_ASSETS.saferouteCv,
    highlights: [
      'Processes continuous road footage with automated frame cleanup and bounding-box scoring.',
      'Outputs structured CSV and SQL tables with timestamps, severity tiers, and coordinates.',
    ],
  },
  {
    id: 'robotic-waste-sorter',
    title: 'ShuffleNet + Arduino Waste Sorter',
    category: 'Sports & Hardware',
    year: '2024 – 2025',
    role: 'Hardware & ML Builder',
    organization: 'RCCIIT Capstone',
    summary:
      'Combined my mechanical engineering roots with deep learning: a lightweight ShuffleNet v2 vision classifier talking to Arduino-driven servo gates via circular-queue logic.',
    impactMetric: 'Vision-to-Servo Physical Actuation',
    stack: ['ShuffleNet v2', 'PyTorch', 'Arduino', 'Circular Queue'],
    imageUrl: PORTFOLIO_ASSETS.roboticSorter,
    highlights: [
      'Trained a fast ShuffleNet v2 classifier on TrashNet for low-footprint camera inference.',
      'Synchronized mechanical servo flaps using a circular queue so items drop cleanly into the right bin.',
    ],
  },
];

export const CURRENT_FOCUS_ITEMS = [
  {
    tag: 'Right Now · Trier, Germany',
    title: 'M.Sc. Data Science at Universität Trier',
    detail:
      'Diving deep into statistical learning, scalable data pipelines, and applied AI while surviving German bureaucracy and picking up Deutsch (slowly, one bakery order at a time).',
  },
  {
    tag: 'Startup · Choreos Labs',
    title: 'Scaling Cognitive Games & Performance Tech',
    detail:
      'Co-building Choreos Labs (github.com/choreoslabs) alongside Soumyadeb Saha—shipping Inference and pushing mobile cognitive telemetry closer to athletic training.',
  },
  {
    tag: 'Open From Nov 2026',
    title: 'Working-Student & Select Freelance Builds',
    detail:
      'Available 16–20 hours/week in the Trier region or remote for teams building applied AI, data systems, backend APIs, or computer vision products.',
  },
];

export const ADVENTURE_SNAPSHOTS: AdventureSnapshot[] = [
  {
    id: 'adv-camping',
    title: 'Milky Way Over Basecamp',
    location: 'Mountain Camp',
    caption:
      'Glowing tents tucked beneath sharp ridges with zero light pollution—nothing resets your head faster than cold mountain air and a clear night sky.',
    imageUrl: PORTFOLIO_ASSETS.igCampingStars,
    instagramUrl: 'https://www.instagram.com/p/C90MP93yn7J/?img_index=1',
    tag: 'Camping & Stargazing',
  },
  {
    id: 'adv-trier',
    title: 'Day One at Universität Trier',
    location: 'Trier, Germany',
    caption:
      'Autumn leaves on campus and officially kicking off my Master’s in Data Science in Germany’s oldest city.',
    imageUrl: PORTFOLIO_ASSETS.igTrierStart,
    instagramUrl: 'https://www.instagram.com/p/De9AiEyDL7G/?img_index=1',
    tag: 'Starting in Trier',
  },
  {
    id: 'adv-boxing-drill',
    title: 'Pad & Drill Rounds (Archive)',
    location: 'Training Mat',
    caption:
      'Flashback from my boxing drill sessions—still carry the same focus and footwork pacing into hard engineering sprints.',
    imageUrl: PORTFOLIO_ASSETS.igBoxingDrill,
    instagramUrl: 'https://www.instagram.com/p/DVX7F-NgRhn/',
    tag: 'Boxing Drills',
  },
];

export const EXPERIENCE_LIST: ExperienceItem[] = [
  {
    id: 'choreos',
    period: 'Dec 2025 — Aug 2026',
    location: 'Nadia, India',
    title: 'Co-Founder & Systems Builder',
    organization: 'Choreos Labs Pvt. Ltd.',
    website: 'https://choreoslabs.com/',
    summaryPoints: [
      'Co-built Inference, a native Android cognitive gaming platform with scroll-based, tactical board, and reaction challenges.',
      'Wrote native Kotlin client modules and Python backend services powered by PostgreSQL and Redis in Docker containers.',
      'Deployed the whole backend stack onto Google Cloud Platform and ran private alpha/beta tester releases.',
    ],
  },
  {
    id: 'setu',
    period: 'Jul 2024 — Sep 2024',
    location: 'Kolkata, India',
    title: 'Research Intern — Generative AI & BI',
    organization: 'SETU Business School Pvt. Ltd.',
    website: 'https://setuschool.com/',
    summaryPoints: [
      'Built a generative BI dashboard in collaboration with NASSCOM so users could query SQLite event data in plain English.',
      'Connected Python + LangChain to translate natural questions into verified SQL and chart results with Streamlit and PandasAI.',
      'Added full interaction and SQL query logging so every generated answer stayed auditable.',
    ],
  },
  {
    id: 'hitech',
    period: 'Apr 2024 — Jul 2024',
    location: 'Kolkata, India',
    title: 'R&D Intern — Industrial Computer Vision',
    organization: 'Hi-Tech Systems & Services Ltd.',
    website: 'https://www.hitech.in/',
    summaryPoints: [
      'Collected real FLIR thermal footage on-site at IISCO Burnpur steelworks for torpedo ladle operations.',
      'Built and tuned an object-detection pipeline hitting 92% validation precision on the actual plant server.',
      'Achieved sub-second inference to flag thermal weak spots automatically.',
    ],
  },
];

export const EDUCATION_LIST: EducationItem[] = [
  {
    id: 'trier',
    period: 'Oct 2026 — Present',
    location: 'Trier, Germany',
    degree: 'M.Sc. in Data Science',
    institution: 'Universität Trier',
    detail: 'EQF Level 7 · Applied AI, Statistical Learning & Data Systems',
  },
  {
    id: 'rcciit',
    period: 'Jul 2022 — Jun 2025',
    location: 'Kolkata, India',
    degree: 'B.Tech in Information Technology',
    institution: 'RCC Institute of Information Technology (MAKAUT)',
    detail: 'EQF Level 6 · Grade: 7.9 / 10',
  },
  {
    id: 'hit',
    period: 'Aug 2019 — Jul 2022',
    location: 'Hooghly, India',
    degree: 'Diploma in Mechanical Engineering',
    institution: 'Hooghly Institute of Technology',
    detail: 'EQF Level 5 · Grade: 8.1 / 10 (where the hardware intuition started)',
  },
];

export const DEFAULT_SOCIAL_MILESTONES: SocialMilestone[] = [
  {
    id: 'seed-linkedin-trier',
    platform: 'linkedin',
    title: 'Landed in Trier for M.Sc. Data Science',
    caption:
      'Officially moved to Germany to start my Master’s at Universität Trier. Taking on working-student roles (16–20 hrs/wk) and sharp freelance builds starting November 2026.',
    dateLabel: 'Oct 2026',
    externalUrl: PROFILE_LINKS.linkedin,
    category: 'Life & Career',
  },
  {
    id: 'seed-instagram-training',
    platform: 'instagram',
    title: 'Dawn Track Splits Before Compiler Errors',
    caption:
      'Early intervals on the track beat staring at a broken pipeline. Same mindset in both places: keep your pace, read the pattern, adjust fast.',
    dateLabel: 'Nov 2026',
    externalUrl: PROFILE_LINKS.instagram,
    category: 'Sports',
  },
  {
    id: 'seed-linkedin-choreos',
    platform: 'linkedin',
    title: 'What We Built at Choreos Labs',
    caption:
      'Inference started as a crazy idea about training cognitive speed like an athlete. Turned into Kotlin, Python, Redis, Docker, and real beta testers.',
    dateLabel: 'Aug 2026',
    externalUrl: PROFILE_LINKS.choreosGithub,
    category: 'Startup',
  },
  {
    id: 'seed-instagram-adventure',
    platform: 'instagram',
    title: 'Chasing Altitude & Unpaved Trails',
    caption:
      'Whenever the laptop lid closes, I’m looking for a mountain ridge, a fast sprint, or a train ticket somewhere unfamiliar.',
    dateLabel: 'Nov 2026',
    externalUrl: PROFILE_LINKS.instagram,
    category: 'Adventure & Travel',
  },
];

export const TECHNICAL_SKILLS = [
  {
    group: 'Languages I Actually Enjoy',
    items: ['Python', 'Kotlin', 'Java', 'SQL', 'TypeScript'],
  },
  {
    group: 'Backend & Infrastructure',
    items: ['PostgreSQL', 'Redis', 'MySQL', 'MongoDB', 'Docker', 'Google Cloud', 'ETL Pipelines'],
  },
  {
    group: 'AI, Vision & Hardware',
    items: ['PyTorch & TensorFlow', 'YOLOv8 & OpenCV', 'MediaPipe', 'LangChain', 'PandasAI', 'Arduino'],
  },
];
