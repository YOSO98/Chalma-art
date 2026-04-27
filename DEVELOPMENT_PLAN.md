# Plan de développement — CHALMA ART

## 1) Stabilisation (bugfixes prioritaires)
- **Sécuriser le fond particulaire** contre les divisions par zéro lors de la répulsion souris.
- **Renforcer l’accessibilité clavier** des cartes interactives (galerie + algorithmes).
- **Standardiser les tests manuels** avant release (navigation, recherche, responsive).

## 2) Fonctionnalités produit (itérations rapides)
- **Recherche avancée de seeds** : support de seed unique (`42`) et plage (`120-180`).
- **Raccourcis clavier globaux** :
  - `/` pour focus recherche,
  - `R` pour une œuvre aléatoire,
  - `Esc` pour vider la recherche.
- **Affordance UX** : afficher un rappel discret des raccourcis dans la barre de filtres.

## 3) UX / Design
- Ajouter des **états `:focus-visible`** clairs sur les composants cliquables non natifs.
- Continuer l’harmonisation des micro-interactions hover/focus pour cohérence desktop + clavier.
- Préparer une passe mobile dédiée (lisibilité des controls de filtre).

## 4) Prochaine vague recommandée
- Ajouter un mode **favoris localStorage** avec filtre “Mes favoris”.
- Ajouter une page/section “**Seed du jour**” partageable.
- Mettre en place une **checklist QA** versionnée (`docs/qa-checklist.md`).
