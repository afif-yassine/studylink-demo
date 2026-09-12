export type Tutor = {
  id: string;
  name: string;
  initials: string;
  campus: string;
  subject: string;
  level: string;
  rating: number;
  reviews: number;
  price: number;
  responseTime: string;
  completedSessions: number;
  matchScore: number;
  bio: string;
  tags: string[];
  slots: string[];
  languages: string[];
  verified: boolean;
  pro?: boolean;
};

export type Booking = {
  id: string;
  tutor: string;
  tutorInitials: string;
  subject: string;
  date: string;
  time: string;
  status: "Confirmée" | "Terminée" | "À évaluer";
  mode: "Visio Studylink" | "Sur le campus";
  price: number;
};

export type TutorRequest = {
  id: string;
  student: string;
  initials: string;
  subject: string;
  exam: string;
  slot: string;
  note: string;
};

export type SupportTicket = {
  id: string;
  category: string;
  user: string;
  age: string;
  priority: "Haute" | "Normale";
  status: "Nouveau" | "En cours";
};

export const campuses = [
  "ESTIAM Paris",
  "Université Paris Cité",
  "Sorbonne Université",
] as const;

export const subjects = [
  "Toutes les matières",
  "Java & Spring",
  "React & TypeScript",
  "Mathématiques",
  "Bases de données",
  "Python & IA",
] as const;

export const tutors: Tutor[] = [
  {
    id: "lina-haddad",
    name: "Lina Haddad",
    initials: "LH",
    campus: "ESTIAM Paris",
    subject: "Java & Spring",
    level: "Master 2 · Génie logiciel",
    rating: 4.9,
    reviews: 42,
    price: 15,
    responseTime: "8 min",
    completedSessions: 86,
    matchScore: 98,
    bio: "Préparation ciblée aux partiels Java, Spring Boot et architecture. Je travaille à partir des supports et exercices ESTIAM.",
    tags: ["Java 21", "Spring Boot", "API REST"],
    slots: ["Aujourd'hui · 18:30", "Demain · 12:15", "Mercredi · 17:00"],
    languages: ["Français", "Anglais"],
    verified: true,
    pro: true,
  },
  {
    id: "amine-benali",
    name: "Amine Benali",
    initials: "AB",
    campus: "ESTIAM Paris",
    subject: "React & TypeScript",
    level: "Master 1 · Web & Mobile",
    rating: 4.8,
    reviews: 31,
    price: 15,
    responseTime: "12 min",
    completedSessions: 61,
    matchScore: 94,
    bio: "Sessions orientées projet : composants, hooks, TypeScript et préparation aux soutenances techniques.",
    tags: ["React", "Next.js", "TypeScript"],
    slots: ["Aujourd'hui · 19:00", "Mardi · 16:30", "Jeudi · 11:00"],
    languages: ["Français", "Arabe"],
    verified: true,
  },
  {
    id: "sarah-diallo",
    name: "Sarah Diallo",
    initials: "SD",
    campus: "ESTIAM Paris",
    subject: "Bases de données",
    level: "Master 2 · Data engineering",
    rating: 5,
    reviews: 19,
    price: 15,
    responseTime: "5 min",
    completedSessions: 39,
    matchScore: 91,
    bio: "SQL, modélisation et révision guidée sur vos propres exercices. Fiches de synthèse fournies après la séance.",
    tags: ["PostgreSQL", "SQL", "Modélisation"],
    slots: ["Demain · 09:30", "Demain · 18:00", "Vendredi · 14:00"],
    languages: ["Français", "Anglais"],
    verified: true,
    pro: true,
  },
  {
    id: "mehdi-akram",
    name: "Mehdi Akram",
    initials: "MA",
    campus: "Université Paris Cité",
    subject: "Python & IA",
    level: "Master 2 · Intelligence artificielle",
    rating: 4.9,
    reviews: 27,
    price: 15,
    responseTime: "15 min",
    completedSessions: 48,
    matchScore: 96,
    bio: "Python sans jargon, notebooks commentés et préparation aux projets de machine learning.",
    tags: ["Python", "Pandas", "Machine learning"],
    slots: ["Mardi · 10:00", "Mercredi · 15:30", "Samedi · 11:00"],
    languages: ["Français", "Anglais"],
    verified: true,
  },
  {
    id: "chloe-martin",
    name: "Chloé Martin",
    initials: "CM",
    campus: "Université Paris Cité",
    subject: "Mathématiques",
    level: "Licence 3 · Mathématiques",
    rating: 4.7,
    reviews: 36,
    price: 15,
    responseTime: "20 min",
    completedSessions: 73,
    matchScore: 92,
    bio: "Méthode structurée pour reprendre les bases et réussir les exercices de contrôle.",
    tags: ["Algèbre", "Analyse", "Probabilités"],
    slots: ["Aujourd'hui · 17:30", "Jeudi · 13:00", "Samedi · 10:00"],
    languages: ["Français"],
    verified: true,
  },
  {
    id: "lucas-moreau",
    name: "Lucas Moreau",
    initials: "LM",
    campus: "Sorbonne Université",
    subject: "Java & Spring",
    level: "Master 1 · Informatique",
    rating: 4.6,
    reviews: 14,
    price: 15,
    responseTime: "25 min",
    completedSessions: 28,
    matchScore: 88,
    bio: "Révision de Java objet, tests et architecture d'applications avec exemples simples.",
    tags: ["Java", "JUnit", "Architecture"],
    slots: ["Mercredi · 18:30", "Vendredi · 16:00", "Samedi · 14:00"],
    languages: ["Français", "Anglais"],
    verified: true,
  },
];

export const initialBookings: Booking[] = [
  {
    id: "ST-24018",
    tutor: "Lina Haddad",
    tutorInitials: "LH",
    subject: "Java & Spring",
    date: "14 septembre 2026",
    time: "12:15 – 13:15",
    status: "Confirmée",
    mode: "Visio Studylink",
    price: 16,
  },
  {
    id: "ST-23944",
    tutor: "Amine Benali",
    tutorInitials: "AB",
    subject: "React & TypeScript",
    date: "9 septembre 2026",
    time: "17:30 – 18:30",
    status: "À évaluer",
    mode: "Sur le campus",
    price: 16,
  },
  {
    id: "ST-23671",
    tutor: "Sarah Diallo",
    tutorInitials: "SD",
    subject: "Bases de données",
    date: "3 septembre 2026",
    time: "18:00 – 19:00",
    status: "Terminée",
    mode: "Visio Studylink",
    price: 16,
  },
];

export const tutorRequests: TutorRequest[] = [
  {
    id: "RQ-1092",
    student: "Mohamed Tahiri",
    initials: "MT",
    subject: "Java & Spring",
    exam: "Partiel Spring Boot · 22 sept.",
    slot: "Mardi · 18:30",
    note: "Besoin de revoir Spring Security et les tests d'intégration.",
  },
  {
    id: "RQ-1095",
    student: "Emma Laurent",
    initials: "EL",
    subject: "API REST",
    exam: "Soutenance projet · 25 sept.",
    slot: "Jeudi · 12:00",
    note: "Préparation aux questions du jury et revue de l'architecture.",
  },
  {
    id: "RQ-1099",
    student: "Nora Bensaïd",
    initials: "NB",
    subject: "Java 21",
    exam: "Contrôle continu · 28 sept.",
    slot: "Vendredi · 17:00",
    note: "Exercices sur les streams, records et programmation fonctionnelle.",
  },
];

export const supportTickets: SupportTicket[] = [
  { id: "SUP-482", category: "No-show tuteur", user: "Ilyes M.", age: "12 min", priority: "Haute", status: "Nouveau" },
  { id: "SUP-479", category: "Remboursement", user: "Camille R.", age: "34 min", priority: "Normale", status: "En cours" },
  { id: "SUP-475", category: "Accès visioconférence", user: "Sara D.", age: "1 h 06", priority: "Normale", status: "Nouveau" },
];

export const campusSubjectUsage = [
  { label: "Informatique", value: 82, sessions: 96 },
  { label: "Mathématiques", value: 64, sessions: 58 },
  { label: "Data", value: 48, sessions: 35 },
  { label: "Langues", value: 31, sessions: 23 },
];

export const revenueMonths = [
  { month: "Avr.", value: 620 },
  { month: "Mai", value: 880 },
  { month: "Juin", value: 1120 },
  { month: "Juil.", value: 980 },
  { month: "Août", value: 1340 },
  { month: "Sept.", value: 1900 },
];
