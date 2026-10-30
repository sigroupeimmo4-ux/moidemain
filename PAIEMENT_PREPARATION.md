# Paiement Premium — PayDunya (préparé, non activé)

**État au 30 octobre 2026 :** intégration PayDunya côté serveur déployée, **aucune vente réelle activée**.

## Proposition commerciale

- Accès permanent aux 16 fiches Premium du catalogue existant.
- **Tarif de travail proposé : 2 500 FCFA, paiement unique**, sans abonnement ni renouvellement automatique.
- Ce tarif n’a pas encore été validé par le propriétaire. Il est affiché comme **indicatif** ; la page de paiement réelle doit reprendre le tarif confirmé.
- Les 20 fiches gratuites, les quiz gratuits, les conseils et les personnages restent gratuits.
- Achats réservés à un parent ou un adulte responsable, avec contrôle juridique adapté à un service destiné aux mineurs.

## Moyens de paiement prévus

PayDunya propose le paiement par redirection (PAR). Selon les options activées par le marchand : **Wave Sénégal, Orange Money Sénégal, Free Money, carte bancaire**. La disponibilité réelle dépend de l'activation du compte marchand.

Documentation officielle : https://developers.paydunya.com/doc/FR/http_json

## Flux technique déjà intégré

1. Le parent se connecte à son compte Moi Demain (Supabase Auth).
2. La page Premium affiche le tarif serveur si PayDunya est configuré, sinon le prix **indicatif**.
3. Le parent confirme sa responsabilité.
4. L’Edge Function `premium-checkout` authentifie la session, refuse un second paiement si l’accès est déjà actif, enregistre une commande serveur avec montant déterminé **côté serveur** et crée la facture PayDunya.
5. Le navigateur est dirigé vers une URL HTTPS `app.paydunya.com` vérifiée.
6. PayDunya transmet une IPN à `premium-payments-webhook` ; le serveur vérifie le hash SHA-512 et interroge **à nouveau** l'API PayDunya pour vérifier le statut, le montant, le mode, le token et l’utilisateur.
7. En mode **live** seulement et pour une transaction réellement confirmée, l’accès de l’utilisateur est activé dans `premium_access`. Le mode **test** n’active aucun droit commercial.
8. Le retour navigateur ne crée jamais un droit Premium sur la seule base de son URL : il déclenche une vérification authentifiée du paiement.
9. La table `premium_careers` reste protégée par une RLS qui ne permet la lecture qu’aux utilisateurs avec droit Premium actif.

### Fichiers

- `supabase/functions/premium-checkout/index.ts`
- `supabase/functions/premium-payments-webhook/index.ts`
- `supabase/functions/_shared/premium-payment.ts`
- `premium.js`, `premium.html`, `experience.css`
- Table Supabase `premium_orders` avec RLS et lecture des seules commandes de l'utilisateur ; aucune écriture depuis le navigateur.
- Table Supabase `premium_access` avec RLS et droits attribués côté serveur uniquement.

## Configuration manquante avant tout test effectif

Dans PayDunya Business, créer une application d’intégration, d'abord en mode **sandbox**. Après réception des identifiants, les ajouter uniquement aux **secrets Supabase**, jamais sur GitHub ou dans le navigateur :

| Secret | Rôle |
|---|---|
| `PAYDUNYA_MASTER_KEY` | Clé maître PayDunya |
| `PAYDUNYA_PRIVATE_KEY` | Clé privée PayDunya |
| `PAYDUNYA_TOKEN` | Token d’application |
| `PAYDUNYA_MODE` | `test` pendant les vérifications |
| `PAYDUNYA_PRICE_XOF` | Montant entier approuvé, par ex. `2500` seulement après validation commerciale |
| `PAYDUNYA_ENABLE_CHECKOUT` | `true` **uniquement** quand le test marchand est prêt |
| `PAYDUNYA_LIVE_APPROVED` | Laisser `false` tant que le lancement commercial n’a pas été validé ; nécessaire au mode `live` |

Les Edge Functions utilisent aussi les clés Supabase serveur gérées par l’environnement.

## Avant le passage en production

- Valider le montant définitif, les taxes, les frais PayDunya, le pays de vente et les conditions générales.
- Tester en sandbox le paiement réussi, annulé, échoué, le double clic, l’IPN répétée, un token volé et une session expirée.
- Vérifier la réception de l'email de confirmation Supabase et les URL autorisées.
- Contrôler les droits des utilisateurs et les logs des fonctions Edge.
- Préparer politique de confidentialité, règles de consentement parental et conditions de remboursement / accès numérique.
- Un adulte responsable doit approuver explicitement le lancement. Remplacer ensuite les clés test par les clés **live**, définir `PAYDUNYA_MODE=live`, et n'activer `PAYDUNYA_LIVE_APPROVED=true` qu'une fois tous les prérequis satisfaits.

**Important :** Aucun paiement, débit ni activation de compte marchand n'a été réalisé pendant cette intégration. Ce fichier ne contient aucun secret.
