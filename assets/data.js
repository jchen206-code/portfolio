/* ============================================================================
 *  data.js  —  EVERYTHING ON THE SITE COMES FROM THIS FILE.
 *
 *  Two ways to change the site:
 *    1. Edit the strings below in any text editor, save, refresh.
 *    2. Open the site with ?edit=1 at the end of the URL (or click
 *       "Edit content" in the footer) for a form editor with text boxes.
 *       When you are happy, click "Export data.js" and replace this file.
 *
 *  Rules of thumb:
 *    - Anything in "quotes" is text you can freely rewrite.
 *    - Leave a link "" (empty) if you don't have one yet — the site will
 *      hide the button instead of showing a broken link.
 *    - Lists are in [square brackets], items separated by commas.
 * ==========================================================================*/

window.PORTFOLIO_DATA = {

  /* --------------------------------------------------------------------
   * 1. PERSONAL  —  who you are
   * ------------------------------------------------------------------ */
  personal: {
    name: "Jeffrey Chen",

    // Shown under your name, in the accent color.
    title: "Full-Stack Developer · Computer Science Student",

    // Small line above your name. Leave "" to hide it.
    location: "Available for internships & new grad roles",

    /* ---- RUBRIC: PERSONAL STATEMENT (2 pts) -------------------------
     * "Who you are in one sentence." Keep it to ONE sentence.
     * Wrap a few words in <strong>...</strong> to make them pop.
     *
     * Two alternates if you prefer a different angle — swap one in:
     *
     *  "I'm a computer science student who builds production web
     *   software end to end, from database schema to shipped UI."
     *
     *  "I'm a full-stack developer who turns messy real-world business
     *   problems into clean, fast software that people actually use."
     * ---------------------------------------------------------------- */
    statement:
      "I'm a computer science student and <strong>full-stack developer</strong> who " +
      "builds production web software end to end — currently shipping " +
      "<strong>MenuMonkey</strong>, a multi-tenant restaurant ordering platform " +
      "running on React, TypeScript and Supabase.",
  },

  /* --------------------------------------------------------------------
   * 2. ABOUT  —  optional. Set `show: false` to hide the whole section.
   * ------------------------------------------------------------------ */
  about: {
    show: true,
    paragraphs: [
      "I like the parts of software most people skip: the auth race condition " +
      "that only shows up on a cold load, the image pipeline that takes a page " +
      "from sluggish to instant, the admin screen a non-technical owner can " +
      "actually use without training.",

      "Most of my recent work has been on MenuMonkey, where I own the whole " +
      "stack — Postgres schema and row-level security, the customer ordering " +
      "flow, the restaurant-facing dashboard, and the deploy. Before that I " +
      "worked through a traditional CS curriculum in Java, which is still " +
      "where my instincts about data structures come from.",
    ],
  },

  /* --------------------------------------------------------------------
   * 3. CONTACT  —  leave any field "" to hide that link.
   * ------------------------------------------------------------------ */
  contact: {
    email:    "jeffrey.chen206@gmail.com",

    // TODO: replace with your real profile URLs.
    github:   "https://github.com/YOUR-USERNAME",
    linkedin: "",
    website:  "",

    /* Résumé button. Leave "" and the button stays hidden.
     * To turn it on: drop a file named resume.pdf in the project folder,
     * then change this to "resume.pdf". */
    resumeUrl: "",
  },

  /* --------------------------------------------------------------------
   * 4. SKILLS  (RUBRIC: 2 pts)
   *    Grouped so a recruiter can scan it in five seconds.
   *    Add / remove / rename groups freely.
   * ------------------------------------------------------------------ */
  skillsLede:
    "The tools I reach for most, grouped by where they sit in the stack.",

  skillGroups: [
    {
      title: "Languages",
      skills: ["TypeScript", "JavaScript (ES2022)", "Java", "SQL", "HTML5", "CSS3"],
    },
    {
      title: "Frontend",
      skills: [
        "React 19", "TanStack Router", "TanStack Query", "Tailwind CSS",
        "Radix UI / shadcn", "React Hook Form", "Zod", "Recharts",
      ],
    },
    {
      title: "Backend & Data",
      skills: [
        "Supabase", "PostgreSQL", "Row-Level Security", "Node.js",
        "REST APIs", "Twilio SMS", "Anthropic Claude API",
      ],
    },
    {
      title: "Tooling & Practice",
      skills: [
        "Git & GitHub", "Vite", "ESLint + Prettier", "Responsive design",
        "Web accessibility", "Internationalization (i18n)", "Performance tuning",
      ],
    },
  ],

  /* --------------------------------------------------------------------
   * 5. PROJECTS  (RUBRIC: 2 pts — needs 2–3 with descriptions + links)
   *
   *    Each card:
   *      name      - project title
   *      year      - shown top-right, e.g. "2025 – present". "" hides it.
   *      badge     - small colored label, e.g. "Featured". "" hides it.
   *      summary   - ONE bold line: what it is
   *      description - 2–3 sentences: what you actually built
   *      tags      - tech list shown as pills
   *      codeUrl   - link to the repo   ("" hides the button)
   *      demoUrl   - link to a live demo ("" hides the button)
   *      linkNote  - shown ONLY when both links are empty, so the card
   *                  never renders a dead link
   *      featured  - true = subtle accent border
   * ------------------------------------------------------------------ */
  projectsLede:
    "A few things I have designed, built and shipped. Code links where the " +
    "repository is public.",

  projects: [
    {
      name: "MenuMonkey",
      year: "2025 – present",
      badge: "Featured",
      featured: true,
      summary: "A multi-tenant ordering and menu-management platform for restaurants.",
      description:
        "Full-stack SaaS I built end to end: customers browse a restaurant's " +
        "storefront and place same-day pickup orders, while owners manage menus, " +
        "hours and staff from an admin console. I built the drag-to-reorder menu " +
        "editor with nested choice groups, revenue dashboards broken down by month, " +
        "SMS order notifications through Twilio, and Supabase auth with role-based " +
        "staff permissions — plus an image pipeline that compresses uploads and " +
        "preloads the hero image to keep storefronts fast on mobile.",
      tags: [
        "React 19", "TypeScript", "TanStack Start", "Supabase",
        "PostgreSQL", "Tailwind CSS", "Twilio",
      ],
      // TODO: add your repo / live URLs here.
      codeUrl: "",
      demoUrl: "",
      linkNote: "Private repository — walkthrough available on request.",
    },

    {
      name: "MenuMonkey Automation",
      year: "2025",
      badge: "",
      featured: false,
      summary: "A browser-automation framework packaged as a Tampermonkey userscript.",
      description:
        "A zero-dependency userscript that automates a two-panel internal web app. " +
        "It learns the page structure from three user clicks — left panel, right " +
        "panel, one example card — then infers which DOM elements are cards and " +
        "where inside each card to click, so it keeps working when the app's markup " +
        "changes. Includes a floating control panel, hover highlighting for the " +
        "element it has detected, and a test harness that runs against a static " +
        "HTML fixture.",
      tags: ["JavaScript", "DOM APIs", "Tampermonkey", "Browser automation", "Testing"],
      codeUrl: "",
      demoUrl: "",
      linkNote: "Private repository — walkthrough available on request.",
    },

    {
      /* NOTE: this third card is a draft based on your Java coursework.
       * The assignment skeleton was instructor-provided and you filled in
       * the core logic — the wording below says that honestly. Swap the
       * whole card out if you'd rather showcase something else. */
      name: "Solar Panel Grid Simulator",
      year: "2024",
      badge: "",
      featured: false,
      summary: "An object-oriented Java simulation of a city solar-panel installation.",
      description:
        "Coursework project where I implemented the core simulation classes for a " +
        "grid of rooftop and parking-lot solar panels: a 2D street map, per-panel " +
        "rated vs. actual efficiency, randomized failure and degradation over time, " +
        "and aggregate electricity output across the grid. Rendered with an animated " +
        "StdDraw visualization driver on top of the model classes.",
      tags: ["Java", "OOP", "2D arrays", "Simulation", "StdDraw"],
      codeUrl: "",
      demoUrl: "",
      linkNote: "Coursework — source available on request.",
    },
  ],

  /* --------------------------------------------------------------------
   * 6. CONTACT SECTION copy
   * ------------------------------------------------------------------ */
  contactLede:
    "I'm open to internship and new-grad software roles. The fastest way to " +
    "reach me is email.",
};
