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
  bio: string;
  tags: string[];
  slots: string[];
  verified: boolean;
  featured?: boolean;
};

export const campuses = ["ESTIAM Paris", "Université Paris Cité", "Sorbonne Université"] as const;

export const subjects = ["Toutes les matières", "Java & Spring", "React & TypeScript", "Mathématiques", "Bases de données", "Python & IA"] as const;

export const tutors: Tutor[] = [
  { id: "lina-haddad", name: "Lina Haddad", initials: "LH", campus: "ESTIAM Paris", subject: "Java & Spring", level: "Master 2 — Génie logiciel", rating: 4.9, reviews: 42, price: 15, responseTime: "Répond en 8 min", bio: "Je transforme les concepts Spring Boot en exercices concrets et progressifs.", tags: ["Java 21", "Spring Boot", "API REST"], slots: ["Aujourd'hui · 18:30", "Demain · 12:15", "Mercredi · 17:00"], verified: true, featured: true },
  { id: "amine-benali", name: "Amine Benali", initials: "AB", campus: "ESTIAM Paris", subject: "React & TypeScript", level: "Master 1 — Web & Mobile", rating: 4.8, reviews: 31, price: 15, responseTime: "Répond en 12 min", bio: "Sessions orientées projet : composants, hooks, TypeScript et préparation aux rendus.", tags: ["React", "Next.js", "TypeScript"], slots: ["Aujourd'hui · 19:00", "Mardi · 16:30", "Jeudi · 11:00"], verified: true },
  { id: "sarah-diallo", name: "Sarah Diallo", initials: "SD", campus: "ESTIAM Paris", subject: "Bases de données", level: "Master 2 — Data engineering", rating: 5, reviews: 19, price: 15, responseTime: "Répond en 5 min", bio: "SQL, modélisation et révision guidée sur vos propres exercices de cours.", tags: ["PostgreSQL", "SQL", "Modélisation"], slots: ["Demain · 09:30", "Demain · 18:00", "Vendredi · 14:00"], verified: true },
  { id: "mehdi-akram", name: "Mehdi Akram", initials: "MA", campus: "Université Paris Cité", subject: "Python & IA", level: "Master 2 — Intelligence artificielle", rating: 4.9, reviews: 27, price: 15, responseTime: "Répond en 15 min", bio: "Python sans jargon, notebooks commentés et préparation aux projets de machine learning.", tags: ["Python", "Pandas", "Machine learning"], slots: ["Mardi · 10:00", "Mercredi · 15:30", "Samedi · 11:00"], verified: true },
  { id: "chloe-martin", name: "Chloé Martin", initials: "CM", campus: "Université Paris Cité", subject: "Mathématiques", level: "Licence 3 — Mathématiques", rating: 4.7, reviews: 36, price: 15, responseTime: "Répond en 20 min", bio: "Méthode structurée pour reprendre les bases et réussir les exercices de contrôle.", tags: ["Algèbre", "Analyse", "Probabilités"], slots: ["Aujourd'hui · 17:30", "Jeudi · 13:00", "Samedi · 10:00"], verified: true },
  { id: "lucas-moreau", name: "Lucas Moreau", initials: "LM", campus: "Sorbonne Université", subject: "Java & Spring", level: "Master 1 — Informatique", rating: 4.6, reviews: 14, price: 15, responseTime: "Répond en 25 min", bio: "Révision de Java objet, tests et architecture d'applications avec exemples simples.", tags: ["Java", "JUnit", "Architecture"], slots: ["Mercredi · 18:30", "Vendredi · 16:00", "Samedi · 14:00"], verified: true },
];

export const initialBookings = [{ id: "ST-24018", tutor: "Lina Haddad", subject: "Java & Spring", date: "Demain, 12:15", status: "Confirmée", price: 16 }];

