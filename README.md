# Propositions commerciales · Solution Logique

Générateur de propositions commerciales : formulaire → aperçu A4 en direct → 1 modèle parmi 4 → export PDF.
100 % local (aucun backend, aucune base, aucun appel réseau) : données dans le `localStorage`, export/import JSON.

## Installation et lancement

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # calculs de prix + conformité des couleurs
npm run build    # build de production
```

**Logo** : déposer le fichier dans `public/assets/logo.png` (extrait du .docx : `word/media/image2.png`), ou l'importer dans *Paramètres*. Sans logo, un mot-symbole « SOLUTION LOGIQUE » est affiché.

## Utilisation

1. *Propositions* : créer, rechercher, dupliquer, supprimer, changer le statut, exporter/importer en JSON.
2. *Éditeur* : sections repliables à gauche, aperçu à droite, 4 vignettes de modèle. Changer de modèle ne perd aucune donnée. Sauvegarde automatique.
3. *Télécharger en PDF* : ouvre la boîte d'impression du navigateur → « Enregistrer au format PDF », **marges : aucune**, **graphiques d'arrière-plan : activés**. Le titre du document devient le nom du fichier.
4. *Paramètres* : logo, coordonnées, phrase CGV, TVA, valeurs par défaut des conditions.

## Outils de vente

- **Suivi** (page Propositions) : statuts Brouillon / Envoyée / Signée / Refusée, tuiles « en attente », « signées », « à relancer (J+7) » et taux de signature. La date d'envoi est posée au passage en « Envoyée ».
- **Mail d'envoi** : bouton dans l'éditeur, copie un mail prêt à coller (montants réels, économie, date de validité).
- **Interlocuteur** : nom et téléphone direct du commercial sur la couverture (Paramètres, modifiable par proposition).
- **Et ensuite ? Trois étapes** : déduites des conditions saisies (+ délai de mise en œuvre facultatif).
- **Pourquoi nous choisir** : atouts saisis dans Paramètres, affichés seulement s'ils existent. Rien n'est pré-rempli.
- **Urgence** : la ligne « Économie réalisée » rappelle la date de fin de validité de l'offre.
- Ces blocs de couverture s'effacent automatiquement si la page est déjà pleine (texte de contexte long, plus de 3 points clés).

## Signature électronique

Section « 7 · Signature électronique » de l'éditeur : le client (bon pour accord) et Solution Logique signent en dessinant (souris, doigt, stylet) ou en saisissant leur nom, après avoir coché la déclaration de consentement.
La signature, la date et l'heure, le lieu et une **empreinte SHA-256 du contenu** sont imprimés sur la page de validation et dans le PDF. Signer le client passe la proposition au statut « Signée ».
Si le contenu est modifié après signature, un avertissement s'affiche : il faut retirer la signature et la refaire.

Limites : il s'agit d'une signature électronique **simple** (pas avancée ni qualifiée au sens eIDAS) et d'une signature **en présentiel**. Tout reste dans le navigateur ; l'empreinte prouve ce qui a été signé mais pas l'identité du signataire. Une signature à distance par lien envoyé au client demande un service tiers ou un backend (hors périmètre).

## Ajouter un 5ᵉ modèle

1. Ajouter l'identifiant dans `ModeleId` (`src/lib/types.ts`).
2. Créer `src/components/preview/model-xxx.tsx` exportant `pagesXxx({ p, settings }): PageFn[]` (une fonction par page, enveloppée dans `<Sheet>`). S'inspirer de `model-express.tsx`.
3. L'enregistrer dans `MODELES` (`src/components/preview/document.tsx`) : la vignette de l'éditeur apparaît automatiquement (ajouter son icône dans `MODEL_ICON`, `editor.tsx`).

Un bandeau rouge signale dans l'aperçu toute page dont le contenu déborde.

## Choix et hypothèses (cahier des charges ambigu → option la plus simple)

- **shadcn/ui** : composants minimaux écrits à la main dans le même esprit (cva + tailwind-merge), sans CLI.
- **Champs ajoutés** au modèle : `benefices` (« Ce que vous y gagnez », jamais pré-rempli avec des chiffres inventés), `formulesIntro`, `projet.visuel`, `afficherTTC`, `statut`, `icone`.
- **Économie réalisée** : somme de `(ancien − prix) × quantité` sur les lignes hors options ; les lignes récurrentes sont ramenées au mois puis multipliées par la durée d'engagement (3 × trimestres).
- **Acompte / solde** : calculés sur le total « mise en œuvre » (lignes uniques).
- **Prix des formules (modèle 4)** : somme des lignes cochées ; options exclues. Le détail de la page 3 porte sur la formule recommandée (sinon la première).
- **Pagination** : si le contenu dépasse (plus de 8 lignes de prix, plus de 6 fonctionnalités…), des pages de suite sont ajoutées automatiquement. Le modèle Express est limité à 6 lignes (les suivantes sont comptées dans les totaux).
- **Démo** : quantités fixées à 1 ; l'option « prise de rendez-vous » est à 0 € (« Sur demande ») faute de tarif fourni ; adresse et contact du client volontairement génériques.
- **Couleurs** : seules celles du §3 + vert/rouge discrets ; un test (`colors.test.ts`) le vérifie.
- **Police** : Inter (fichier local via `next/font/local`, aucun appel à Google Fonts).
