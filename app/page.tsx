"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  GraduationCap,
  Headphones,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  TicketCheck,
  TrendingUp,
  UserCheck,
  UsersRound,
  Video,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  campusSubjectUsage,
  campuses,
  initialBookings,
  revenueMonths,
  subjects,
  supportTickets,
  tutorRequests,
  tutors,
  type Booking,
  type Tutor,
} from "@/lib/mock-data";

type View = "marketplace" | "student" | "tutor" | "campus" | "operations";
type BookingStep = 1 | 2 | 3;
type RequestState = "accepted" | "declined";
type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: Record<string, unknown>;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown | Promise<unknown>;
    },
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

const navigation: { id: View; label: string; shortLabel: string; icon: typeof Search }[] = [
  { id: "marketplace", label: "Marketplace", shortLabel: "Tuteurs", icon: Search },
  { id: "student", label: "Espace étudiant", shortLabel: "Étudiant", icon: GraduationCap },
  { id: "tutor", label: "Espace tuteur", shortLabel: "Tuteur", icon: BookOpen },
  { id: "campus", label: "Campus partenaire", shortLabel: "Campus", icon: Building2 },
  { id: "operations", label: "Opérations", shortLabel: "Ops", icon: LayoutDashboard },
];

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
  trend,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  trend?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-card__top">
        <span className="metric-icon"><Icon /></span>
        {trend && <span className="metric-trend"><TrendingUp /> {trend}</span>}
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-state">
      <span><Search /></span>
      <h3>Aucun tuteur disponible</h3>
      <p>Élargissez la matière ou sélectionnez un autre campus.</p>
      <Button variant="outline" onClick={onReset}>Réinitialiser les filtres</Button>
    </div>
  );
}

function TutorCard({
  tutor,
  favorite,
  onFavorite,
  onProfile,
  onBook,
}: {
  tutor: Tutor;
  favorite: boolean;
  onFavorite: () => void;
  onProfile: () => void;
  onBook: () => void;
}) {
  return (
    <article className="tutor-card">
      <div className="tutor-card__identity">
        <div className="avatar avatar--large" aria-hidden="true">{tutor.initials}</div>
        <div className="tutor-card__title">
          <div className="name-row">
            <h3>{tutor.name}</h3>
            {tutor.verified && <BadgeCheck aria-label="Identité et statut étudiant vérifiés" />}
            {tutor.pro && <StatusPill tone="warning">PRO</StatusPill>}
          </div>
          <p>{tutor.level}</p>
          <div className="tutor-meta">
            <span><MapPin /> {tutor.campus}</span>
            <span><Clock3 /> Répond en {tutor.responseTime}</span>
          </div>
        </div>
        <button
          className={`favorite-button ${favorite ? "favorite-button--active" : ""}`}
          onClick={onFavorite}
          aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart />
        </button>
      </div>

      <div className="match-line">
        <span><Sparkles /> {tutor.matchScore}% compatible avec votre recherche</span>
        <span className="rating"><Star /> {tutor.rating} <small>({tutor.reviews} avis)</small></span>
      </div>

      <p className="tutor-bio">{tutor.bio}</p>
      <div className="tag-row">{tutor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>

      <div className="tutor-card__footer">
        <div>
          <strong>{tutor.price} €</strong>
          <span>/ heure</span>
          <small>{tutor.completedSessions} séances réalisées</small>
        </div>
        <div className="tutor-card__actions">
          <Button variant="outline" onClick={onProfile}>Voir le profil</Button>
          <Button className="gold-button" onClick={onBook}>Réserver <ArrowRight /></Button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("marketplace");
  const [campus, setCampus] = useState<string>(campuses[0]);
  const [subject, setSubject] = useState<string>(subjects[0]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["lina-haddad"]);
  const [requestStates, setRequestStates] = useState<Record<string, RequestState>>({});
  const [available, setAvailable] = useState(true);
  const [reviewedTutors, setReviewedTutors] = useState<string[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<string[]>([]);
  const [campusBudget, setCampusBudget] = useState(4000);
  const [promoApplied, setPromoApplied] = useState(false);

  const visibleTutors = useMemo(
    () => tutors.filter(
      (tutor) =>
        tutor.campus === campus &&
        (subject === subjects[0] || tutor.subject === subject),
    ),
    [campus, subject],
  );

  const openBooking = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setSelectedSlot(tutor.slots[0]);
    setBookingStep(1);
    setPromoApplied(false);
    setBookingOpen(true);
  };

  const confirmBooking = () => {
    if (!selectedTutor || !selectedSlot) return;
    const [date, time] = selectedSlot.split(" · ");
    const booking: Booking = {
      id: `ST-${Math.floor(30000 + Math.random() * 60000)}`,
      tutor: selectedTutor.name,
      tutorInitials: selectedTutor.initials,
      subject: selectedTutor.subject,
      date,
      time: `${time} · 1 heure`,
      status: "Confirmée",
      mode: "Visio Studylink",
      price: promoApplied ? 14.5 : 16,
    };
    setBookings((current) => [booking, ...current]);
    setBookingStep(3);
    toast.success("Paiement autorisé", {
      description: "La séance vient d'être ajoutée à votre agenda.",
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const actOnRequest = (id: string, state: RequestState) => {
    setRequestStates((current) => ({ ...current, [id]: state }));
    toast.success(state === "accepted" ? "Demande acceptée" : "Demande refusée", {
      description: state === "accepted"
        ? "L'étudiant a reçu la confirmation et le lien de paiement."
        : "Le créneau a été remis à disposition.",
    });
  };

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool({
        name: "find_studylink_tutors",
        title: "Rechercher des tuteurs Studylink",
        description: "Recherche les tuteurs disponibles par campus et matière.",
        inputSchema: {
          type: "object",
          properties: {
            campus: { type: "string" },
            subject: { type: "string" },
          },
          required: ["campus"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute(input) {
          const value = input as { campus?: string; subject?: string };
          const matches = tutors.filter(
            (tutor) =>
              tutor.campus === value.campus &&
              (!value.subject || tutor.subject === value.subject),
          );
          return {
            count: matches.length,
            tutors: matches.map(({ id, name, subject, rating, matchScore, slots }) => ({
              id,
              name,
              subject,
              rating,
              matchScore,
              slots,
            })),
          };
        },
      }, { signal: lifecycle.signal });
      await context.registerTool({
        name: "create_demo_booking",
        title: "Créer une réservation Studylink",
        description: "Crée une réservation simulée dans l'espace étudiant.",
        inputSchema: {
          type: "object",
          properties: {
            tutorId: { type: "string" },
            slot: { type: "string" },
          },
          required: ["tutorId", "slot"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const value = input as { tutorId?: string; slot?: string };
          const tutor = tutors.find((item) => item.id === value.tutorId);
          if (!tutor || !value.slot || !tutor.slots.includes(value.slot)) {
            throw new Error("Tuteur ou créneau invalide");
          }
          const id = `ST-${Math.floor(30000 + Math.random() * 60000)}`;
          setBookings((current) => [{
            id,
            tutor: tutor.name,
            tutorInitials: tutor.initials,
            subject: tutor.subject,
            date: value.slot!.split(" · ")[0],
            time: value.slot!.split(" · ")[1],
            status: "Confirmée",
            mode: "Visio Studylink",
            price: 16,
          }, ...current]);
          setView("student");
          return { id, status: "confirmed", tutor: tutor.name, slot: value.slot };
        },
      }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <div className="app-shell">
      <Toaster position="top-right" richColors />

      <div className="pilot-bar">
        <div><span className="live-dot" /> Pilote actif · ESTIAM Paris</div>
        <div className="pilot-bar__metrics">
          <span>184 étudiants actifs</span>
          <span>96,2% de disponibilité</span>
          <span>Support médian : 11 min</span>
        </div>
      </div>

      <header className="site-header">
        <button className="brand" onClick={() => setView("marketplace")} aria-label="Accueil Studylink">
          <span className="brand-mark"><BookOpen /></span>
          <span><strong>Study</strong>link</span>
          <small>Campus OS</small>
        </button>
        <nav aria-label="Navigation principale">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => setView(item.id)}
              >
                <Icon />
                <span className="nav-long">{item.label}</span>
                <span className="nav-short">{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Notifications" onClick={() => toast.info("3 notifications non lues")}>
            <Bell /><span>3</span>
          </button>
          <button className="profile-chip" onClick={() => toast.info("Profil de démonstration")}>
            <span>YA</span>
            <div><strong>Yassine Afif</strong><small>Administrateur démo</small></div>
            <ChevronDown />
          </button>
        </div>
      </header>

      {view === "marketplace" && (
        <main>
          <section className="marketplace-head">
            <div>
              <StatusPill tone="success"><ShieldCheck /> 100% étudiants vérifiés</StatusPill>
              <h1>Préparez votre prochain examen avec un tuteur de votre campus.</h1>
              <p>Des étudiants qui connaissent vos cours, vos professeurs et les attentes de votre établissement.</p>
            </div>
            <div className="marketplace-proof">
              <div><strong>4,8/5</strong><span>note moyenne</span></div>
              <div><strong>90%</strong><span>matching réussi</span></div>
              <div><strong>15 €</strong><span>tarif par heure</span></div>
            </div>
          </section>

          <section className="search-workspace" aria-label="Recherche de tuteur">
            <div className="search-workspace__field">
              <span><MapPin /> Campus</span>
              <Select value={campus} onValueChange={setCampus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {campuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="search-workspace__field">
              <span><BookOpen /> Matière</span>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="search-workspace__field">
              <span><CalendarClock /> Disponibilité</span>
              <button className="date-select" onClick={() => toast.info("Disponibilité : dès aujourd'hui")}>
                Dès aujourd'hui <ChevronDown />
              </button>
            </div>
            <Button className="search-button" onClick={() => toast.success(`${visibleTutors.length} profils correspondent à vos critères`)}>
              <Search /> Rechercher
            </Button>
          </section>

          <section className="marketplace-layout">
            <div className="marketplace-results">
              <div className="section-heading">
                <div>
                  <span>RECOMMANDÉS POUR VOUS</span>
                  <h2>{visibleTutors.length} tuteurs disponibles</h2>
                </div>
                <button onClick={() => toast.info("Tri : pertinence du matching")}>Pertinence <ChevronDown /></button>
              </div>
              <div className="filter-row">
                <StatusPill tone="info"><BadgeCheck /> Profil vérifié</StatusPill>
                <StatusPill>Disponible cette semaine</StatusPill>
                <StatusPill>Note supérieure à 4,5</StatusPill>
              </div>
              <div className="tutor-list">
                {visibleTutors.length ? visibleTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    favorite={favoriteIds.includes(tutor.id)}
                    onFavorite={() => toggleFavorite(tutor.id)}
                    onProfile={() => { setSelectedTutor(tutor); setProfileOpen(true); }}
                    onBook={() => openBooking(tutor)}
                  />
                )) : <EmptyState onReset={() => setSubject(subjects[0])} />}
              </div>
            </div>

            <aside className="marketplace-aside">
              <section className="focus-card">
                <div className="focus-card__head">
                  <span><CalendarDays /></span>
                  <div><small>PROCHAIN OBJECTIF</small><strong>Partiel Java & Spring</strong></div>
                </div>
                <p>22 septembre · Salle B204</p>
                <Progress value={68} />
                <div className="progress-label"><span>Préparation</span><strong>68%</strong></div>
                <ul>
                  <li className="done"><Check /> Bases Spring Boot</li>
                  <li className="done"><Check /> API REST</li>
                  <li><span>3</span> Spring Security</li>
                  <li><span>4</span> Tests d'intégration</li>
                </ul>
                <Button variant="outline" onClick={() => setSubject("Java & Spring")}>Trouver un expert Java</Button>
              </section>

              <section className="trust-card">
                <ShieldCheck />
                <h3>Garantie Studylink</h3>
                <p>Le paiement reste protégé jusqu'à la validation de la séance.</p>
                <div><Check /> Tuteur vérifié</div>
                <div><Check /> Support en moins de 15 min</div>
                <div><Check /> Remboursement si absence</div>
              </section>

              <section className="campus-offer">
                <div><TicketCheck /><span><small>OFFRE BDE ESTIAM</small><strong>-10% sur la première séance</strong></span></div>
                <code>ESTIAM10</code>
              </section>
            </aside>
          </section>
        </main>
      )}

      {view === "student" && (
        <main className="workspace-page">
          <div className="page-heading">
            <div>
              <span className="page-kicker">ESPACE ÉTUDIANT</span>
              <h1>Bonjour Yassine, votre prochaine séance est prête.</h1>
              <p>Suivez vos objectifs, retrouvez vos supports et gérez vos réservations.</p>
            </div>
            <div className="page-actions">
              <Button variant="outline" onClick={() => toast.info("Support Studylink ouvert", { description: "Temps de réponse estimé : 11 minutes." })}><Headphones /> Support</Button>
              <Button className="gold-button" onClick={() => setView("marketplace")}><Search /> Trouver un tuteur</Button>
            </div>
          </div>

          <section className="next-session">
            <div className="next-session__date"><strong>14</strong><span>SEPT.</span><small>12:15</small></div>
            <div className="next-session__main">
              <div><StatusPill tone="success"><span className="live-dot" /> Confirmée</StatusPill><small>PROCHAINE SÉANCE</small></div>
              <h2>Java & Spring · Spring Security</h2>
              <p><span className="avatar avatar--small">LH</span> Lina Haddad · Visio Studylink · 1 heure</p>
            </div>
            <div className="next-session__prep">
              <small>CHECKLIST AVANT LA SÉANCE</small>
              <span><CheckCircle2 /> Support de cours ajouté</span>
              <span><CheckCircle2 /> Questions préparées</span>
            </div>
            <div className="next-session__actions">
              <Button variant="outline" onClick={() => toast.info("Messagerie ouverte avec Lina")}><MessageCircle /> Message</Button>
              <Button className="navy-button" onClick={() => toast.success("Salle de visioconférence prête", { description: "Ouverture simulée pour la soutenance." })}><Video /> Rejoindre la salle</Button>
              <button onClick={() => toast.info("Options : déplacer ou annuler")} aria-label="Plus d'options"><MoreHorizontal /></button>
            </div>
          </section>

          <div className="metric-grid">
            <Metric icon={CalendarDays} label="Séances à venir" value={String(bookings.filter((b) => b.status === "Confirmée").length)} detail="Prochaine le 14 septembre" />
            <Metric icon={Clock3} label="Heures accompagnées" value="7 h" detail="Sur les 30 derniers jours" trend="+2 h" />
            <Metric icon={TrendingUp} label="Plan de révision" value="68%" detail="4 objectifs sur 6 avancés" trend="+12%" />
            <Metric icon={WalletCards} label="Crédit solidaire" value="32 €" detail="Financé par votre campus" />
          </div>

          <section className="student-grid">
            <div className="panel panel--wide">
              <div className="panel-heading">
                <div><CalendarDays /><span><strong>Mes séances</strong><small>Historique et réservations à venir</small></span></div>
                <button onClick={() => toast.info("Vue calendrier activée")}>Vue calendrier <ChevronRight /></button>
              </div>
              <div className="booking-table">
                {bookings.map((booking) => (
                  <article key={booking.id}>
                    <div className="avatar">{booking.tutorInitials}</div>
                    <div className="booking-person"><strong>{booking.subject}</strong><span>{booking.tutor} · {booking.id}</span></div>
                    <div><strong>{booking.date}</strong><span>{booking.time}</span></div>
                    <div><strong>{booking.mode}</strong><span>{booking.price.toFixed(2).replace(".", ",")} € payé</span></div>
                    <StatusPill tone={booking.status === "Confirmée" ? "success" : booking.status === "À évaluer" ? "warning" : "neutral"}>{booking.status}</StatusPill>
                    {booking.status === "À évaluer" ? (
                      <Button size="sm" onClick={() => toast.success("Merci pour votre avis !")}>Évaluer</Button>
                    ) : (
                      <button className="row-menu" aria-label="Actions" onClick={() => toast.info("Détails de la séance")}><MoreHorizontal /></button>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="panel learning-plan">
              <div className="panel-heading">
                <div><ClipboardCheck /><span><strong>Plan de progression</strong><small>Partiel Java · 22 septembre</small></span></div>
              </div>
              {[
                ["Spring Boot", "Maîtrisé", 100],
                ["API REST", "Bon niveau", 84],
                ["Spring Security", "À renforcer", 52],
                ["Tests d'intégration", "À commencer", 20],
              ].map(([name, label, value]) => (
                <div className="skill-progress" key={String(name)}>
                  <div><strong>{name}</strong><span>{label}</span></div>
                  <Progress value={Number(value)} />
                </div>
              ))}
              <Button variant="outline" onClick={() => toast.success("Plan partagé avec Lina")}>Partager au tuteur</Button>
            </div>
          </section>

          <section className="secondary-grid">
            <div className="panel resources-panel">
              <div className="panel-heading"><div><FileCheck2 /><span><strong>Ressources partagées</strong><small>Documents de vos séances</small></span></div></div>
              {["Fiche_Spring_Security.pdf", "Exercices_API_REST.pdf", "Correction_TP_JPA.pdf"].map((file, index) => (
                <button key={file} onClick={() => toast.success(`${file} téléchargé`)}>
                  <span className="file-icon">PDF</span>
                  <span><strong>{file}</strong><small>{[1.8, 2.4, 0.9][index]} Mo · Lina Haddad</small></span>
                  <Download />
                </button>
              ))}
            </div>
            <div className="panel referral-panel">
              <span className="referral-icon"><UsersRound /></span>
              <div><small>PARRAINAGE ÉTUDIANT</small><h3>Offrez 5 €, recevez 5 €</h3><p>Votre ami bénéficie d'une réduction sur sa première séance.</p></div>
              <button onClick={() => toast.success("Code YASSINE5 copié")}>YASSINE5 <span>Copier</span></button>
            </div>
          </section>
        </main>
      )}

      {view === "tutor" && (
        <main className="workspace-page">
          <div className="page-heading">
            <div>
              <span className="page-kicker">ESPACE TUTEUR</span>
              <h1>Pilotez votre activité de tutorat.</h1>
              <p>Demandes, disponibilité, revenus et qualité de service en un seul endroit.</p>
            </div>
            <label className="availability-control">
              <span><i className={available ? "online" : ""} /> {available ? "Disponible cette semaine" : "Indisponible"}</span>
              <input type="checkbox" checked={available} onChange={(event) => { setAvailable(event.target.checked); toast.success(event.target.checked ? "Profil visible dans la recherche" : "Profil masqué temporairement"); }} />
              <b />
            </label>
          </div>

          <section className="onboarding-banner">
            <div className="onboarding-score"><strong>92</strong><span>/100</span></div>
            <div><small>SCORE DE PROFIL</small><h3>Votre profil inspire confiance</h3><p>Ajoutez une courte vidéo de présentation pour atteindre 100%.</p></div>
            <Progress value={92} />
            <Button variant="outline" onClick={() => toast.info("Ajout de vidéo simulé")}><Play /> Ajouter une vidéo</Button>
          </section>

          <div className="metric-grid">
            <Metric icon={Banknote} label="Revenus nets" value="204,00 €" detail="16 heures réalisées" trend="+18%" />
            <Metric icon={Star} label="Note moyenne" value="4,9/5" detail="42 avis vérifiés" />
            <Metric icon={Zap} label="Taux de réponse" value="96%" detail="Réponse médiane : 8 min" trend="+4%" />
            <Metric icon={CalendarDays} label="Séances du mois" value="16" detail="3 encore planifiées" />
          </div>

          <section className="tutor-workspace">
            <div className="panel request-panel">
              <div className="panel-heading">
                <div><Bell /><span><strong>Nouvelles demandes</strong><small>{tutorRequests.filter((r) => !requestStates[r.id]).length} demande(s) à traiter</small></span></div>
                <StatusPill tone="danger">Réponse sous 30 min</StatusPill>
              </div>
              {tutorRequests.map((request) => (
                <article className="request-card" key={request.id}>
                  <div className="avatar">{request.initials}</div>
                  <div className="request-card__copy">
                    <div><strong>{request.student}</strong><span>{request.id}</span></div>
                    <h3>{request.subject}</h3>
                    <p>{request.exam}</p>
                    <blockquote>{request.note}</blockquote>
                  </div>
                  <div className="request-card__slot"><CalendarClock /><strong>{request.slot}</strong><span>Visio · 1 heure</span></div>
                  <div className="request-card__actions">
                    {requestStates[request.id] ? (
                      <StatusPill tone={requestStates[request.id] === "accepted" ? "success" : "neutral"}>
                        {requestStates[request.id] === "accepted" ? <><Check /> Acceptée</> : <><X /> Refusée</>}
                      </StatusPill>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => actOnRequest(request.id, "declined")}>Refuser</Button>
                        <Button size="sm" className="navy-button" onClick={() => actOnRequest(request.id, "accepted")}>Accepter</Button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <aside className="tutor-side">
              <section className="panel payout-panel">
                <div className="panel-heading"><div><WalletCards /><span><strong>Prochain versement</strong><small>20 septembre 2026</small></span></div></div>
                <strong className="large-money">76,50 €</strong>
                <div className="payout-breakdown"><span>6 heures facturées <strong>90,00 €</strong></span><span>Commission Studylink (15%) <strong>-13,50 €</strong></span></div>
                <StatusPill tone="success"><CheckCircle2 /> Identité bancaire vérifiée</StatusPill>
                <Button variant="outline" onClick={() => toast.info("Relevé de versement téléchargé")}><ReceiptText /> Télécharger le relevé</Button>
              </section>

              <section className="panel pro-panel">
                <div><Sparkles /><StatusPill tone="warning">PRO</StatusPill></div>
                <h3>Gagnez en visibilité</h3>
                <p>Badge Pro, priorité dans les résultats et statistiques détaillées.</p>
                <strong>7 € <small>/ mois</small></strong>
                <Button onClick={() => toast.success("Essai Profil Pro activé pour la démo")}>Activer Profil Pro</Button>
              </section>
            </aside>
          </section>

          <section className="panel availability-panel">
            <div className="panel-heading"><div><CalendarClock /><span><strong>Planning de disponibilité</strong><small>Semaine du 14 au 20 septembre</small></span></div><Button variant="outline" onClick={() => toast.success("Nouveau créneau ajouté")}><Plus /> Ajouter un créneau</Button></div>
            <div className="week-grid">
              {["Lun. 14", "Mar. 15", "Mer. 16", "Jeu. 17", "Ven. 18"].map((day, index) => (
                <div key={day}><strong>{day}</strong><span className={index === 2 ? "session-slot" : "free-slot"}>{["18:00 – 20:00", "17:30 – 19:30", "12:15 · Yassine", "11:00 – 13:00", "17:00 – 19:00"][index]}</span><small>{index === 2 ? "Séance confirmée" : "Disponible"}</small></div>
              ))}
            </div>
          </section>
        </main>
      )}

      {view === "campus" && (
        <main className="workspace-page">
          <div className="page-heading">
            <div>
              <span className="page-kicker">PORTAIL PARTENAIRE · ESTIAM PARIS</span>
              <h1>Impact du programme de tutorat solidaire.</h1>
              <p>Suivi agrégé du budget, de l'utilisation et de la qualité de service.</p>
            </div>
            <div className="page-actions">
              <Button variant="outline" onClick={() => toast.success("Rapport mensuel exporté")}><Download /> Exporter le rapport</Button>
              <Button className="navy-button" onClick={() => toast.success("Comité de pilotage planifié", { description: "Invitation envoyée pour le 30 septembre à 10:00." })}><CalendarDays /> Planifier un comité</Button>
            </div>
          </div>

          <div className="metric-grid">
            <Metric icon={CircleDollarSign} label="Budget engagé" value="2 480 €" detail={`Sur ${campusBudget.toLocaleString("fr-FR")} € disponibles`} trend="+14%" />
            <Metric icon={UsersRound} label="Étudiants accompagnés" value="38" detail="12 matières couvertes" trend="+8" />
            <Metric icon={BookOpen} label="Séances réalisées" value="212" detail="Taux de présence : 94%" trend="+24%" />
            <Metric icon={Star} label="Satisfaction" value="4,7/5" detail="NPS : +62" />
          </div>

          <section className="campus-dashboard-grid">
            <div className="panel budget-overview">
              <div className="panel-heading">
                <div><BarChart3 /><span><strong>Consommation du programme</strong><small>Pack B2B · septembre à décembre 2026</small></span></div>
                <StatusPill tone="success">Dans le budget</StatusPill>
              </div>
              <div className="budget-number"><strong>62%</strong><span>du budget engagé</span></div>
              <Progress value={(2480 / campusBudget) * 100} />
              <div className="budget-details">
                <div><span>Budget total</span><strong>{campusBudget.toLocaleString("fr-FR")} €</strong></div>
                <div><span>Consommé</span><strong>2 480 €</strong></div>
                <div><span>Disponible</span><strong>{(campusBudget - 2480).toLocaleString("fr-FR")} €</strong></div>
                <div><span>Projection fin période</span><strong>3 720 €</strong></div>
              </div>
              <Button variant="outline" onClick={() => { setCampusBudget((value) => value + 500); toast.success("Budget augmenté de 500 €"); }}><Plus /> Ajouter 500 € au programme</Button>
            </div>

            <div className="panel subject-usage">
              <div className="panel-heading"><div><BookOpen /><span><strong>Utilisation par matière</strong><small>212 séances réalisées</small></span></div></div>
              {campusSubjectUsage.map((item) => (
                <div className="usage-row" key={item.label}>
                  <div><strong>{item.label}</strong><span>{item.sessions} séances</span></div>
                  <div><span style={{ width: `${item.value}%` }} /></div>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>

            <div className="panel privacy-panel">
              <div className="panel-heading"><div><LockKeyhole /><span><strong>Confidentialité et RGPD</strong><small>Données strictement agrégées</small></span></div><StatusPill tone="success">Conforme</StatusPill></div>
              <ul>
                <li><Check /> Aucun accès aux notes individuelles</li>
                <li><Check /> Contenu des séances non transmis</li>
                <li><Check /> Consentements utilisateurs tracés</li>
                <li><Check /> Conservation limitée des données</li>
              </ul>
              <button onClick={() => toast.info("Registre RGPD ouvert")}>Consulter le registre de traitement <ChevronRight /></button>
            </div>
          </section>

          <section className="panel cohort-table-panel">
            <div className="panel-heading"><div><UsersRound /><span><strong>Suivi des cohortes</strong><small>Indicateurs anonymisés par formation</small></span></div><button onClick={() => toast.info("Filtres de cohorte ouverts")}><Settings2 /> Filtres</button></div>
            <div className="data-table cohort-table">
              <div className="table-head"><span>Formation</span><span>Étudiants</span><span>Séances</span><span>Présence</span><span>Satisfaction</span><span>Budget</span></div>
              {[
                ["M1 Web & Mobile", "14", "78", "96%", "4,8/5", "912 €"],
                ["M1 Data & IA", "11", "63", "92%", "4,6/5", "756 €"],
                ["M2 Génie logiciel", "8", "44", "95%", "4,9/5", "528 €"],
                ["Bachelor 3", "5", "27", "91%", "4,5/5", "324 €"],
              ].map((row) => <div className="table-row" key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
            </div>
          </section>
        </main>
      )}

      {view === "operations" && (
        <main className="workspace-page operations-page">
          <div className="page-heading">
            <div>
              <span className="page-kicker">STUDYLINK OPERATIONS CENTER</span>
              <h1>Piloter la marketplace en temps réel.</h1>
              <p>Qualité, paiements, support, croissance et partenaires campus.</p>
            </div>
            <div className="ops-health"><span className="live-dot" /><div><strong>Tous les services opérationnels</strong><small>Dernière synchronisation : il y a 32 s</small></div></div>
          </div>

          <div className="metric-grid">
            <Metric icon={CircleDollarSign} label="MRR plateforme" value="1 900 €" detail="Objectif 12 mois : 7 700 €" trend="+22%" />
            <Metric icon={Activity} label="Séances / mois" value="540" detail="96 aujourd'hui" trend="+18%" />
            <Metric icon={UserCheck} label="Matching réussi" value="91,4%" detail="Objectif annuel : 90%" trend="+1,4%" />
            <Metric icon={Star} label="NPS étudiants" value="+62" detail="168 réponses ce mois" trend="+7 pts" />
          </div>

          <section className="ops-grid">
            <div className="panel revenue-panel">
              <div className="panel-heading">
                <div><BarChart3 /><span><strong>Revenu mensuel</strong><small>Commission, frais de service et Profil Pro</small></span></div>
                <StatusPill tone="success">Trajectoire conforme</StatusPill>
              </div>
              <div className="revenue-summary"><strong>1 900 €</strong><span>+22% vs août</span></div>
              <div className="revenue-chart" aria-label="Revenu des six derniers mois">
                {revenueMonths.map((item) => (
                  <div key={item.month}>
                    <span style={{ height: `${Math.max(24, (item.value / 1900) * 100)}%` }}><em>{item.value} €</em></span>
                    <small>{item.month}</small>
                  </div>
                ))}
              </div>
              <div className="revenue-legend"><span><i className="legend-a" /> Commission 64%</span><span><i className="legend-b" /> Frais 28%</span><span><i className="legend-c" /> Profil Pro 8%</span></div>
            </div>

            <div className="panel sla-panel">
              <div className="panel-heading"><div><Activity /><span><strong>SLA opérationnels</strong><small>Sur les dernières 24 heures</small></span></div></div>
              {[
                ["Disponibilité plateforme", "99,98%", "success"],
                ["Réponse support médiane", "11 min", "success"],
                ["Délai onboarding tuteur", "18 h", "success"],
                ["Paiements rapprochés", "99,4%", "warning"],
              ].map(([label, value, tone]) => (
                <div className="sla-row" key={label}><span>{label}</span><strong>{value}</strong><StatusPill tone={tone as "success" | "warning"}>{tone === "success" ? "Conforme" : "À surveiller"}</StatusPill></div>
              ))}
            </div>

            <div className="panel verification-panel">
              <div className="panel-heading">
                <div><UserCheck /><span><strong>Vérification des tuteurs</strong><small>Pièces et statut étudiant</small></span></div>
                <StatusPill tone="warning">{2 - reviewedTutors.length} à traiter</StatusPill>
              </div>
              {[
                ["TV-2048", "Maya Roux", "MR", "ESTIAM Paris", "React & TypeScript", "Carte étudiante reçue"],
                ["TV-2051", "Adam El Idrissi", "AE", "Paris Cité", "Python & IA", "Diplôme à contrôler"],
              ].map(([id, name, initials, school, topic, state]) => (
                <article className="verification-row" key={id}>
                  <div className="avatar">{initials}</div>
                  <div><strong>{name}</strong><span>{school} · {topic}</span><small>{id} · {state}</small></div>
                  {reviewedTutors.includes(id) ? <StatusPill tone="success"><Check /> Validé</StatusPill> : <Button size="sm" onClick={() => { setReviewedTutors((current) => [...current, id]); toast.success(`${name} validé`); }}>Examiner</Button>}
                </article>
              ))}
              <button className="panel-link" onClick={() => toast.info("File complète ouverte")}>Voir la file de vérification <ChevronRight /></button>
            </div>

            <div className="panel support-panel">
              <div className="panel-heading">
                <div><Headphones /><span><strong>Support et incidents</strong><small>Priorité aux séances en cours</small></span></div>
                <StatusPill tone="danger">{supportTickets.length - resolvedTickets.length} ouverts</StatusPill>
              </div>
              {supportTickets.map((ticket) => (
                <article className="ticket-row" key={ticket.id}>
                  <span className={`priority-dot ${ticket.priority === "Haute" ? "priority-dot--high" : ""}`} />
                  <div><strong>{ticket.category}</strong><span>{ticket.user} · {ticket.id}</span></div>
                  <small>{ticket.age}</small>
                  {resolvedTickets.includes(ticket.id) ? <StatusPill tone="success">Résolu</StatusPill> : <Button variant="outline" size="sm" onClick={() => { setResolvedTickets((current) => [...current, ticket.id]); toast.success(`${ticket.id} clôturé`); }}>Prendre en charge</Button>}
                </article>
              ))}
            </div>

            <div className="panel payments-panel">
              <div className="panel-heading"><div><ReceiptText /><span><strong>Rapprochement paiements</strong><small>Flux Stripe simulé</small></span></div><StatusPill tone="warning">3 anomalies</StatusPill></div>
              <div className="payment-total"><span>Volume traité aujourd'hui</span><strong>1 536,00 €</strong><small>96 transactions · 93 rapprochées</small></div>
              <Progress value={96.9} />
              <div className="payment-actions"><Button variant="outline" onClick={() => toast.success("Rapport Stripe exporté")}><Download /> Exporter</Button><Button onClick={() => toast.success("3 anomalies placées en revue manuelle")}>Réconcilier</Button></div>
            </div>

            <div className="panel campus-pipeline">
              <div className="panel-heading"><div><Building2 /><span><strong>Pipeline campus</strong><small>Déploiement campus par campus</small></span></div><Button size="sm" onClick={() => toast.success("Nouvelle opportunité campus créée")}><Plus /> Ajouter</Button></div>
              {[
                ["ESTIAM Paris", "Pilote actif", "success", "4 000 €"],
                ["Paris Cité", "Négociation", "warning", "6 000 €"],
                ["Sorbonne Université", "Qualification", "info", "—"],
              ].map(([name, status, tone, amount]) => (
                <div className="pipeline-row" key={name}><Building2 /><div><strong>{name}</strong><span>Pack tutorat B2B</span></div><StatusPill tone={tone as "success" | "warning" | "info"}>{status}</StatusPill><strong>{amount}</strong></div>
              ))}
            </div>
          </section>
        </main>
      )}

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="profile-dialog">
          {selectedTutor && (
            <>
              <DialogHeader>
                <div className="profile-hero">
                  <div className="avatar avatar--xl">{selectedTutor.initials}</div>
                  <div>
                    <div className="name-row"><DialogTitle>{selectedTutor.name}</DialogTitle><BadgeCheck /></div>
                    <DialogDescription>{selectedTutor.level} · {selectedTutor.campus}</DialogDescription>
                    <div className="profile-rating"><Star /> {selectedTutor.rating} sur 5 · {selectedTutor.reviews} avis vérifiés</div>
                  </div>
                </div>
              </DialogHeader>
              <div className="profile-stats">
                <div><strong>{selectedTutor.completedSessions}</strong><span>séances</span></div>
                <div><strong>{selectedTutor.responseTime}</strong><span>réponse moyenne</span></div>
                <div><strong>{selectedTutor.matchScore}%</strong><span>compatibilité</span></div>
              </div>
              <section className="profile-section"><h3>À propos</h3><p>{selectedTutor.bio}</p></section>
              <section className="profile-section"><h3>Expertise</h3><div className="tag-row">{selectedTutor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section>
              <section className="profile-section"><h3>Ce que vous allez travailler</h3><ul><li><Check /> Diagnostic rapide de votre niveau</li><li><Check /> Exercices proches du format de l'examen</li><li><Check /> Fiche de synthèse après la séance</li></ul></section>
              <div className="verified-box"><ShieldCheck /><div><strong>Profil vérifié par Studylink</strong><span>Identité, statut étudiant et compétences contrôlés.</span></div></div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setProfileOpen(false)}>Fermer</Button>
                <Button className="gold-button" onClick={() => { setProfileOpen(false); openBooking(selectedTutor); }}>Voir les créneaux <ArrowRight /></Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="booking-dialog">
          {selectedTutor && (
            <>
              {bookingStep < 3 && (
                <div className="booking-steps">
                  <span className="active">1 <small>Créneau</small></span>
                  <i />
                  <span className={bookingStep >= 2 ? "active" : ""}>2 <small>Paiement</small></span>
                  <i />
                  <span>3 <small>Confirmation</small></span>
                </div>
              )}

              {bookingStep === 1 && (
                <>
                  <DialogHeader>
                    <DialogTitle>Réserver avec {selectedTutor.name}</DialogTitle>
                    <DialogDescription>{selectedTutor.subject} · {selectedTutor.campus}</DialogDescription>
                  </DialogHeader>
                  <div className="dialog-tutor">
                    <div className="avatar avatar--large">{selectedTutor.initials}</div>
                    <div><strong>{selectedTutor.name}</strong><span><Star /> {selectedTutor.rating} · {selectedTutor.completedSessions} séances</span><small><Clock3 /> Répond généralement en {selectedTutor.responseTime}</small></div>
                    <strong>{selectedTutor.price} €<small>/h</small></strong>
                  </div>
                  <fieldset className="slot-list">
                    <legend>Choisissez un créneau disponible</legend>
                    {selectedTutor.slots.map((slot) => (
                      <button key={slot} className={selectedSlot === slot ? "selected" : ""} onClick={() => setSelectedSlot(slot)}>
                        <CalendarDays /><span>{slot.split(" · ")[0]}<small>{slot.split(" · ")[1]} · Visio</small></span>{selectedSlot === slot && <Check />}
                      </button>
                    ))}
                  </fieldset>
                  <div className="booking-protection"><ShieldCheck /><span><strong>Annulation flexible</strong><small>Remboursement intégral jusqu'à 12 h avant la séance.</small></span></div>
                  <DialogFooter><Button variant="outline" onClick={() => setBookingOpen(false)}>Annuler</Button><Button className="gold-button" onClick={() => setBookingStep(2)}>Continuer <ArrowRight /></Button></DialogFooter>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <DialogHeader><DialogTitle>Vérifiez et confirmez</DialogTitle><DialogDescription>Paiement sécurisé simulé pour la soutenance.</DialogDescription></DialogHeader>
                  <div className="checkout-grid">
                    <div>
                      <div className="payment-method"><div><WalletCards /><span><strong>Visa se terminant par 4242</strong><small>Carte de démonstration</small></span></div><StatusPill tone="success">Sélectionnée</StatusPill></div>
                      <label className="promo-field"><span>Code partenaire</span><div><input value={promoApplied ? "ESTIAM10" : ""} readOnly placeholder="Ex. ESTIAM10" /><Button variant="outline" onClick={() => { setPromoApplied(true); toast.success("Code ESTIAM10 appliqué"); }}>{promoApplied ? "Appliqué" : "Appliquer"}</Button></div></label>
                      <div className="terms-line"><LockKeyhole /><span>Transaction chiffrée. En continuant, vous acceptez les CGV et la politique d'annulation.</span></div>
                    </div>
                    <aside className="order-summary">
                      <h3>Récapitulatif</h3>
                      <div><span>Tuteur</span><strong>{selectedTutor.name}</strong></div>
                      <div><span>Créneau</span><strong>{selectedSlot}</strong></div>
                      <div><span>Séance d'une heure</span><strong>15,00 €</strong></div>
                      <div><span>Frais de service</span><strong>1,00 €</strong></div>
                      {promoApplied && <div className="discount"><span>Code ESTIAM10</span><strong>-1,50 €</strong></div>}
                      <div className="order-total"><span>Total</span><strong>{promoApplied ? "14,50 €" : "16,00 €"}</strong></div>
                    </aside>
                  </div>
                  <DialogFooter><Button variant="outline" onClick={() => setBookingStep(1)}>Retour</Button><Button className="gold-button" onClick={confirmBooking}><LockKeyhole /> Simuler le paiement</Button></DialogFooter>
                </>
              )}

              {bookingStep === 3 && (
                <div className="success-state">
                  <span className="success-icon"><Check /></span>
                  <StatusPill tone="success">PAIEMENT AUTORISÉ</StatusPill>
                  <DialogTitle>Votre séance est confirmée</DialogTitle>
                  <DialogDescription>{selectedTutor.name} vous attend le {selectedSlot.toLowerCase()}.</DialogDescription>
                  <div className="confirmation-card">
                    <div><span>Référence</span><strong>ST-DEMO-2026</strong></div>
                    <div><span>Format</span><strong>Visio Studylink</strong></div>
                    <div><span>Montant</span><strong>{promoApplied ? "14,50 €" : "16,00 €"}</strong></div>
                  </div>
                  <p><CheckCircle2 /> Invitation calendrier et confirmation envoyées.</p>
                  <Button className="navy-button" onClick={() => { setBookingOpen(false); setView("student"); }}>Voir ma séance <ArrowRight /></Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <footer>
        <div><span className="brand-mark brand-mark--small"><BookOpen /></span><span><strong>Study</strong>link</span></div>
        <p>Plateforme de démonstration · Données fictives · Aucun paiement réel</p>
        <div><button onClick={() => toast.info("Centre de confiance")}>Sécurité</button><button onClick={() => toast.info("Politique RGPD")}>Confidentialité</button><button onClick={() => toast.info("Support")}>Support</button></div>
      </footer>
    </div>
  );
}
