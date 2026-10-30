# moidemain

Site d’orientation en français, sans compte et sans dépendance applicative.

## Démarrer

Avec Node.js 24 :

```sh
npm run dev
```

Le serveur écoute sur le port 3000 (personnalisable avec `PORT`).

## Fonctionnalités

- Quiz de découverte en 8 questions, suggestions expliquées selon quatre familles de préférences.
- Catalogue de 8 métiers avec recherche et filtres.
- Fiches métier et mini-quiz de 3 situations avec restitution.
- Favoris conservés dans le stockage local du navigateur.
- Interface adaptée aux téléphones, navigation clavier et fenêtres modales natives.

Les quiz sont indicatifs, sans validation psychométrique. Les formations citées sont des exemples à vérifier localement. Aucune réponse au quiz n’est envoyée à un serveur. Les polices Google sont facultatives : des polices système prennent le relais sans accès réseau.

## Vérifier

```sh
node --check app.js
node --check server.mjs
```

Aucune publication ou connexion à un service externe n’est nécessaire pour utiliser le site.

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

L’authentification est une interface préparatoire, sans service de comptes connecté. La validation native des formulaires fonctionne, mais les soumissions affichent une explication et ne créent aucune session. Les mots de passe ne sont ni transmis ni enregistrés, et sont vidés à la soumission. La récupération de mot de passe n’envoie aucun e-mail. Le parcours invité reste entièrement accessible. Brancher ensuite un service d’authentification côté serveur pour activer comptes, sessions et réinitialisation.

## Identité visuelle

`vibrant.css` applique une palette rose, violette et turquoise aux trois pages, aux quiz et à Fullta. `assets/possibles.svg` contient les personnages et les formes holographiques, sans service d’images externe. Les animations décoratives respectent `prefers-reduced-motion`. Le serveur local sert les SVG avec le type `image/svg+xml`.

## Illustration détaillée

La page d’accueil et la connexion utilisent `assets/people-detailed-v3.png`, intégrée via `vibrant-illustrated.css`. Ces nouveaux noms évitent la réutilisation en cache des anciens dessins. L’illustration originale reste disponible dans les fichiers historiques.
