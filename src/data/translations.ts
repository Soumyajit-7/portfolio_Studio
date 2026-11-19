import {
  ADVENTURE_SNAPSHOTS,
  CASE_STUDIES,
  CURRENT_FOCUS_ITEMS,
  DEFAULT_SOCIAL_MILESTONES,
  EDUCATION_LIST,
  EXPERIENCE_LIST,
  TECHNICAL_SKILLS,
  type AdventureSnapshot,
  type EducationItem,
  type ExperienceItem,
  type ProjectCaseStudy,
  type SocialMilestone,
} from './portfolioData';
import type { Language } from '../lib/i18n';

export const UI_COPY = {
  en: {
    header: {
      work: 'Work',
      story: 'Story',
      choreosLife: 'Choreos & Life',
      contact: 'Contact',
      contactBooking: 'Contact & Booking',
      bookChat: 'Book a Chat',
      themeLight: 'Switch to light mode',
      themeDark: 'Switch to dark mode',
      menuToggle: 'Toggle navigation menu',
      langSwitchAria: 'Switch website language',
      // Shown in GERMAN when landing on English site
      langHintBody:
        'Lieber auf Deutsch lesen? Du kannst die Sprache oben jederzeit auf Deutsch [DE] umstellen.',
      langHintAction: 'Auf Deutsch wechseln [DE]',
      langHintDismiss: 'Hinweis schließen',
    },
    hero: {
      kicker:
        'Trier, Germany · Co-Founder at Choreos Labs · M.Sc. Data Science · Sports & Trail Addict',
      headline:
        'I build systems that think, co-found startups that ship, and still make dawn track sprints.',
      bioBeforeLink:
        'Please don’t put me in a single box like “data scientist.” I started out wrenching through Mechanical Engineering, got hooked on deep learning and thermal cameras in steel plants, co-founded ',
      bioAfterLink:
        ', and now I’m decoding Germany while pursuing my Master’s at Universität Trier.',
      grabCv: 'Grab My CV',
      bookProject: 'Book a Project / Interview',
      talkAi: 'Talk to My AI Stand-In',
      portraitAlt: 'Soumyajit Biswas portrait',
      availabilityLine: 'Available Nov 2026 · 16–20 hrs/week · Trier or Remote',
      portraitCaption: 'Soumyajit Biswas — Builder, Co-Founder, Sports Addict',
      kpis: [
        { value: '92%', label: 'Thermal Vision Precision · Steelworks Floor' },
        { value: '50+', label: 'Cognitive Modes Shipped · Inference App' },
        { value: '3 Disciplines', label: 'Mechanical Eng · IT · Data Science' },
        { value: 'Nov 2026', label: 'Ready for Working-Student & Freelance Work' },
      ],
    },
    marquee:
      'Choreos Labs Co-Founder · Universität Trier · FLIR Thermal Vision · Sports & Extreme Trails · Kotlin & Python Systems · Coffee-Fueled Problem Solving · ',
    work: {
      kicker: '01. Things I Have Actually Built',
      headline: 'Less buzzword bingo, more working hardware & shipped code',
      filterAria: 'Filter projects by discipline',
      categories: {
        All: 'All',
        'Applied AI': 'Applied AI',
        'Systems & Mobile': 'Systems & Mobile',
        'Sports & Hardware': 'Sports & Hardware',
      } as Record<string, string>,
      closeCaseStudy: 'Close case study',
      howItCameTogether: 'How It Actually Came Together',
      visitChoreos: 'Visit Choreos Labs',
    },
    story: {
      kicker: '02. The Winding Route',
      headline: 'From mechanical calipers to steelworks vision and startup servers',
      intro:
        'My resume looks slightly chaotic until you realize the common thread: I love figuring out how real-world systems break and building tools to fix them. Mechanical engineering taught me physical tolerances; IT taught me software scale; Trier is where I sharpen the math behind it all.',
      workbenchAlt:
        'Mechanical calipers, dark keyboard, espresso cup, and system architecture workstation',
      workbenchTag: 'Default Habitat · Late-Night Builder',
      workbenchCaption:
        'When I’m not tweaking pipelines or arguing with Docker containers, I’m training dawn track splits, chasing steep ridges, or planning my next trip.',
      toolsHeading: 'Tools of the Trade',
      experienceHeading: 'Where I’ve Built Things',
      websiteLink: 'Website',
      educationHeading: 'Degrees & Sanity Checks',
      certHeading: 'Certifications & Spoken Languages',
      certBody:
        'DeepLearning.AI Mathematics for ML & Data Science (2025) · Google Cloud Production ML Systems (2025) · English (C1) · German (A1—getting better every espresso)',
    },
    ventures: {
      kicker1: '03. Startup & Current Orbit',
      headline1: 'Choreos Labs & what I’m building right now',
      choreosSub: 'Co-Founded with Soumyadeb Saha · Cognitive Performance Tech',
      choreosP1Before:
        'We started Choreos Labs around one simple bet: training your brain shouldn’t feel like doing taxes—it should feel like competing in a sport. Together we built ',
      choreosP1After:
        ', a native Android platform with 50+ high-tempo cognitive games, tactical puzzles, and competitive reaction drills.',
      choreosP2:
        'My side of the ring: Kotlin mobile architecture, Python API services, PostgreSQL & Redis inside Docker containers, and shipping private alpha/beta builds on Google Cloud.',
      choreosImageCaption: 'Inference · Choreos Labs Cognitive Performance Platform',
      kicker2: '04. Off the Clock · Sports, Extreme Adventure & Travel',
      headline2: 'Life outside the terminal (@fr_soumyajit)',
      seeFullFeed: 'See Full Feed @fr_soumyajit',
      recentNotes: 'Recent Notes & Updates',
      syncedSub: 'Synced from LinkedIn & Instagram',
      tabAll: 'All',
      linkedinProfile: 'LinkedIn Profile',
    },
    contact: {
      kicker: '05. Say Hello or Book a Call',
      headline: 'Got an ambitious build, freelance gig, or working-student role?',
      intro:
        'Drop a quick note or book a Google Meet / in-person slot right here—no account required. Everything lands directly in my lead dashboard so nothing gets buried.',
      directEmail: 'Direct Email',
      basePhone: 'Base & Phone',
      baseLocation: '54295 Trier, Germany',
      availabilityLabel: 'Availability Window',
      availabilityValue: 'Starting Nov 2026 · 16–20 hours/week · Trier region or remote',
      tabInquiry: 'Send Message',
      tabAppointment: 'Book a Slot',
      noSignInHint: 'No sign-in required · Replies go to your email',
      yourName: 'Your Name',
      emailAddress: 'Email Address',
      companyLabel: 'Company / Team (Optional)',
      companyPlaceholder: 'Startup, Lab, or Solo',
      topicLabel: 'What’s This About?',
      messageLabel: 'Message',
      messagePlaceholder: "Tell me what you're building, hiring for, or curious about...",
      sendInquiry: 'Send Inquiry',
      sending: 'Sending...',
      meetingFormat: 'Meeting Format',
      googleMeetTitle: 'Google Meet (Virtual)',
      googleMeetDesc: 'Scheduled Meet link emailed to both of us upon approval.',
      inPersonTitle: 'In-Person Meet',
      inPersonDesc: 'Suggest a venue; confirmed or countered via email.',
      placeLabel: 'Proposed Place / Venue',
      placePlaceholder: 'e.g., Universität Trier Campus, Hauptmarkt Café, or your office address',
      sessionType: 'Session Type',
      preferredDate: 'Preferred Date',
      yourTimezone: 'Your Timezone',
      pickTime: 'Pick a Time (Trier CET)',
      agendaLabel: 'Agenda Notes (Optional)',
      agendaPlaceholder: 'Any links, context, or questions ahead of our chat...',
      lockInBooking: 'Lock In Booking Request',
      booking: 'Booking...',
      topics: {
        'Freelance Project': 'Freelance Project',
        'Working Student Role': 'Working Student Role',
        'AI & Data Consulting': 'AI & Data Consulting',
        'General Inquiry': 'General Inquiry',
      } as Record<string, string>,
      meetingTypes: {
        'Freelance Discovery': 'Freelance Discovery',
        'Applied AI Consulting': 'Applied AI Consulting',
        'Working Student Interview': 'Working Student Interview',
        'Technical Mentorship': 'Technical Mentorship',
      } as Record<string, string>,
      errors: {
        nameRequired: 'Please enter your name.',
        emailInvalidInquiry: 'Please provide a valid email address so I can reply.',
        messageShort: 'Give me at least 5 characters so I know what we are talking about.',
        inquirySaveFail: 'Something went wrong saving your inquiry.',
        emailInvalidBooking:
          'Please provide a valid email address to receive your invite or counter-proposal.',
        dateInvalid: 'Please pick a valid date.',
        placeShort: 'Please enter a preferred place or city for an in-person meeting.',
        bookingFail: 'Could not reserve that appointment slot.',
      },
      inquirySuccess: (email: string) =>
        `Got it! Your inquiry landed straight in my inbox tracker—I will reply to ${email} shortly.`,
      receipt: {
        kicker: 'Request Received · Pending Approval',
        title: (name: string) => `Thanks, ${name} — your slot request is queued`,
        statusBadge: 'Pending Soumyajit’s Approval',
        refId: 'Reference ID',
        session: 'Session',
        format: 'Format',
        formatVirtual: 'Google Meet (Virtual)',
        formatInPerson: (place: string) => `In-Person — ${place}`,
        requestedWindow: 'Requested Window',
        emailTarget: 'Confirmation Email Target',
        ackSentPrefix: (email: string) => `An acknowledgement email has been sent to ${email}. `,
        ackSavedPrefix: (email: string) => `Your request is saved for review (${email}). `,
        waitMeet: (email: string) =>
          `Please hold tight until I accept your request—as soon as I approve, you will receive the final email with your scheduled Google Meet link at ${email}.`,
        waitInPerson: (email: string) =>
          `Please hold tight until I review availability—once approved (or if I suggest another date, time, or place), you will receive the update at ${email}.`,
        bookAnother: 'Book Another Slot',
      },
    },
    footer: {
      tagline: '54295 Trier, Germany · Co-Founder at Choreos Labs · Sports & Trail Addict',
      downloadCv: 'Download CV',
      email: 'Email',
      ownerPortal: 'Owner Portal',
    },
    chatbot: {
      openButton: 'Ask Soumyajit’s AI',
      openAria: 'Open Soumyajit AI Stand-In',
      title: 'Soumyajit’s AI Stand-In',
      subtitle: 'Choreos Labs · Applied AI · Trier Availability',
      closeAria: 'Close chat',
      greeting:
        "Hey — I'm Soumyajit's AI stand-in. While he's either debugging Docker, chasing mountain trails, or running track intervals, ask me anything about Choreos Labs, his computer vision work, M.Sc. at Universität Trier, or booking a project.",
      starters: [
        'How did Choreos Labs start?',
        'What happened at the IISCO steel plant?',
        'Is he free in Trier from Nov 2026?',
      ],
      placeholder: 'Ask about Choreos Labs, projects, or Trier...',
      thinking: 'Thinking...',
      sendAria: 'Send message',
      unexpectedError: 'Server returned an unexpected response.',
      requestFailed: 'Chat request failed.',
      fallbackError: 'Unable to reach Soumyajit AI stand-in.',
      errorPrefix: 'My neural wires crossed for a second:',
    },
  },
  de: {
    header: {
      work: 'Projekte',
      story: 'Werdegang',
      choreosLife: 'Choreos & Leben',
      contact: 'Kontakt',
      contactBooking: 'Kontakt & Termin',
      bookChat: 'Gespräch buchen',
      themeLight: 'Zum hellen Modus wechseln',
      themeDark: 'Zum dunklen Modus wechseln',
      menuToggle: 'Navigationsmenü umschalten',
      langSwitchAria: 'Website-Sprache wechseln',
      // Shown in ENGLISH when landing on German site
      langHintBody:
        'Prefer English? You can switch the website language back to English [EN] right here.',
      langHintAction: 'Switch to English [EN]',
      langHintDismiss: 'Dismiss notice',
    },
    hero: {
      kicker:
        'Trier, Deutschland · Mitgründer von Choreos Labs · M.Sc. Data Science · Sport- & Trail-Fan',
      headline:
        'Ich baue Systeme, die mitdenken, gründe Startups, die liefern, und schaffe trotzdem die Morgensprints.',
      bioBeforeLink:
        'Bitte steck mich nicht in eine einzige Schublade wie „Data Scientist“. Angefangen habe ich im Maschinenbau, habe mich in Stahlwerken in Deep Learning und Wärmebildkameras festgebissen, ',
      bioAfterLink:
        ' mitgegründet und entschlüssle nun Deutschland während meines Masters an der Universität Trier.',
      grabCv: 'Lebenslauf (PDF)',
      bookProject: 'Projekt / Gespräch buchen',
      talkAi: 'Mit meinem KI-Double sprechen',
      portraitAlt: 'Porträt von Soumyajit Biswas',
      availabilityLine: 'Verfügbar ab Nov 2026 · 16–20 Std./Woche · Trier oder Remote',
      portraitCaption: 'Soumyajit Biswas — Entwickler, Mitgründer, Sport-Enthusiast',
      kpis: [
        { value: '92%', label: 'Wärmebild-Präzision · Stahlwerk-Einsatz' },
        { value: '50+', label: 'Kognitive Spielmodi · Inference App' },
        { value: '3 Disziplinen', label: 'Maschinenbau · Informatik · Data Science' },
        { value: 'Nov 2026', label: 'Bereit für Werkstudenten- & Freelance-Projekte' },
      ],
    },
    marquee:
      'Choreos Labs Mitgründer · Universität Trier · FLIR Wärmebild-KI · Sport & Bergtrails · Kotlin- & Python-Systeme · Kaffeegetriebene Problemlösung · ',
    work: {
      kicker: '01. Was ich wirklich gebaut habe',
      headline: 'Weniger Buzzword-Bingo, mehr laufende Hardware & echter Code',
      filterAria: 'Projekte nach Bereich filtern',
      categories: {
        All: 'Alle',
        'Applied AI': 'Angewandte KI',
        'Systems & Mobile': 'Systeme & Mobile',
        'Sports & Hardware': 'Sport & Hardware',
      } as Record<string, string>,
      closeCaseStudy: 'Fallstudie schließen',
      howItCameTogether: 'Wie es wirklich umgesetzt wurde',
      visitChoreos: 'Choreos Labs besuchen',
    },
    story: {
      kicker: '02. Der Weg hierher',
      headline: 'Vom Messschieber über Stahlwerk-Vision bis zu Startup-Servern',
      intro:
        'Mein Lebenslauf wirkt auf den ersten Blick etwas unkonventionell, bis man den roten Faden sieht: Ich finde gerne heraus, wo reale Systeme scheitern, und baue Werkzeuge, um sie zu lösen. Maschinenbau lehrte mich physische Toleranzen, IT brachte mir Software-Skalierung bei – und in Trier schärfe ich die Mathematik dahinter.',
      workbenchAlt:
        'Messschieber, dunkle Tastatur, Espressotasse und Systemarchitektur-Arbeitsplatz',
      workbenchTag: 'Standard-Habitat · Nachtschicht-Entwickler',
      workbenchCaption:
        'Wenn ich nicht gerade Pipelines optimiere oder mit Docker-Containern diskutiere, trainiere ich morgens Bahnsprints, erkunde steile Bergkämme oder plane die nächste Reise.',
      toolsHeading: 'Werkzeugkasten',
      experienceHeading: 'Wo ich gebaut habe',
      websiteLink: 'Webseite',
      educationHeading: 'Abschlüsse & Stationen',
      certHeading: 'Zertifikate & Sprachen',
      certBody:
        'DeepLearning.AI Mathematics for ML & Data Science (2025) · Google Cloud Production ML Systems (2025) · Englisch (C1) · Deutsch (A1 — wird mit jedem Espresso besser)',
    },
    ventures: {
      kicker1: '03. Startup & Aktueller Fokus',
      headline1: 'Choreos Labs & woran ich gerade arbeite',
      choreosSub: 'Mitgegründet mit Soumyadeb Saha · Kognitive Performance-Tech',
      choreosP1Before:
        'Wir haben Choreos Labs mit einer einfachen Überzeugung gestartet: Gehirntraining sollte sich nicht anfühlen wie Steuererklärung, sondern wie echter Wettkampfsport. Gemeinsam haben wir ',
      choreosP1After:
        ' gebaut – eine native Android-Plattform mit über 50 schnellen kognitiven Spielen, Taktik-Puzzles und Reaktions-Drills.',
      choreosP2:
        'Mein Part im Ring: Native Kotlin-Architektur, Python-API-Services, PostgreSQL & Redis in Docker-Containern sowie private Alpha- und Beta-Releases auf Google Cloud.',
      choreosImageCaption: 'Inference · Choreos Labs Kognitive Performance-Plattform',
      kicker2: '04. Abseits des Terminals · Sport, Abenteuer & Reisen',
      headline2: 'Leben außerhalb der Konsole (@fr_soumyajit)',
      seeFullFeed: 'Kompletten Feed ansehen @fr_soumyajit',
      recentNotes: 'Aktuelle Notizen & Updates',
      syncedSub: 'Synchronisiert von LinkedIn & Instagram',
      tabAll: 'Alle',
      linkedinProfile: 'LinkedIn-Profil',
    },
    contact: {
      kicker: '05. Hallo sagen oder Termin buchen',
      headline: 'Ein spannendes Projekt, Freelance-Auftrag oder eine Werkstudentenstelle?',
      intro:
        'Schreib mir kurz oder buche direkt hier einen Google-Meet- oder Vor-Ort-Termin – ganz ohne Konto. Alles landet direkt in meinem Dashboard, sodass nichts untergeht.',
      directEmail: 'Direkte E-Mail',
      basePhone: 'Standort & Telefon',
      baseLocation: '54295 Trier, Deutschland',
      availabilityLabel: 'Verfügbarkeit',
      availabilityValue: 'Ab Nov 2026 · 16–20 Std./Woche · Raum Trier oder Remote',
      tabInquiry: 'Nachricht senden',
      tabAppointment: 'Termin buchen',
      noSignInHint: 'Kein Login nötig · Antworten kommen per E-Mail',
      yourName: 'Dein Name',
      emailAddress: 'E-Mail-Adresse',
      companyLabel: 'Unternehmen / Team (Optional)',
      companyPlaceholder: 'Startup, Labor oder Solo',
      topicLabel: 'Worum geht es?',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Erzähl mir kurz, woran ihr baut, wen ihr sucht oder was dich interessiert...',
      sendInquiry: 'Anfrage senden',
      sending: 'Wird gesendet...',
      meetingFormat: 'Terminformat',
      googleMeetTitle: 'Google Meet (Online)',
      googleMeetDesc: 'Der Meet-Link wird nach meiner Bestätigung an uns beide gemailt.',
      inPersonTitle: 'Persönliches Treffen',
      inPersonDesc: 'Schlag einen Ort vor – ich bestätige oder schlage Alternativen per E-Mail vor.',
      placeLabel: 'Vorgeschlagener Ort / Treffpunkt',
      placePlaceholder: 'z. B. Campus Universität Trier, Café am Hauptmarkt oder eure Adresse',
      sessionType: 'Art des Gesprächs',
      preferredDate: 'Wunschdatum',
      yourTimezone: 'Deine Zeitzone',
      pickTime: 'Uhrzeit wählen (Trier MEZ)',
      agendaLabel: 'Notizen / Agenda (Optional)',
      agendaPlaceholder: 'Links, Kontext oder Fragen vorab für unser Gespräch...',
      lockInBooking: 'Terminanfrage absenden',
      booking: 'Wird angefragt...',
      topics: {
        'Freelance Project': 'Freelance-Projekt',
        'Working Student Role': 'Werkstudentenstelle',
        'AI & Data Consulting': 'KI- & Datenberatung',
        'General Inquiry': 'Allgemeine Anfrage',
      } as Record<string, string>,
      meetingTypes: {
        'Freelance Discovery': 'Freelance-Kennenlernen',
        'Applied AI Consulting': 'Angewandte KI-Beratung',
        'Working Student Interview': 'Werkstudenten-Gespräch',
        'Technical Mentorship': 'Technisches Mentoring',
      } as Record<string, string>,
      errors: {
        nameRequired: 'Bitte gib deinen Namen ein.',
        emailInvalidInquiry: 'Bitte gib eine gültige E-Mail-Adresse an, damit ich antworten kann.',
        messageShort: 'Bitte schreib mindestens 5 Zeichen, damit ich weiß, worum es geht.',
        inquirySaveFail: 'Beim Speichern deiner Anfrage ist ein Fehler aufgetreten.',
        emailInvalidBooking:
          'Bitte gib eine gültige E-Mail-Adresse für die Einladung oder Rückmeldung an.',
        dateInvalid: 'Bitte wähle ein gültiges Datum.',
        placeShort: 'Bitte gib einen bevorzugten Ort oder eine Stadt für das Treffen an.',
        bookingFail: 'Der Termin konnte leider nicht reserviert werden.',
      },
      inquirySuccess: (email: string) =>
        `Angekommen! Deine Nachricht ist direkt in meinem Postfach-Tracker gelandet – ich antworte dir in Kürze an ${email}.`,
      receipt: {
        kicker: 'Anfrage erhalten · Wartet auf Bestätigung',
        title: (name: string) => `Danke, ${name} — deine Terminanfrage ist eingegangen`,
        statusBadge: 'Wartet auf Soumyajits Freigabe',
        refId: 'Referenz-ID',
        session: 'Gesprächsart',
        format: 'Format',
        formatVirtual: 'Google Meet (Online)',
        formatInPerson: (place: string) => `Vor Ort — ${place}`,
        requestedWindow: 'Angefragtes Zeitfenster',
        emailTarget: 'E-Mail für die Bestätigung',
        ackSentPrefix: (email: string) =>
          `Eine Eingangsbestätigung wurde bereits an ${email} gesendet. `,
        ackSavedPrefix: (email: string) =>
          `Deine Anfrage wurde zur Prüfung gespeichert (${email}). `,
        waitMeet: (email: string) =>
          `Bitte warte kurz, bis ich den Termin freigebe – sobald ich bestätige, erhältst du die finale E-Mail mit deinem Google-Meet-Link an ${email}.`,
        waitInPerson: (email: string) =>
          `Bitte warte kurz, bis ich meine Verfügbarkeit geprüft habe – nach der Bestätigung (oder einem Alternativvorschlag zu Datum, Uhrzeit oder Ort) erhältst du eine E-Mail an ${email}.`,
        bookAnother: 'Weiteren Termin anfragen',
      },
    },
    footer: {
      tagline: '54295 Trier, Deutschland · Mitgründer von Choreos Labs · Sport- & Trail-Fan',
      downloadCv: 'Lebenslauf (PDF)',
      email: 'E-Mail',
      ownerPortal: 'Owner Portal',
    },
    chatbot: {
      openButton: 'Soumyajits KI fragen',
      openAria: 'Soumyajits KI-Double öffnen',
      title: 'Soumyajits KI-Double',
      subtitle: 'Choreos Labs · Angewandte KI · Trier Verfügbarkeit',
      closeAria: 'Chat schließen',
      greeting:
        'Hey — ich bin Soumyajits KI-Double. Während er gerade Docker debuggt, Bergtrails läuft oder auf der Bahn sprintet, frag mich gern alles über Choreos Labs, seine Computer-Vision-Projekte, den Master in Trier oder eine Zusammenarbeit.',
      starters: [
        'Wie entstand Choreos Labs?',
        'Was hat er im IISCO-Stahlwerk gebaut?',
        'Ist er ab Nov 2026 in Trier verfügbar?',
      ],
      placeholder: 'Frag zu Choreos Labs, Projekten oder Trier...',
      thinking: 'Denkt nach...',
      sendAria: 'Nachricht senden',
      unexpectedError: 'Unerwartete Antwort vom Server.',
      requestFailed: 'Chat-Anfrage fehlgeschlagen.',
      fallbackError: 'Soumyajits KI-Double ist gerade nicht erreichbar.',
      errorPrefix: 'Kurzer Kurzschluss in meinen Leitungen:',
    },
  },
} as const;

const CASE_STUDIES_DE: Record<
  string,
  Pick<ProjectCaseStudy, 'title' | 'role' | 'organization' | 'summary' | 'impactMetric' | 'highlights'>
> = {
  'choreos-inference': {
    title: 'Inference — Gehirntraining, das sich wie Sport anfühlt',
    role: 'Mitgründer & Entwickler',
    organization: 'Choreos Labs Pvt. Ltd.',
    summary:
      'Choreos Labs mitgegründet, um mobile Apps zu bauen, in denen Neurowissenschaft auf knackiges Spielgefühl trifft. Inference bündelt 50+ Reaktions-, Taktik- und kognitive Scroll-Modi auf Basis eines containerisierten Python-, PostgreSQL- und Redis-Stacks.',
    impactMetric: '50+ Spielmodi · Natives Kotlin + GCP-Backend',
    highlights: [
      'Native Android-Module in Kotlin entwickelt – fokussiert auf Reaktionsgeschwindigkeit, Arbeitsgedächtnis und Mustererkennung.',
      'Python-Backend mit PostgreSQL und Redis in Docker containerisiert und auf der Google Cloud Platform deployed.',
      'Private Alpha- und Beta-Builds direkt an frühe Tester ausgeliefert und anhand kognitiver Analysen iteriert.',
    ],
  },
  'iisco-thermal-vision': {
    title: 'Geschmolzenen Stahl ohne Blinzeln überwachen',
    role: 'F&E-Praktikant',
    organization: 'Hi-Tech Systems & Services Ltd.',
    summary:
      'Direkt im IISCO-Stahlwerk Burnpur mit FLIR-Wärmebildkameras unterwegs gewesen, um strukturelle Schwachstellen in Roheisen-Torpedopfannen zu erkennen, bevor teure Ausfälle entstehen.',
    impactMetric: '92% Präzision · Sub-Sekunden-Inferenz vor Ort',
    highlights: [
      'Rohe FLIR-Wärmebilddaten manuell direkt neben laufenden Torpedopfannen im Werk erfasst.',
      'Objekterkennungs-Pipeline trainiert, die 92 % Validierungspräzision auf dem realen Produktionsserver erreichte.',
      'Inferenzzeiten direkt auf der Werkshallen-Hardware auf unter eine Sekunde optimiert.',
    ],
  },
  'combat-biomechanics': {
    title: 'Einer Webcam Schlag-Biomechanik beibringen',
    role: 'Computer-Vision-Entwickler',
    organization: 'Eigenes Labor',
    summary:
      'Einen Echtzeit-Pose-Tracker mit MediaPipe und TensorFlow gebaut, der Kampfstellung und Schlagbahnen direkt aus Webcam-Video liest und sportliche Bewegung in saubere Biomechanik-Telemetrie verwandelt.',
    impactMetric: 'Echtzeit-Pose- & Schlagklassifikation',
    highlights: [
      'Extrahiert Gelenk-Landmarks direkt aus normalem Video – ganz ohne klobige Handgelenkssensoren.',
      'Klassifiziert Schläge und Deckungshaltungen live während athletischer Drills.',
    ],
  },
  'setu-gen-bi': {
    title: 'In klarem Deutsch/Englisch mit SQL-Datenbanken sprechen',
    role: 'GenAI- & BI-Praktikant',
    organization: 'SETU Business School × NASSCOM',
    summary:
      'Einen generativen BI-Assistenten entwickelt, mit dem Event-Teams normale Fragen stellen und sofort geprüfte SQL-Abfragen, Tabellen und Diagramme erhalten – ganz ohne nächtliches JOIN-Debugging.',
    impactMetric: 'NASSCOM Event-Analytics · LangChain + PandasAI',
    highlights: [
      'Python und LangChain gekoppelt, um natürliche Sprache sicher in SQLite-Abfragen zu übersetzen.',
      'Automatisches Charting mit PandasAI und vollständige Abfrage-Protokollierung gegen Black-Box-Verhalten ergänzt.',
    ],
  },
  'saferoute-ai': {
    title: 'SafeRoute AI: Dashcam-Schlagloch-Detektor',
    role: 'Entwickler',
    organization: 'Computer Vision',
    summary:
      'Eine YOLOv8-Dashcam-Pipeline, die Schlaglöcher in Echtzeit erkennt, deren Schweregrad bewertet und GPS-gestempelte CSV-/SQL-Berichte erzeugt.',
    impactMetric: 'Automatische georeferenzierte Schadensberichte',
    highlights: [
      'Verarbeitet fortlaufendes Straßenmaterial mit automatischer Frame-Bereinigung und Bounding-Box-Bewertung.',
      'Erzeugt strukturierte CSV- und SQL-Tabellen mit Zeitstempeln, Schweregraden und Koordinaten.',
    ],
  },
  'robotic-waste-sorter': {
    title: 'ShuffleNet + Arduino Müllsortierer',
    role: 'Hardware- & ML-Entwickler',
    organization: 'RCCIIT Abschlussprojekt',
    summary:
      'Meine Maschinenbau-Wurzeln mit Deep Learning verbunden: ein leichtgewichtiger ShuffleNet-v2-Bildklassifikator steuert Arduino-Servoklappen über eine Ringpuffer-Logik.',
    impactMetric: 'Vision-zu-Servo physische Aktorik',
    highlights: [
      'Schnellen ShuffleNet-v2-Klassifikator auf TrashNet für ressourcenschonende Kamera-Inferenz trainiert.',
      'Mechanische Servoklappen über eine Circular-Queue synchronisiert, damit jedes Teil sauber im richtigen Fach landet.',
    ],
  },
};

const CURRENT_FOCUS_DE = [
  {
    tag: 'Aktuell · Trier, Deutschland',
    title: 'M.Sc. Data Science an der Universität Trier',
    detail:
      'Tief eingetaucht in statistisches Lernen, skalierbare Daten-Pipelines und angewandte KI – während ich deutsche Bürokratie meistere und Schritt für Schritt Deutsch lerne (eine Bäckerei-Bestellung nach der anderen).',
  },
  {
    tag: 'Startup · Choreos Labs',
    title: 'Kognitive Games & Performance-Tech skalieren',
    detail:
      'Baue Choreos Labs (github.com/choreoslabs) gemeinsam mit Soumyadeb Saha weiter aus – wir entwickeln Inference weiter und bringen mobile kognitive Telemetrie näher an echtes Athletiktraining.',
  },
  {
    tag: 'Offen ab Nov 2026',
    title: 'Werkstudentenstellen & ausgewählte Freelance-Builds',
    detail:
      'Verfügbar für 16–20 Stunden/Woche im Raum Trier oder remote für Teams im Bereich angewandte KI, Datensysteme, Backend-APIs oder Computer-Vision-Produkte.',
  },
];

const ADVENTURE_DE: Record<string, Pick<AdventureSnapshot, 'title' | 'location' | 'caption' | 'tag'>> = {
  'adv-camping': {
    title: 'Milchstraße über dem Basislager',
    location: 'Bergcamp',
    caption:
      'Leuchtende Zelte unter schroffen Graten ohne jede Lichtverschmutzung – nichts macht den Kopf schneller frei als kalte Bergluft und ein klarer Nachthimmel.',
    tag: 'Camping & Sternenhimmel',
  },
  'adv-trier': {
    title: 'Tag eins an der Universität Trier',
    location: 'Trier, Deutschland',
    caption:
      'Herbstlaub auf dem Campus und der offizielle Start meines Data-Science-Masters in Deutschlands ältester Stadt.',
    tag: 'Start in Trier',
  },
  'adv-boxing-drill': {
    title: 'Pratzen- & Drill-Runden (Archiv)',
    location: 'Trainingsmatte',
    caption:
      'Rückblick auf meine Box-Drills – denselben Fokus und dasselbe Tempo nehme ich heute in harte Engineering-Sprints mit.',
    tag: 'Box-Drills',
  },
};

const EXPERIENCE_DE: Record<
  string,
  Pick<ExperienceItem, 'period' | 'location' | 'title' | 'summaryPoints'>
> = {
  choreos: {
    period: 'Dez 2025 — Aug 2026',
    location: 'Nadia, Indien',
    title: 'Mitgründer & Systems Builder',
    summaryPoints: [
      'Inference mitentwickelt – eine native Android-Plattform für kognitive Spiele mit Scroll-, Taktik- und Reaktions-Challenges.',
      'Native Kotlin-Clientmodule und Python-Backend-Services auf Basis von PostgreSQL und Redis in Docker-Containern geschrieben.',
      'Den gesamten Backend-Stack auf Google Cloud Platform deployed und private Alpha-/Beta-Releases geleitet.',
    ],
  },
  setu: {
    period: 'Jul 2024 — Sep 2024',
    location: 'Kolkata, Indien',
    title: 'Forschungspraktikant — Generative KI & BI',
    summaryPoints: [
      'In Zusammenarbeit mit NASSCOM ein generatives BI-Dashboard entwickelt, über das Teams SQLite-Eventdaten in natürlicher Sprache abfragen konnten.',
      'Python + LangChain angebunden, um Fragen in verifiziertes SQL zu übersetzen und Ergebnisse mit Streamlit und PandasAI zu visualisieren.',
      'Vollständige Interaktions- und SQL-Protokollierung integriert, damit jede generierte Antwort nachvollziehbar bleibt.',
    ],
  },
  hitech: {
    period: 'Apr 2024 — Jul 2024',
    location: 'Kolkata, Indien',
    title: 'F&E-Praktikant — Industrielle Computer Vision',
    summaryPoints: [
      'Reale FLIR-Wärmebildaufnahmen direkt vor Ort im IISCO-Stahlwerk Burnpur bei laufenden Torpedopfannen gesammelt.',
      'Objekterkennungs-Pipeline entwickelt und auf 92 % Validierungspräzision auf dem realen Werksserver abgestimmt.',
      'Sub-Sekunden-Inferenz erreicht, um thermische Schwachstellen automatisch zu melden.',
    ],
  },
};

const EDUCATION_DE: Record<string, Pick<EducationItem, 'period' | 'location' | 'degree' | 'detail'>> = {
  trier: {
    period: 'Okt 2026 — Heute',
    location: 'Trier, Deutschland',
    degree: 'M.Sc. in Data Science',
    detail: 'EQF-Niveau 7 · Angewandte KI, Statistisches Lernen & Datensysteme',
  },
  rcciit: {
    period: 'Jul 2022 — Jun 2025',
    location: 'Kolkata, Indien',
    degree: 'B.Tech in Informationstechnologie',
    detail: 'EQF-Niveau 6 · Note: 7,9 / 10',
  },
  hit: {
    period: 'Aug 2019 — Jul 2022',
    location: 'Hooghly, Indien',
    degree: 'Diplom in Maschinenbau',
    detail: 'EQF-Niveau 5 · Note: 8,1 / 10 (hier begann mein Hardware-Gespür)',
  },
};

const SOCIAL_DE: Record<string, Pick<SocialMilestone, 'title' | 'caption' | 'dateLabel' | 'category'>> = {
  'seed-linkedin-trier': {
    title: 'In Trier gelandet für den M.Sc. Data Science',
    caption:
      'Offiziell nach Deutschland gezogen, um meinen Master an der Universität Trier zu starten. Ab November 2026 offen für Werkstudentenstellen (16–20 Std./Wo.) und fokussierte Freelance-Projekte.',
    dateLabel: 'Okt 2026',
    category: 'Leben & Karriere',
  },
  'seed-instagram-training': {
    title: 'Morgensprints auf der Bahn vor den Compiler-Fehlern',
    caption:
      'Frühe Intervalle auf der Laufbahn schlagen das Starren auf eine kaputte Pipeline. Überall dasselbe Mindset: Tempo halten, Muster lesen, schnell anpassen.',
    dateLabel: 'Nov 2026',
    category: 'Sport',
  },
  'seed-linkedin-choreos': {
    title: 'Was wir bei Choreos Labs gebaut haben',
    caption:
      'Inference begann als verrückte Idee, kognitive Geschwindigkeit wie im Sport zu trainieren. Daraus wurden Kotlin, Python, Redis, Docker und echte Beta-Tester.',
    dateLabel: 'Aug 2026',
    category: 'Startup',
  },
  'seed-instagram-adventure': {
    title: 'Auf der Suche nach Höhenmetern & unbefestigten Trails',
    caption:
      'Sobald der Laptop zuklappt, suche ich einen Bergkamm, einen schnellen Sprint oder ein Zugticket an einen neuen Ort.',
    dateLabel: 'Nov 2026',
    category: 'Abenteuer & Reisen',
  },
};

const SKILLS_DE = [
  { group: 'Sprachen, mit denen ich wirklich gern arbeite', items: TECHNICAL_SKILLS[0].items },
  { group: 'Backend & Infrastruktur', items: TECHNICAL_SKILLS[1].items },
  { group: 'KI, Computer Vision & Hardware', items: TECHNICAL_SKILLS[2].items },
];

export function getCaseStudies(lang: Language): ProjectCaseStudy[] {
  if (lang === 'en') return CASE_STUDIES;
  return CASE_STUDIES.map((cs) => {
    const tr = CASE_STUDIES_DE[cs.id];
    return tr ? { ...cs, ...tr } : cs;
  });
}

export function getCurrentFocus(lang: Language) {
  return lang === 'de' ? CURRENT_FOCUS_DE : CURRENT_FOCUS_ITEMS;
}

export function getAdventureSnapshots(lang: Language): AdventureSnapshot[] {
  if (lang === 'en') return ADVENTURE_SNAPSHOTS;
  return ADVENTURE_SNAPSHOTS.map((snap) => {
    const tr = ADVENTURE_DE[snap.id];
    return tr ? { ...snap, ...tr } : snap;
  });
}

export function getExperienceList(lang: Language): ExperienceItem[] {
  if (lang === 'en') return EXPERIENCE_LIST;
  return EXPERIENCE_LIST.map((item) => {
    const tr = EXPERIENCE_DE[item.id];
    return tr ? { ...item, ...tr } : item;
  });
}

export function getEducationList(lang: Language): EducationItem[] {
  if (lang === 'en') return EDUCATION_LIST;
  return EDUCATION_LIST.map((edu) => {
    const tr = EDUCATION_DE[edu.id];
    return tr ? { ...edu, ...tr } : edu;
  });
}

export function getDefaultSocialMilestones(lang: Language): SocialMilestone[] {
  if (lang === 'en') return DEFAULT_SOCIAL_MILESTONES;
  return DEFAULT_SOCIAL_MILESTONES.map((item) => {
    const tr = SOCIAL_DE[item.id];
    return tr ? { ...item, ...tr } : item;
  });
}

export function getTechnicalSkills(lang: Language) {
  return lang === 'de' ? SKILLS_DE : TECHNICAL_SKILLS;
}
