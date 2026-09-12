# Studylink Demo

Prototype front-end réalisé pour la soutenance **Studylink** : une plateforme qui met en relation des étudiants avec des tuteurs de leur campus.

## Fonctionnalités

- recherche de tuteurs par campus et par matière ;
- profils de tuteurs avec tarif, note et disponibilités ;
- réservation d’un créneau et paiement simulé ;
- tableau de bord étudiant ;
- tableau de bord tuteur avec gestion des demandes ;
- tableau de bord campus et programme solidaire ;
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
