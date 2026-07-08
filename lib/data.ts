export type Project = {
  index: string;
  title: string;
  year: string;
  role: string;
  tags: string[];
  accent: string;
  /** two hues for the floating preview's animated gradient */
  gradient: [string, string];
  description: string;
  href?: string;
  /** screenshot shown in the floating cursor preview */
  image?: string;
};

export const PROJECTS: Project[] = [
  {
    index: "001",
    title: "LUSSO VELOCE",
    year: "LIVE",
    role: "Design & Development",
    tags: ["Next.js", "Supabase", "Stripe"],
    accent: "#ffb454",
    gradient: ["#3a2705", "#ffb454"],
    description:
      "A luxury exotic car rental platform — curated fleet browsing, a polished reservation flow, real Stripe payments, and a complete Supabase backend. Built end-to-end, shipped for real.",
    href: "https://lusso-veloce.vercel.app",
    image: "/img/Screenshot 2026-07-02 223147.png",
  },
  {
    index: "002",
    title: "FLYBY",
    year: "IN PROGRESS",
    role: "Design & Development",
    tags: ["React Native", "Expo", "Mapbox"],
    accent: "#6ea8ff",
    gradient: ["#0a1c3d", "#6ea8ff"],
    description:
      "A driving app with live speed tracking, a global leaderboard, and a fog-of-war map — the world starts dark, and you unlock cities by actually driving through them.",
    href: "https://fly-by-rosy.vercel.app",
    image: "/img/Screenshot 2026-07-03 143349.png",
  },
  {
    index: "003",
    title: "TRADEBOT",
    year: "TESTING",
    role: "Engineering",
    tags: ["Python", "OANDA API", "Next.js"],
    accent: "#3fd2c7",
    gradient: ["#062c2a", "#3fd2c7"],
    description:
      "An automated trading system that reads live gold charts and makes its own long/short decisions, with a Next.js dashboard watching its every move. It trades while I sleep.",
    href: "https://tradebot-beta.vercel.app",
    image: "/img/Screenshot 2026-07-03 135757.png",
  },
  {
    index: "004",
    title: "PROJECT GARAGE",
    year: "LIVE",
    role: "Design & Development",
    tags: ["Next.js", "Database", "Expense Tracking"],
    accent: "#ff5c28",
    gradient: ["#3d1206", "#ff5c28"],
    description:
      "A car management app for people who love their machines — add your vehicles, log every modification with exact costs, track services, and watch total ownership spend over time.",
    href: "https://project-garage-rose.vercel.app",
    image: "/img/Screenshot 2026-07-03 101118.png",
  },
];

export type SkillGroup = {
  label: string;
  note: string;
  items: string[];
};

export const SKILLS: SkillGroup[] = [
  {
    label: "LANGUAGE",
    note: "The grammar",
    items: ["TypeScript", "JavaScript", "Java", "Python", "C#", "Swift", "PHP", "SQL", "HTML / CSS"],
  },
  {
    label: "FRAMEWORK",
    note: "The skeleton",
    items: ["React", "Next.js", "Angular", "React Native", "Node", ".NET / ASP.NET", "Laravel", "TailwindCSS"],
  },
  {
    label: "DATA & CLOUD",
    note: "The engine room",
    items: ["MySQL", "Supabase", "Azure DevOps", "Vercel", "Stripe", "Mapbox"],
  },
  {
    label: "ALSO FLUENT IN",
    note: "The range",
    items: ["Unity", "WordPress", "Expo", "Git"],
  },
];

export type CareerEntry = {
  period: string;
  role: string;
  place: string;
  note: string;
};

export const CAREER: CareerEntry[] = [
  {
    period: "2026 — NOW",
    role: "Co-op Developer",
    place: "Ministry of Public & Business Service Delivery & Procurement (MPBSDP)",
    note: "Two consecutive co-op terms through December — quality and testing focus. Learning what production software demands when real people depend on it.",
  },
  {
    period: "2024 — NOW",
    role: "Software Development",
    place: "Mohawk College — Program 559",
    note: "Web-app focused. The coursework teaches the fundamentals; the shipping happens between semesters.",
  },
  {
    period: "NIGHTS & WEEKENDS",
    role: "Independent Builder",
    place: "My own backlog",
    note: "Lusso Veloce, Project Garage, FlyBy, a bot that trades gold on its own. No client, no brief — just the rule that everything gets finished.",
  },
  {
    period: "DAY ZERO",
    role: "First localhost:3000",
    place: "A bedroom, way too late",
    note: "One page, one button, one console.log. Some habits survive.",
  },
];

export type Experiment = {
  index: string;
  title: string;
  medium: string;
  gradient: [string, string];
  href?: string;
  image?: string;
};

export const EXPERIMENTS: Experiment[] = [
  { index: "E—01", title: "SOFT", medium: "Design study — minimal Gen Z aesthetic", gradient: ["#1b0f3d", "#c9a2ff"], href: "https://soft-design.vercel.app/", image: "/img/Screenshot 2026-07-03 095957.png" },
  { index: "E—02", title: "NOIR", medium: "Design study — high-contrast cinema", gradient: ["#12122e", "#6ea8ff"], href: "https://mysterious-design.vercel.app/", image: "/img/Screenshot 2026-07-03 100331.png" },
  { index: "E—03", title: "CASUAL", medium: "Design study — approachable modern", gradient: ["#231a02", "#ffb454"], href: "https://casual-design-five.vercel.app/", image: "/img/Screenshot 2026-07-03 100054.png" },
  { index: "E—04", title: "FOG OF WAR", medium: "Mapbox exploration mask from FlyBy", gradient: ["#032622", "#3fd2c7"], image: "/img/Screenshot 2026-07-08 112150.png" },
  { index: "E—05", title: "BACKTEST RIG", medium: "Trading strategies, simulated overnight", gradient: ["#26043a", "#ff6ad5"], image: "/img/Screenshot 2026-07-08 112603.png" },
  { index: "E—06", title: "THE OBSERVATORY", medium: "This website — 16,000 particles deep", gradient: ["#2d0a02", "#ff5c28"], image: "/img/Screenshot 2026-07-08 112400.png" },
];

export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/Sirmira1" },
  { label: "LinkedIn", href: "https://linkedin.com/in/nikola-anastasijevic-a737632ba/" },
  { label: "Website", href: "https://www.nikolaanastasijevic.com" },
];

export const EMAIL = "nikolaanastasijevic0@gmail.com";
