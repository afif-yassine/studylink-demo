"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BarChart3, BookOpen, Building2, CalendarDays, Check, ChevronRight, CircleCheck, Clock3, GraduationCap, MapPin, MessageCircle, Search, ShieldCheck, Sparkles, Star, UsersRound, Video, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { campuses, initialBookings, subjects, tutors, type Tutor } from "@/lib/mock-data";

type View = "find" | "student" | "tutor" | "campus";
type Booking = (typeof initialBookings)[number];
type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: Record<string, unknown>; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown | Promise<unknown> }, options?: { signal?: AbortSignal }) => void | Promise<void> };
declare global { interface Document { modelContext?: ModelContext } }

const navItems: { id: View; label: string; icon: typeof Search }[] = [
  { id: "find", label: "Trouver un tuteur", icon: Search },
  { id: "student", label: "Mes séances", icon: CalendarDays },
  { id: "tutor", label: "Espace tuteur", icon: GraduationCap },
  { id: "campus", label: "Espace campus", icon: Building2 },
];

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="metric-card"><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function TutorCard({ tutor, onBook }: { tutor: Tutor; onBook: (tutor: Tutor) => void }) {
  return <article className={`tutor-card ${tutor.featured ? "tutor-card--featured" : ""}`}>
    {tutor.featured && <span className="top-match"><Sparkles /> Meilleur match</span>}
    <div className="tutor-main"><div className="avatar" aria-hidden="true">{tutor.initials}</div><div className="tutor-copy">
      <div className="name-row"><h3>{tutor.name}</h3>{tutor.verified && <BadgeCheck aria-label="Profil vérifié" />}</div><p className="level">{tutor.level}</p>
      <div className="meta-row"><span><MapPin /> {tutor.campus}</span><span className="rating"><Star /> {tutor.rating} <em>({tutor.reviews})</em></span></div>
      <p className="bio">{tutor.bio}</p><div className="tag-row">{tutor.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </div></div>
    <div className="tutor-action"><div><strong>{tutor.price} €</strong><span>/ heure</span></div><small><Clock3 /> {tutor.responseTime}</small><Button className="gold-button" onClick={() => onBook(tutor)}>Voir les créneaux <ChevronRight /></Button></div>
  </article>;
}

export default function Home() {
  const [view, setView] = useState<View>("find");
  const [campus, setCampus] = useState<string>(campuses[0]);
  const [subject, setSubject] = useState<string>(subjects[0]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [acceptedRequests, setAcceptedRequests] = useState<string[]>([]);
  const visibleTutors = useMemo(() => tutors.filter((tutor) => tutor.campus === campus && (subject === subjects[0] || tutor.subject === subject)), [campus, subject]);

  const openBooking = (tutor: Tutor) => { setSelectedTutor(tutor); setSelectedSlot(tutor.slots[0]); setConfirmed(false); setDialogOpen(true); };
  const confirmBooking = () => {
    if (!selectedTutor || !selectedSlot) return;
    const booking: Booking = { id: `ST-${Math.floor(30000 + Math.random() * 60000)}`, tutor: selectedTutor.name, subject: selectedTutor.subject, date: selectedSlot, status: "Confirmée", price: 16 };
    setBookings((current) => [booking, ...current]); setConfirmed(true); toast.success("Séance réservée", { description: `${selectedTutor.name} · ${selectedSlot}` });
  };

  useEffect(() => {
    const context = document.modelContext; if (!context?.registerTool) return; const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool({ name: "find_studylink_tutors", title: "Rechercher des tuteurs Studylink", description: "Retourne les tuteurs mockés disponibles pour un campus et une matière.", inputSchema: { type: "object", properties: { campus: { type: "string" }, subject: { type: "string" } }, required: ["campus"], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute(input) { const value = input as { campus?: string; subject?: string }; const matches = tutors.filter((tutor) => tutor.campus === value.campus && (!value.subject || tutor.subject === value.subject)); return { count: matches.length, tutors: matches.map(({ id, name, subject, rating, slots }) => ({ id, name, subject, rating, slots })) }; } }, { signal: lifecycle.signal });
      await context.registerTool({ name: "create_demo_booking", title: "Créer une réservation de démonstration", description: "Ajoute une réservation mockée et l'affiche dans l'espace étudiant.", inputSchema: { type: "object", properties: { tutorId: { type: "string" }, slot: { type: "string" } }, required: ["tutorId", "slot"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { const value = input as { tutorId?: string; slot?: string }; const tutor = tutors.find((item) => item.id === value.tutorId); if (!tutor || !value.slot || !tutor.slots.includes(value.slot)) throw new Error("Tuteur ou créneau invalide"); const id = `ST-${Math.floor(30000 + Math.random() * 60000)}`; setBookings((current) => [{ id, tutor: tutor.name, subject: tutor.subject, date: value.slot!, status: "Confirmée", price: 16 }, ...current]); setView("student"); return { id, status: "confirmed", tutor: tutor.name, slot: value.slot }; } }, { signal: lifecycle.signal });
    };
    void register().catch(() => undefined); return () => lifecycle.abort();
  }, []);

  return <div className="min-h-screen bg-background text-foreground"><Toaster position="top-right" richColors />
    <header className="site-header"><button className="brand" onClick={() => setView("find")} aria-label="Accueil Studylink"><span className="brand-mark"><BookOpen /></span><span><strong>Study</strong>link</span></button>
      <nav aria-label="Navigation principale">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><Icon /><span>{item.label}</span></button>; })}</nav>
      <div className="profile-chip"><span>YA</span><div><strong>Yassine</strong><small>Mode démo</small></div></div>
    </header>

    {view === "find" && <main><section className="search-hero"><div className="hero-copy"><span className="eyebrow"><CircleCheck /> Tuteurs vérifiés sur votre campus</span><h1>Le bon tuteur, au bon moment, <em>sur votre campus.</em></h1><p>Réservez une séance avec un étudiant qui connaît votre cursus, vos matières et vos échéances.</p></div><div className="proof-card"><div><UsersRound /><strong>24</strong><span>tuteurs actifs</span></div><div><Star /><strong>4,8/5</strong><span>note moyenne</span></div><div><Clock3 /><strong>&lt; 15 min</strong><span>temps de réponse</span></div></div></section>
      <section className="search-panel" aria-label="Recherche de tuteur"><label><span><MapPin /> Votre campus</span><Select value={campus} onValueChange={setCampus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{campuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
        <label><span><BookOpen /> Matière</span><Select value={subject} onValueChange={setSubject}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{subjects.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
        <label><span><CalendarDays /> Disponibilité</span><button className="fake-input">Dès aujourd'hui <ChevronRight /></button></label><Button className="search-button" onClick={() => toast.info(`${visibleTutors.length} tuteur${visibleTutors.length > 1 ? "s" : ""} disponible${visibleTutors.length > 1 ? "s" : ""}`)}><Search /> Rechercher</Button></section>
      <section className="results-section"><div className="section-heading"><div><span className="eyebrow">Sélection personnalisée</span><h2>Tuteurs disponibles</h2></div><p><strong>{visibleTutors.length}</strong> résultat{visibleTutors.length > 1 ? "s" : ""} · triés par pertinence</p></div><div className="content-grid"><div className="tutor-list">{visibleTutors.length ? visibleTutors.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} onBook={openBooking} />) : <div className="empty-state"><Search /><h3>Aucun tuteur pour ce filtre</h3><p>Essayez une autre matière ou un autre campus.</p><Button variant="outline" onClick={() => setSubject(subjects[0])}>Voir toutes les matières</Button></div>}</div>
        <aside className="trust-panel"><span className="trust-icon"><ShieldCheck /></span><h3>Réservez sereinement</h3><ul><li><Check /> Identité et statut étudiant vérifiés</li><li><Check /> Paiement protégé jusqu'à la séance</li><li><Check /> Support Studylink en cas de problème</li></ul><div className="price-note"><span>Prix affiché</span><strong>16 €</strong><small>15 € de cours + 1 € de service</small></div></aside></div></section></main>}

    {view === "student" && <main className="dashboard-page"><div className="dashboard-title"><div><span className="eyebrow">Espace étudiant</span><h1>Mes séances</h1><p>Retrouvez vos cours, vos supports et vos prochaines étapes.</p></div><Button className="gold-button" onClick={() => setView("find")}><Search /> Trouver un tuteur</Button></div><div className="metric-grid"><Metric label="Séances à venir" value={`${bookings.length}`} detail="Toutes confirmées" /><Metric label="Heures suivies" value="7 h" detail="Sur les 30 derniers jours" /><Metric label="Progression" value="82 %" detail="Objectifs de révision" /></div>
      <section className="dashboard-card"><div className="card-title"><div><CalendarDays /><span><strong>Prochaines séances</strong><small>Vos réservations confirmées</small></span></div></div><div className="booking-list">{bookings.map((booking, index) => <article className="booking-row" key={`${booking.id}-${index}`}><div className="date-tile"><strong>{index === 0 ? "14" : "15"}</strong><span>SEPT.</span></div><div className="booking-copy"><span className="status-dot">{booking.status}</span><h3>{booking.subject}</h3><p>{booking.tutor} · {booking.date}</p></div><div className="booking-actions"><Button variant="outline"><MessageCircle /> Message</Button><Button className="navy-button"><Video /> Rejoindre</Button></div></article>)}</div></section></main>}

    {view === "tutor" && <main className="dashboard-page"><div className="dashboard-title"><div><span className="eyebrow">Espace tuteur</span><h1>Bonjour Lina</h1><p>Votre activité de tutorat, vos demandes et vos revenus.</p></div><span className="availability"><span /> Disponible cette semaine</span></div><div className="metric-grid"><Metric label="Revenus du mois" value="204 €" detail="16 heures réalisées" /><Metric label="Note moyenne" value="4,9/5" detail="42 avis étudiants" /><Metric label="Taux de réponse" value="96 %" detail="En moins de 15 minutes" /></div><div className="dashboard-columns"><section className="dashboard-card"><div className="card-title"><div><CalendarDays /><span><strong>Demandes reçues</strong><small>2 nouvelles demandes</small></span></div></div>{["Mohamed · Java & Spring · mardi 18:30", "Emma · API REST · jeudi 12:00"].map((request) => <div className="request-row" key={request}><div><strong>{request.split(" · ")[0]}</strong><span>{request.split(" · ").slice(1).join(" · ")}</span></div>{acceptedRequests.includes(request) ? <span className="accepted"><Check /> Acceptée</span> : <Button size="sm" onClick={() => { setAcceptedRequests((current) => [...current, request]); toast.success("Demande acceptée"); }}>Accepter</Button>}</div>)}</section><section className="dashboard-card payout-card"><div className="card-title"><div><WalletCards /><span><strong>Prochain versement</strong><small>Après validation des séances</small></span></div></div><strong className="payout">76,50 €</strong><p>6 heures × 12,75 €</p><div className="payout-line"><span>Prévu le</span><strong>20 septembre</strong></div></section></div></main>}

    {view === "campus" && <main className="dashboard-page"><div className="dashboard-title"><div><span className="eyebrow">Espace partenaire</span><h1>Pilotage du programme solidaire</h1><p>Vue agrégée du budget, de l'utilisation et de la qualité de service.</p></div><span className="demo-label"><Building2 /> ESTIAM Paris</span></div><div className="metric-grid"><Metric label="Budget engagé" value="2 480 €" detail="Sur 4 000 € disponibles" /><Metric label="Étudiants accompagnés" value="38" detail="12 matières couvertes" /><Metric label="Séances réalisées" value="212" detail="Taux de présence : 94 %" /></div><div className="dashboard-columns campus-columns"><section className="dashboard-card budget-card"><div className="card-title"><div><BarChart3 /><span><strong>Consommation du budget</strong><small>Programme pilote · septembre à décembre</small></span></div><strong>62 %</strong></div><Progress value={62} /><div className="budget-legend"><span><i className="used" /> Utilisé : 2 480 €</span><span><i /> Disponible : 1 520 €</span></div><div className="month-chart" aria-label="Répartition mensuelle du budget">{[36, 58, 74, 62].map((height, index) => <div key={height}><span style={{ height: `${height}%` }} /><small>{["Sept.", "Oct.", "Nov.", "Déc."][index]}</small></div>)}</div></section><section className="dashboard-card"><div className="card-title"><div><ShieldCheck /><span><strong>Protection des données</strong><small>Indicateurs strictement agrégés</small></span></div></div><ul className="privacy-list"><li><Check /> Aucun accès aux notes individuelles</li><li><Check /> Aucun contenu de séance transmis</li><li><Check /> Export limité aux données de pilotage</li></ul><div className="quality-score"><span>Qualité moyenne</span><strong>4,7 / 5</strong><small>Sur 168 évaluations</small></div></section></div></main>}

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="booking-dialog">{selectedTutor && !confirmed && <><DialogHeader><DialogTitle>Réserver avec {selectedTutor.name}</DialogTitle><DialogDescription>{selectedTutor.subject} · {selectedTutor.campus}</DialogDescription></DialogHeader><div className="dialog-tutor"><div className="avatar">{selectedTutor.initials}</div><div><strong>{selectedTutor.name}</strong><span><Star /> {selectedTutor.rating} · Profil vérifié</span></div></div><fieldset className="slot-list"><legend>Choisissez un créneau</legend>{selectedTutor.slots.map((slot) => <button key={slot} className={selectedSlot === slot ? "selected" : ""} onClick={() => setSelectedSlot(slot)}><CalendarDays /> {slot}{selectedSlot === slot && <Check />}</button>)}</fieldset><div className="payment-summary"><div><span>Cours d'une heure</span><strong>15,00 €</strong></div><div><span>Frais de service</span><strong>1,00 €</strong></div><div className="total"><span>Total</span><strong>16,00 €</strong></div><small><ShieldCheck /> Paiement simulé — aucune carte n'est débitée</small></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button><Button className="gold-button" onClick={confirmBooking}>Simuler le paiement <ArrowRight /></Button></DialogFooter></>}{selectedTutor && confirmed && <div className="success-state"><span><Check /></span><DialogTitle>Votre séance est confirmée</DialogTitle><DialogDescription>{selectedTutor.name} vous attend le {selectedSlot.toLowerCase()}.</DialogDescription><div className="confirmation-code"><small>Référence</small><strong>ST-DEMO-2026</strong></div><Button className="navy-button" onClick={() => { setDialogOpen(false); setView("student"); }}>Voir mes séances <ArrowRight /></Button></div>}</DialogContent></Dialog>
    <footer><span><strong>Study</strong>link · Démonstration soutenance</span><span>Données fictives · Aucun paiement réel</span></footer>
  </div>;
}
