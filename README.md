## Fullta 3D interactif (31 octobre 2026)

Le petit lapin Fullta flotte directement dans le coin du site et sert **lui-même** de bouton pour ouvrir et fermer le chat. Il cligne des yeux de façon irrégulière, se penche au survol de la souris, réagit avec de petites étoiles à l’ouverture et aux réponses, et rebondit doucement pendant le traitement d’un message.

Les animations sont légères, ne nécessitent aucune API ni collecte supplémentaire, sont adaptées aux téléphones et s’arrêtent avec la préférence système « Réduire les animations ». Le bouton est accessible au clavier et conserve `aria-expanded` ainsi que les libellés d’ouverture et de fermeture. Les commandes locales de Fullta restent disponibles comme avant.

Les tests `fullta-interactive.test.js` et `visual-qa.mjs` couvrent le clignement, l’ouverture du chat, la fermeture au clavier et le mouvement réduit.

## Nouveaux quiz de découverte (31 octobre 2026)

- **`/quiz-personnalites.html?test=ecrans`** : quiz visible à l’accueil sur les vidéos YouTube, Shorts, TikTok et films **déclarés librement par la personne**. Aucune connexion aux plateformes, aucun historique importé ou analysé.
- **`?test=moi`** : réactions et préférences au quotidien.
- **`?test=passions`** : passions et activités qui attirent.
- **`?test=apprendre`** : façons d’aborder des défis et d’explorer un sujet, sans prétention de « style d’apprentissage » fixe.
- Les quatre questionnaires sont gratuits et accessibles sans compte. Ils donnent des pistes à explorer parmi des fiches métier gratuites, jamais de diagnostic ni d’orientation obligatoire.
- Le calcul et les réponses détaillées restent dans le navigateur en mémoire de page. Aucun stockage des choix détaillés ; l’utilisateur connecté peut décider d’enregistrer uniquement un résumé général grâce au bouton dédié.
- Fichiers : `quiz-personnalites-data.js`, `quiz-personnalites.js`, `quiz-personnalites.html`, `quiz-personnalites.css`, `quiz-home.css` et `quiz-personnalites.test.js`.
- Le quiz initial de l’explorateur reste accessible et inchangé.

## Sécurité, comptes et fonctionnalités après audit (octobre 2026)

L’espace `/mon-espace.html` permet aux adultes connectés de conserver et gérer un profil minimal, les favoris, l’historique des quiz et plusieurs personnages. Il inclut l’export, l’effacement du parcours et une demande authentifiée de suppression définitive du compte.

L’espace `/parents.html` explique la protection des jeunes utilisateurs et les limites de la déclaration de majorité à l’inscription. L’accès au contenu gratuit reste possible sans compte.

Le panneau `/admin.html` est protégé par les rôles Supabase RLS. Aucun compte administrateur n’est désigné automatiquement. Il gère les annonces, les signalements et les dossiers Premium.

Fullta conserve ses commandes locales. Les appels à un modèle externe nécessitent un compte, un consentement spécifique, une configuration de clé serveur, un quota et une modération. Sans configuration, la discussion libre n’est pas disponible.

Le site dispose d’une surveillance automatique et de tests visuels desktop/mobile dans GitHub Actions. Voir `AUDIT_ACTIONS.md` pour le périmètre exact, les limites et les prérequis avant commercialisation.

# moidemain

Site d’orientation en français avec parcours invité, comptes facultatifs via Supabase, catalogue gratuit et espace Premium préparé.

## Démarrer

Avec Node.js 24 :

```sh
npm run dev
```

Le serveur écoute sur le port 3000 (personnalisable avec `PORT`).

## Fonctionnalités

- Quiz de découverte en 8 questions, suggestions expliquées selon quatre familles de préférences.
- Catalogue de 36 métiers : 20 fiches gratuites et 16 aperçus Premium, avec recherche et filtres.
- Fiches et mini-quiz gratuits, et 16 fiches Premium stockées côté Supabase avec vérification du droit d’accès par RLS.
- Favoris conservés dans le stockage local du navigateur.
- Interface adaptée aux téléphones, navigation clavier et fenêtres modales natives.

Les quiz sont indicatifs, sans validation psychométrique. Les formations citées sont des exemples à vérifier localement. Aucune réponse au quiz n’est envoyée à un serveur. Les polices Google sont facultatives : des polices système prennent le relais sans accès réseau.

## Vérifier

```sh
node --check app.js
node --check server.mjs
```

Le parcours invité reste disponible sans connexion. Les comptes et l’accès Premium nécessitent Supabase ; les achats ne sont pas encore activés.

## Pages institutionnelles et documents juridiques

Pages ajoutées (octobre 2026) :
- `a-propos.html` : vision, mission et fonctionnement réel de la plateforme.
- `contact.html` : informations de support et canal de contact à compléter par l’éditeur.
- `cgu.html` : conditions générales d’utilisation adaptées aux quiz, Fullta, comptes et jeunes.
- `cgv.html` : conditions générales de vente **préparatoires**, sans encaissement actif.
- `mentions-legales.html` : éditeur, direction de publication, hébergement, immatriculation à confirmer.
- `confidentialite.html` : données traitées, fournisseurs, droits des utilisateurs et mineurs.
- `cookies.html` : cookies, localStorage, sessionStorage et contrôle par le navigateur.

Les liens figurent désormais dans le pied de page de l'accueil, de l’explorateur et des pages comptes, personnages, conseils et Premium. Les nouvelles pages ont un style dédié (`legal.css`), responsive, avec sommaire accessible.

**IMPORTANT :** les documents sont des brouillons précommerciaux conformes au fonctionnement connu de l’application, non des documents juridiques définitifs. L'identité de l'éditeur, ses contacts, ses données d'immatriculation, les durées de conservation, la politique de remboursement et l'audit des traceurs restent à renseigner et vérifier. Ne pas activer les ventes tant que ces exigences ne sont pas satisfaites. Voir `LEGAL_A_COMPLETER.md` pour la checklist.

## Nouveaux espaces (octobre 2026)

- `/personnages.html` : atelier gratuit de quatre animaux personnalisables (lapin, renard, chat, hibou), avec palette, tenue, accessoire, prénom et sauvegarde locale.
- `/conseils.html` : conseils d’orientation pour 8–11, 12–15 et 16–18 ans avec feuille de route locale.
- `/premium.html` : présentation des 16 métiers Premium et état de la configuration des achats. **Aucun paiement n’est actuellement possible**.
- `/explorer.html` : catalogue de 20 métiers gratuits et 16 aperçus Premium verrouillés.
- `/auth.html` : connexion et inscription Supabase. Les sessions sont conservées dans `sessionStorage`.

Les 16 contenus Premium détaillés sont uniquement dans la base Supabase ; l’API les renvoie à un utilisateur authentifié uniquement si la table `premium_access` indique un droit actif. Les politiques RLS sont activées. Il n’existe pas de raccourci via `localStorage` permettant de déverrouiller les fiches.

### Paiement PayDunya préparé (non activé)

Une passerelle PayDunya par redirection a été intégrée et déployée via Supabase Edge Functions (`premium-checkout` et `premium-payments-webhook`). L’activation des droits dépend d’une confirmation serveur du fournisseur et du RLS Supabase.

**Proposition, pas encore validée** : 2 500 FCFA en paiement unique pour les 16 fiches Premium, sans abonnement. Les moyens de paiement envisageables au Sénégal sont Wave, Orange Money, Free Money et la carte bancaire selon les canaux activés par le commerçant. Les achats sont bloqués sans compte marchand ni tarif confirmé.

Voir `PAIEMENT_PREPARATION.md` pour les étapes PayDunya Business, le mode sandbox, les secrets Supabase, les tests de retour et les conditions avant ouverture réelle des paiements.

Les données d’orientation et d’identification des mineurs nécessitent une politique de confidentialité, un contrôle des accès et une validation juridique avant ouverture commerciale.

## Fullta, chat flottant (toutes les pages)

Un bouton « Parler à Fullta » apparaît sur l’accueil, l’explorateur et la connexion. Depuis n’importe quelle page, Fullta sait lancer le quiz, ouvrir une fiche, filtrer les métiers et gérer les favoris. Les actions déclenchées hors de l’explorateur sont transportées par sessionStorage sous forme d’objets strictement validés. Aucune exécution arbitraire ni insertion HTML dans le chat.

Les commandes reconnues localement fonctionnent **sans aucune API**. Pour les questions libres, `floating-chat.js` appelle la fonction Supabase `fullta-chat`, installée dans le projet *Moi demain*. Cette fonction retourne 503 tant qu’aucune clé de modèle n’est configurée ; le chat repasse alors en mode commandes locales. Elle n’envoie jamais les commandes locales au modèle.

### Activer la véritable IA

1. Dans le tableau de bord Supabase du projet *Moi demain*, ouvrir **Edge Functions → Secrets** et définir `OPENAI_API_KEY` avec votre clé API privée. Ne jamais placer cette clé dans GitHub, le HTML ou JavaScript côté navigateur.
2. Facultatif : définir `OPENAI_MODEL` (par défaut `gpt-4o-mini`).
3. Si le site utilise un domaine distinct de `https://sigroupeimmo4-ux.github.io`, définir `FULLTA_ALLOWED_ORIGINS` avec les origines autorisées séparées par des virgules, puis redéployer si besoin.

La fonction propose des réponses et des actions structurées. Le navigateur revérifie **chaque action** contre une liste explicite et un catalogue connu avant toute exécution. Les messages libres, lorsqu’une clé est activée, transitent vers le modèle IA ; le chat invite à ne pas partager de données sensibles. Les réponses aux quiz ne sont pas envoyées.

**Important avant un déploiement public à grande échelle :** la limite de requêtes par IP fournie dans la fonction est seulement en mémoire, par instance. Ajouter un contrôle d’identité ou anti-abus et un quota durable côté serveur, surveiller les dépenses API, ainsi qu’une politique de confidentialité adaptée aux mineurs.

## Fullta, assistant d’action

Le panneau Fullta reconnaît des commandes locales et agit dans l’interface :

- « Lance le quiz de personnalité »
- « Lance le quiz développeur web »
- « Ouvre paysagiste »
- « Montre les métiers technologie »
- « Ajoute paysagiste aux favoris » / « Retire paysagiste des favoris »
- « Montre mes favoris »

Il s’agit pour le moment d’un interpréteur de commandes, sans modèle d’IA connecté. `fullta.js` transforme le texte en actions structurées ; `executeFulltaAction` dans `app.js` vérifie les actions disponibles et les applique. Les ajouts/retraits sont idempotents. Les messages sont affichés en texte, sans exécution de HTML. Les réponses aux quiz restent choisies par l’utilisateur.

Pour brancher une IA ultérieurement, remplacer le planificateur local par un appel à un serveur qui renvoie les mêmes actions structurées. Conserver les clés API exclusivement côté serveur et la validation des actions côté application. Aucun fournisseur, clé ou appel API n’est configuré actuellement.

`npm test` vérifie l’interprétation des principales commandes et les demandes ambiguës. Les anciens favoris Cap demain sont repris automatiquement à la première utilisation.

## Pages publiques et authentification

- `/` : landing page (présentation, parcours, Fullta, FAQ).
- `/explorer.html` : application existante, quiz, catalogue et favoris.
- `/explorer.html?quiz=1` : lancement direct du quiz de profil.
- `/explorer.html?fullta=1` : ouverture directe de Fullta.
- `/auth.html` : formulaire de connexion.
- `/auth.html?mode=signup` : formulaire d’inscription.

Les formulaires d’inscription, connexion et demande de réinitialisation sont désormais reliés à Supabase Auth. Leur bon fonctionnement dépend de la configuration d’e-mail et des URL de redirection dans le tableau de bord Supabase. La navigation gratuite reste disponible sans compte. Les mots de passe ne sont jamais stockés par le site.

## Identité visuelle

`vibrant.css` applique une palette rose, violette et turquoise aux trois pages, aux quiz et à Fullta. `assets/possibles.svg` contient les personnages et les formes holographiques, sans service d’images externe. Les animations décoratives respectent `prefers-reduced-motion`. Le serveur local sert les SVG avec le type `image/svg+xml`.

## Illustration détaillée

La page d’accueil et la connexion utilisent `assets/people-detailed-v3.png`, intégrée via `vibrant-illustrated.css`. Ces nouveaux noms évitent la réutilisation en cache des anciens dessins. L’illustration originale reste disponible dans les fichiers historiques.
