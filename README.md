# Studylink Demo

Prototype front-end réalisé pour la soutenance **Studylink** : une plateforme qui met en relation des étudiants avec des tuteurs de leur campus.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/afif-yassine/studylink-demo)

## Fonctionnalités

- marketplace avec matching par campus, matière et disponibilité ;
- profils vérifiés, favoris, avis et score de compatibilité ;
- réservation en trois étapes, code BDE et paiement simulé ;
- espace étudiant avec agenda, progression, ressources et crédit solidaire ;
- espace tuteur avec demandes, planning, revenus et Profil Pro ;
- portail campus avec budget B2B, cohortes et indicateurs RGPD ;
- console opérations avec MRR, SLA, support, paiements et vérifications ;
- actions interactives et notifications sur tous les parcours ;
- interface responsive pour ordinateur et mobile.

> Cette version utilise des données fictives. Aucun paiement réel n’est effectué.

## Technologies

- Next.js 16 ;
- React 19 et TypeScript ;
- Tailwind CSS 4 ;
- composants Radix UI / shadcn ;
- déploiement Vercel.

## Lancer le projet

```bash
pnpm install
pnpm dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Vérification

```bash
pnpm lint
pnpm build
```

## Déploiement

Le dépôt est compatible avec l’import automatique dans Vercel. Le framework détecté doit être **Next.js** et aucune variable d’environnement n’est nécessaire pour cette démonstration.
