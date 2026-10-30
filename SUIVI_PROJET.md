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
