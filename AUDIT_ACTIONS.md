# Plan de mise en œuvre de l’audit — Moi Demain

**Date : 30 octobre 2026.** Ce document décrit ce qui est codé, vérifié et ce qui reste explicitement non finalisé.

## Réalisations de cette évolution

- `mon-espace.html` : profil facultatif, tableau de bord de progression, favoris synchronisés, historique des résultats, plusieurs personnages, comparateur de métiers, export JSON, effacement du parcours, déconnexion et demande de suppression définitive du compte.
- `user-data.js` : accès aux données du compte via Supabase Auth et RLS, sans aucune clé secrète dans le navigateur.
- `auth.js` : inscription affichée comme réservée aux parents / adultes responsables (déclaration explicite, **sans vérification d’identité**). La navigation gratuite reste ouverte en visiteur.
- `personnages.js` : sauvegarde des personnages dans le compte en plus du stockage local.
- `app.js` : échappement renforcé du HTML généré à partir des fiches et des résultats ; enregistrement minimal des conclusions des quiz et synchronisation des favoris ; filtre gratuit / Premium.
- `floating-chat.js` et `fullta-chat` : commandes locales accessibles gratuitement, consentement explicite pour l’envoi de messages libres, connexion requise pour l’IA distante, quota de 20 appels par compte et par heure en base, modération des entrées et des réponses. **Aucune garantie de réponse IA réelle sans secret OPENAI_API_KEY**.
- `supabase/functions/delete-my-account` : suppression authentifiée du compte sur le serveur après confirmation forte, avec suppression en cascade des données liées.
- `admin.html` : administration protégée par rôles RLS pour annonces, signalements et contenu des fiches Premium. **Aucun administrateur initial n’a été attribué.**
- `contact.html` et `support.js` : formulaire de signalement pour adultes connectés, sans collecte de données sensibles demandées.
- `parents.html` : conseils parentaux et limites explicites de vérification de l’âge.
- `announcements.js` : annonces publiques publiées uniquement par les administrateurs, sans HTML arbitraire.
- `sitemap.xml` et `robots.txt` : ressources SEO initiales ; le fichier robots d’un site GitHub Pages de type projet n’est pas à la racine du domaine.
- `.github/workflows/uptime.yml` : vérification des pages principales toutes les 6 heures via GitHub Actions.
- `.github/workflows/visual-qa.yml` : captures et tests visuels sur ordinateur et mobile ; les captures sont disponibles en artefacts GitHub lorsque le workflow est lancé.
- `audit.test.js` et `visual-qa.mjs` : contrôles de non-régression.

## Supabase — données et confidentialité

Tables ajoutées : `user_profiles`, `user_favorites`, `quiz_history`, `user_avatars`, `admin_users`, `site_announcements`, `fullta_rate_limits`, `support_tickets`. Toutes ont **RLS activée**.

- Les utilisateurs connectés peuvent lire et modifier uniquement leurs propres données.
- Les contenus Premium restent verrouillés par droits Premium côté serveur.
- Les membres de `admin_users` disposent de droits éditoriaux explicitement contrôlés par RLS, sans possibilité d’auto-attribution depuis le navigateur.
- `fullta_rate_limits` n'est pas accessible au navigateur, l'accès est limité à un appel serveur autorisé.

Pour activer l'administration : créer d’abord son compte adulte ; dans le tableau de bord Supabase, identifier **avec certitude** l’UUID de ce compte, puis attribuer manuellement le rôle administrateur en insérant cet UUID dans `public.admin_users` via le SQL Editor. Ne jamais attribuer d’administration à un e-mail inconnu ou déduit.

## Ce qui n’est PAS terminé et ne doit pas être déclaré comme opérationnel

1. **Paiements réels :** les secrets PayDunya, le tarif officiel, la validation des webhooks en sandbox/live, les reçus et le SAV marchand manquent. Aucun achat réel n’a été effectué ou activé.
2. **Contrôle parental vérifié :** la case de déclaration d’adulte n’est pas une preuve d’âge ou de responsabilité. Ne pas autoriser de comptes autonomes de mineurs avant d’avoir une solution appropriée et une validation juridique.
3. **Documents juridiques officiels :** raison sociale, coordonnées de support, immatriculation, politique de remboursement, durées de conservation et audit détaillé des prestataires toujours à compléter, comme indiqué dans `LEGAL_A_COMPLETER.md`.
4. **Validation pédagogique :** plusieurs itinéraires de formation décrivent la France, pas nécessairement le Sénégal. Faire vérifier les parcours par des professionnels locaux et adapter les fiches par pays.
5. **Sécurité avancée :** réaliser un audit de pénétration indépendant, tester la suppression de compte sur un compte de test uniquement, vérifier les permissions réelles de tous les profils et établir la gestion des incidents.
6. **Sauvegardes et reprise :** vérifier la disponibilité et la restauration de backups Supabase selon le plan utilisé ; documenter une procédure, tester une restauration isolée.
7. **Vie privée et statistiques :** tout outil d’analytics ou d’engagement à venir nécessite une analyse de consentement et de minimisation, notamment pour les mineurs. Aucun dispositif de suivi comportemental tiers n’a été ajouté.
8. **Tests humains :** faire essayer l’ensemble des parcours à un groupe de familles sur mobile, vérifier l’accessibilité clavier / lecteur d’écran et mesurer Lighthouse en production avant commercialisation.
9. **Infrastructure :** configurer, si souhaité, un domaine personnalisé et la politique d’en-têtes HTTP (CSP/HSTS) sur un hébergement permettant de les contrôler ; GitHub Pages a des limites sur les en-têtes personnalisés.

## Vérifications pour chaque nouvelle version

- `npm test` puis `node --check` pour tous les scripts.
- Consulter les workflows GitHub **Vérification Moi Demain** et **Tests visuels Moi Demain** avant fusion.
- Vérifier les Security Advisors Supabase : les éventuels signalements doivent être étudiés. Le quota Fullta peut produire un message informatif attendu sur une table RLS sans politique publique.
- Vérifier une version fraîche du site à https://sigroupeimmo4-ux.github.io/moidemain/ ; ne pas confondre réussite de compilation et validation fonctionnelle complète.

**Statut commercial final : non prêt pour un lancement payant.** L’objectif de cette version est d’améliorer considérablement la sécurité et les fonctionnalités existantes sans prétendre que les tâches externes ont été terminées.
