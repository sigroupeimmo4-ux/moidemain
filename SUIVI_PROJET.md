### Fullta vivant — 31 octobre 2026
- Conservé le lapin 3D existant et son fonctionnement de bouton flottant, sans bulle autour.
- Ajout de paupières animées pour les clignements, mouvement curieux au survol, étoiles lors des réponses, rebond pendant l’attente du chat.
- Respect de `prefers-reduced-motion`, de la navigation clavier et mise en pause lorsque l’onglet est masqué.
- Mise à jour des versions des fichiers JS/CSS dans les pages afin d’éviter les anciennes ressources en cache.
- Tests automatiques et vérifications navigateur mobile/ordinateur.

### Nouveaux quiz (31 octobre 2026)
- Quatre quiz supplémentaires : centres d’intérêt vidéo/films, quotidien, passions, approche des défis.
- Mise en avant de l’expérience vidéo/films directement sur l’accueil.
- Questions et résultats à vocation exploratoire, sans inférence de personnalité scientifique.
- Réponses détaillées traitées en mémoire du navigateur uniquement, sans consultation de l’historique YouTube/TikTok.
- Sauvegarde **opt-in** du résumé général dans `quiz_history` pour les comptes connectés, aucun changement de schéma.
- Tests de scoring, liens et navigation ajoutés. L’ancien quiz reste conservé.

# SUIVI DE PROJET — MOI DEMAIN
Dernière mise à jour : 30 octobre 2026

## Références
- GitHub : https://github.com/sigroupeimmo4-ux/moidemain
- Branche principale : `main`
- Site : https://sigroupeimmo4-ux.github.io/moidemain/
- Supabase : projet **Moi demain**, référence `sjhvaaaiwijhcykznfqn` (région eu-west-1)

## Version : catalogue élargi / avatars / conseils / Premium

### Catalogue
- Ancien contenu : 8 fiches métier gratuites + quiz de découverte.
- Nouveau contenu : **20 fiches gratuites complètes** (8 d'origine + 12 nouvelles), **16 aperçus Premium**.
- Source publique : `catalogue-extra.js` avec fiches gratuites et titres des Premium uniquement.
- Les détails des 16 fiches Premium sont enregistrés en base Supabase, **jamais dans le JavaScript public**.
- `app.js` et `floating-chat.js` reconnaissent désormais les 36 métiers.
- Les entrées Premium ne lancent pas directement les mini-quiz non autorisés et renvoient vers la page Premium.

### Sécurité Supabase
- Tables : `public.premium_careers` et `public.premium_access`.
- RLS activée sur les deux tables, lecture des droits limitée au propriétaire ; lecture du contenu Premium uniquement si `premium_access.active=true` pour l'utilisateur connecté.
- Aucune politique publique d'écriture des droits d'achat.
- Contenu des 16 fiches Premium ajouté sur Supabase (pas en clair dans GitHub).
- Contrôler régulièrement les conseillers sécurité Supabase.

### Pages
- `personnages.html` + `personnages.js` : quatre animaux (lapin, renard, chat, hibou), couleurs, accessoires, tenues et prénom ; sauvegarde et réinitialisation locale.
- `conseils.html` + `conseils.js` : conseils par tranche d'âge 8–11 / 12–15 / 16–18 ans et liste d'actions hebdomadaires.
- `premium.html` + `premium.js` : présentation de l'offre et vérification des conditions d'achat.
- `experience.css` : style pastel responsive des trois nouvelles pages et bandeau de navigation.
- `auth-client.js` et `auth.js` : compte facultatif via Supabase Auth (sessions en sessionStorage).
- Les liens vers ces pages ont été ajoutés sur l'accueil et l'explorateur.
- Tous les contenus gratuits restent accessibles sans compte.

### État du paiement — préparé, pas encore activé
- **PayDunya retenu pour l'intégration technique** : Wave, Orange Money, Free Money et carte bancaire sous réserve des services du compte marchand.
- **Prix indicatif proposé : 2 500 FCFA, accès unique**, soumis à validation commerciale ; aucun prix réel facturé.
- Edge Functions `premium-checkout` et `premium-payments-webhook` déployées sur Supabase, avec vérification des retours PayDunya.
- Table `premium_orders` sous RLS, et colonnes de provenance du paiement ajoutées à `premium_access`.
- Activation des droits Premium uniquement après confirmation serveur d’un paiement **live**. Les simulations ne débloquent pas le contenu.
- **Aucune clé PayDunya n'est renseignée** dans ce travail. Les paiements restent désactivés jusqu’à configuration marchand et validation du lancement.
- Lire `PAIEMENT_PREPARATION.md` avant toute mise en vente.
- Ne jamais considérer un retour URL comme preuve d’un paiement.

### Pages légales et À propos (30 octobre 2026)
- Sept nouvelles pages publiques : `a-propos.html`, `contact.html`, `cgu.html`, `cgv.html`, `confidentialite.html`, `cookies.html`, `mentions-legales.html`.
- Pied de page commun intégré aux pages existantes, CSS `legal.css`, test de cohérence `legal.test.js`.
- Informations d'éditeur et contact inconnues : **placeholders visibles** et document `LEGAL_A_COMPLETER.md`.
- CGV en version de travail : **aucun achat réel activé**.
- Avant une ouverture commerciale, fournir les coordonnées officielles, les durées et finalités de conservation et faire valider les textes par un conseil juridique dans le ou les territoires de vente.

### Audit général — correctifs techniques du 30 octobre 2026
- Nouvelles pages `mon-espace.html`, `parents.html`, `admin.html`.
- Tables Supabase RLS pour profils, favoris, résultats de quiz, avatars, annonces, rôles d’administration, support et quota Fullta.
- Fullta : appels au modèle uniquement après authentification et accord explicite ; quota durable et modération.
- Parcours : sauvegarde et export, comparaison de métiers, badges non compétitifs, recherche enrichie.
- Supabase : fonction `delete-my-account` déployée (aucune suppression utilisateur réalisée).
- Administration des annonces, fiches Premium et signalements sécurisée par rôles. Aucun admin créé.
- SEO initial, contrôles de disponibilité et captures/tests visuels automatisés.
- **Les paiements réels, le consentement parental vérifié et les informations juridiques officielles restent à finaliser.**
- Détails opérationnels dans `AUDIT_ACTIONS.md`.

### Tests / publication
- `npm test` inclut `experience.test.js` (catalogue et personnalisation) ainsi que les tests Fullta.
- Workflow GitHub `.github/workflows/ci.yml` : tests Node et contrôles de syntaxe.
- Vérifier la réussite du workflow avant de fusionner les changements avec `main`.
- L'accès public dépend de la réussite de GitHub Pages après fusion.

## Éléments en attente
1. Faire valider le montant commercial définitif et connecter le compte marchand PayDunya en sandbox, puis tester avant l'ouverture réelle.
2. Vérification complète de l'inscription, de la réception de l'email de confirmation et de la récupération de mot de passe avec les URL autorisées dans Supabase Auth.
3. Vérifier la conformité de l'usage par des mineurs avant les premières ventes.
4. Ajouter des tests de navigation réels sur mobile et desktop si un navigateur de test est disponible.

## Règles de maintenance
- Garder les 20 fiches gratuites accessibles.
- Conserver les secrets Supabase/Prestataire **hors de GitHub et du navigateur** ; seule la clé publishable Supabase est publiable.
- Ne jamais donner accès à une fiche Premium sur la seule base du localStorage, d'un cookie non signé ou d'un paramètre URL.
- Pour chaque nouvelle évolution, mettre à jour ce fichier de suivi.

### Parcours complétés — 1 novembre 2026

- Navigation mobile accessible sur les pages avec en-tête : menu, liens vers les fonctionnalités, fermeture au clavier et au clic extérieur.
- `comparer.html` : comparaison publique de deux métiers sans compte, quotidien, formations et activités gratuites ; détails Premium verrouillés. Lien partageable et impression/PDF, ainsi que comparaison des favoris de cet appareil.
- Le catalogue gratuit est partagé dans `catalogue.js` pour conserver des informations cohérentes avec l’explorateur.
- `explorer.html?vue=favoris` ouvre directement les favoris invités.
- `reset-password.html` : vérification du lien Supabase, confirmation du nouveau mot de passe, gestion des liens expirés et des erreurs, retrait du jeton de l’adresse et absence de stockage du jeton de récupération.
- Pré requis externe : ajouter `https://sigroupeimmo4-ux.github.io/moidemain/reset-password.html` aux URL de redirection autorisées dans Supabase Auth. L’envoi et la réception d’un e-mail réel n’ont pas été validés ; les scénarios de récupération utilisent des réponses API simulées, sans modification d’un compte existant.
- Tests : `npm test`, `app-journeys.browser.mjs` et `visual-qa.mjs`. Le workflow visuel couvre désormais aussi les push sur `main`.
- Les paiements, l’identité légale, l’attribution d’un administrateur et la validation pédagogique locale restent des prérequis externes décrits dans `AUDIT_ACTIONS.md`.

### Vérification et corrections de bugs — 1 novembre 2026

Défauts reproduits par des tests avant correction :
- Le bouton d’un compte Premium renvoyait à l’accueil de l’explorateur ; les cartes Premium renvoyaient vers la page d’achat au lieu d’ouvrir la fiche autorisée. Le catalogue filtré et l’ouverture via contrôle serveur sont corrigés.
- Ajouter ou retirer un favori depuis un résultat de mini-quiz réenregistrait le même résultat dans l’historique. L’affichage du résultat ne réécrit plus l’historique.
- Des lectures simultanées déclenchaient plusieurs rafraîchissements de session ; les interruptions réseau effaçaient la session. Le rafraîchissement est partagé entre composants, les erreurs temporaires conservent la session, les jetons refusés sont invalidés et une déconnexion n’est pas annulée par une réponse tardive.
- Des données locales invalides faussaient le nombre de favoris ou bloquaient les cases des conseils. Les données sont normalisées avant utilisation.
- Une réponse de synchronisation lente pouvait rétablir un favori qui venait d’être retiré. Les modifications locales récentes sont préservées.

Validation : suite Node, tests de récupération de compte, 10 scénarios navigateur de régression, contrôles des 19 pages à 390 et 1280 pixels, et suite visuelle existante. Les tests Auth/Premium utilisent des réponses simulées et ne créent ni paiement ni compte réel. Les réglages Supabase, les e-mails réels, les autorisations RLS en production et le déploiement GitHub Pages restent à vérifier avec les accès nécessaires.
