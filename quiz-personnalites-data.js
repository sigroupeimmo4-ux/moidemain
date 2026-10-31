// Quiz de découverte uniquement. Aucun diagnostic, profilage sensible ou accès aux plateformes.
export const TRAITS={
 creatif:{title:'L’imagination en action',icon:'🎨',summary:'Tu sembles apprécier les idées, les histoires et les façons originales de t’exprimer.',action:'Essaie de créer une affiche, une photo ou un mini-récit.',jobs:[{id:'designer',name:'Designer UX / UI',emoji:'🎨'},{id:'photographe',name:'Photographe',emoji:'📷'},{id:'journaliste',name:'Journaliste',emoji:'📰'}]},
 analytique:{title:'La curiosité qui cherche',icon:'🔎',summary:'Tu sembles aimer comprendre comment les choses fonctionnent et découvrir de nouvelles explications.',action:'Choisis une question intéressante et cherche des réponses dans plusieurs sources.',jobs:[{id:'dev',name:'Développeur web',emoji:'💻'},{id:'ingenieure',name:'Ingénieur / ingénieure',emoji:'⚙️'},{id:'data',name:'Analyste de données',emoji:'📊'}]},
 social:{title:'Le plaisir de partager',icon:'💬',summary:'Tu sembles être attiré par les échanges, les personnages et ce que vivent les autres.',action:'Pose trois questions à un adulte sur son métier et écoute son histoire.',jobs:[{id:'educ',name:'Éducateur spécialisé',emoji:'🤝'},{id:'veterinaire',name:'Vétérinaire',emoji:'🐾'},{id:'communication',name:'Chargé de communication',emoji:'📣'}]},
 pratique:{title:'L’envie d’essayer',icon:'🛠️',summary:'Tu sembles aimer les expériences concrètes, le mouvement et les projets que l’on peut réaliser.',action:'Fabrique, cuisine ou plante quelque chose de simple avec l’aide d’un adulte.',jobs:[{id:'paysage',name:'Paysagiste',emoji:'🌳'},{id:'artisan',name:'Menuisier / menuisière',emoji:'🪵'},{id:'cuisinier',name:'Cuisinier / cuisinière',emoji:'🍳'}]}
};
const o=(label,trait)=>({label,trait});
const q=(prompt,options)=>({prompt,options});
export const QUIZZES=[
{
 id:'ecrans',icon:'📺',duration:'3 min',label:'YouTube, TikTok et films',title:'Ce que tu aimes regarder',short:'Tes vidéos, tes Shorts, tes TikTok et tes films donnent des idées sur ce qui t’intéresse.',intro:'Pas besoin de connecter YouTube ou TikTok. Choisis simplement ce que tu préfères voir, sans nom de compte ni historique.',accent:'rose',
 questions:[
 q('Quand tu choisis un film, qu’est-ce qui te tente le plus ?',[
 o('Une aventure pleine de décors et de personnages','creatif'),
 o('Une histoire de science, d’inventions ou de mystères','analytique'),
 o('Une belle histoire d’amitié ou de famille','social'),
 o('Une aventure avec des défis, du sport ou de l’action','pratique')]),
 q('Dans les Shorts ou les Reels, quelle vidéo t’arrête le plus souvent ?',[
 o('Un dessin, une danse ou un montage original','creatif'),
 o('Une explication étonnante sur le monde','analytique'),
 o('Une scène drôle ou touchante entre des personnes','social'),
 o('Une fabrication, une recette ou une astuce à essayer','pratique')]),
 q('Sur TikTok ou sur une plateforme semblable, qu’est-ce qui te plairait ?',[
 o('Des créations, chansons, looks ou chorégraphies','creatif'),
 o('Des faits surprenants et des astuces scientifiques','analytique'),
 o('Des rencontres, histoires vraies ou anecdotes','social'),
 o('Des défis, des animaux ou des activités dehors','pratique')]),
 q('Si tu regardes une longue vidéo YouTube, tu choisis plutôt…',[
 o('Un artiste qui montre comment il crée','creatif'),
 o('Une personne qui explique une découverte','analytique'),
 o('Une interview ou une histoire de vie','social'),
 o('Une démonstration pour fabriquer ou tester','pratique')]),
 q('Quel genre de scène te donne envie de voir la suite ?',[
 o('Un univers imaginaire à inventer','creatif'),
 o('Une énigme dont il faut comprendre la solution','analytique'),
 o('Un personnage qui aide un autre personnage','social'),
 o('Un groupe qui relève un défi concret','pratique')]),
 q('Après un film ou une vidéo que tu as aimé, tu as plutôt envie de…',[
 o('Dessiner, raconter ou refaire une scène','creatif'),
 o('Comprendre les coulisses et les effets utilisés','analytique'),
 o('En parler avec quelqu’un et partager tes impressions','social'),
 o('Essayer une activité que tu viens de découvrir','pratique')]),
 q('Si tu pouvais créer une vidéo, quelle serait ton idée ?',[
 o('Inventer une mini-histoire ou un clip','creatif'),
 o('Expliquer une chose fascinante en images','analytique'),
 o('Faire découvrir l’histoire de quelqu’un','social'),
 o('Filmer un défi, un bricolage ou une expérience','pratique')]),
 q('Et si tu ne regardes pas beaucoup de vidéos ?',[
 o('J’aime aussi les livres, les dessins et les histoires','creatif'),
 o('Je préfère chercher des réponses à mes questions','analytique'),
 o('Je préfère discuter, jouer ou partager avec les autres','social'),
 o('Je préfère bouger et faire des activités','pratique')])
 ]
},
{
 id:'moi',icon:'🌟',duration:'3 min',label:'Qui es-tu au quotidien ?',title:'Parlons un peu de toi',short:'Tes réactions, ta manière de choisir et ce qui te rend curieux.',intro:'Il n’y a ni bonne ni mauvaise réponse. Tu peux avoir plusieurs facettes et changer avec le temps.',accent:'violet',
 questions:[
 q('Tu arrives dans un endroit que tu ne connais pas. Tu as envie de…',[
 o('Imaginer tout ce que tu pourrais y inventer','creatif'),
 o('Observer les détails pour comprendre comment ça marche','analytique'),
 o('Faire connaissance avec les personnes présentes','social'),
 o('Explorer les lieux en essayant des activités','pratique')]),
 q('Un ami te demande de l’aide pour un projet. Tu…',[
 o('Proposes une idée originale','creatif'),
 o('Cherches à comprendre le problème','analytique'),
 o('Écoutes ses envies avant de répondre','social'),
 o('Commences à construire une solution avec lui','pratique')]),
 q('Dans un groupe, quel rôle te plaît le plus ?',[
 o('Imaginer la présentation ou le scénario','creatif'),
 o('Organiser les idées et vérifier les détails','analytique'),
 o('Veiller à ce que chacun participe','social'),
 o('Passer à l’action et faire avancer le projet','pratique')]),
 q('Quand tu as un moment libre, tu aimes plutôt…',[
 o('Créer ou rêver à une histoire','creatif'),
 o('Résoudre une énigme ou apprendre quelque chose','analytique'),
 o('Retrouver des proches ou jouer ensemble','social'),
 o('Faire du sport, cuisiner ou bricoler','pratique')]),
 q('Quand une idée ne fonctionne pas du premier coup…',[
 o('J’imagine une autre façon de faire','creatif'),
 o('Je cherche ce qui s’est passé','analytique'),
 o('Je demande des avis et on en parle','social'),
 o('Je recommence autrement pour voir','pratique')]),
 q('Quelle journée te ferait le plus plaisir ?',[
 o('Un atelier de musique, photo ou création','creatif'),
 o('Une visite d’un musée des sciences','analytique'),
 o('Une activité solidaire ou entre amis','social'),
 o('Une sortie nature ou un atelier pratique','pratique')]),
 q('Ce qui te rend fier après un projet, c’est…',[
 o('Avoir imaginé quelque chose de personnel','creatif'),
 o('Avoir trouvé une solution compliquée','analytique'),
 o('Avoir aidé ou réuni des gens','social'),
 o('Avoir réalisé quelque chose de concret','pratique')])
 ]
},
{
 id:'passions',icon:'💗',duration:'3 min',label:'Tes passions et tes envies',title:'Ce qui te passionne',short:'Ce que tu aimes faire, découvrir, partager et essayer.',intro:'Explore tes envies du moment. Une passion peut évoluer et ouvrir plusieurs chemins.',accent:'menthe',
 questions:[
 q('Quelle activité choisirais-tu pour une journée spéciale ?',[
 o('Créer une BD, une musique ou une photo','creatif'),
 o('Visiter un laboratoire ou un planétarium','analytique'),
 o('Organiser une fête ou une rencontre','social'),
 o('Construire un objet ou partir en randonnée','pratique')]),
 q('Qu’est-ce que tu aimerais apprendre pour le plaisir ?',[
 o('Dessiner ou faire du montage vidéo','creatif'),
 o('Coder un jeu ou comprendre les robots','analytique'),
 o('Raconter des histoires ou animer un groupe','social'),
 o('Cuisiner, jardiner ou réparer quelque chose','pratique')]),
 q('Un objet t’intrigue. Ta première envie est de…',[
 o('Imaginer comment le rendre plus beau','creatif'),
 o('Comprendre son fonctionnement','analytique'),
 o('Demander qui l’utilise et pourquoi','social'),
 o('L’essayer pour voir ce qu’il fait','pratique')]),
 q('Tu reçois un carnet neuf. Tu y mets…',[
 o('Des dessins, chansons ou histoires','creatif'),
 o('Des découvertes et des questions','analytique'),
 o('Des souvenirs et idées à partager','social'),
 o('Des projets et des choses à réaliser','pratique')]),
 q('Quel club te tenterait le plus ?',[
 o('Cinéma, théâtre ou arts visuels','creatif'),
 o('Sciences, informatique ou échecs','analytique'),
 o('Débat, entraide ou journal de l’école','social'),
 o('Cuisine, sport ou découverte nature','pratique')]),
 q('Tu peux choisir un petit projet. Tu préfères…',[
 o('Créer une affiche qui raconte une idée','creatif'),
 o('Trouver comment économiser de l’énergie','analytique'),
 o('Préparer une activité avec tes amis','social'),
 o('Fabriquer un jardin ou une maquette','pratique')]),
 q('Dans cinq ans, tu aimerais surtout avoir eu l’occasion de…',[
 o('Créer quelque chose qui te ressemble','creatif'),
 o('Comprendre de nouvelles choses','analytique'),
 o('Partager de belles expériences humaines','social'),
 o('Essayer beaucoup d’activités différentes','pratique')])
 ]
},
{
 id:'apprendre',icon:'🧩',duration:'3 min',label:'Comment tu abordes les défis',title:'Ta façon d’explorer et d’apprendre',short:'Les approches qui t’attirent dans différentes situations.',intro:'Ce quiz n’attribue pas de « style d’apprentissage » fixe : chacun peut utiliser plusieurs méthodes selon le sujet.',accent:'ciel',
 questions:[
 q('Pour découvrir un nouveau sujet, tu préfères commencer par…',[
 o('Imaginer un projet autour de ce sujet','creatif'),
 o('Poser des questions et chercher des explications','analytique'),
 o('En discuter avec quelqu’un','social'),
 o('Faire un essai concret','pratique')]),
 q('Devant une énigme ou un défi, ton premier réflexe est…',[
 o('Inventer plusieurs solutions étonnantes','creatif'),
 o('Repérer les indices et les étapes','analytique'),
 o('Demander d’autres points de vue','social'),
 o('Tester une première idée','pratique')]),
 q('Pour préparer une présentation, tu aimes…',[
 o('Créer des images et une belle histoire','creatif'),
 o('Vérifier les informations','analytique'),
 o('Répéter avec des amis et échanger','social'),
 o('Faire une démonstration','pratique')]),
 q('Tu te rends compte que tu as fait une erreur. Tu…',[
 o('Transformes l’idée en quelque chose de nouveau','creatif'),
 o('Reviens sur les étapes pour comprendre','analytique'),
 o('En parles avec une personne de confiance','social'),
 o('Réessaies avec un autre geste','pratique')]),
 q('Un documentaire t’intéresse. Après, tu voudrais…',[
 o('Inventer une histoire autour du sujet','creatif'),
 o('Lire ou regarder d’autres explications','analytique'),
 o('Le raconter à quelqu’un','social'),
 o('Faire une expérience en lien avec le sujet','pratique')]),
 q('Dans un atelier, quelle place choisirais-tu ?',[
 o('Celle où l’on imagine et dessine','creatif'),
 o('Celle où l’on mesure et compare','analytique'),
 o('Celle où l’on discute en équipe','social'),
 o('Celle où l’on manipule des outils','pratique')]),
 q('Quand tu termines une activité, tu as surtout envie de…',[
 o('La présenter de façon originale','creatif'),
 o('Comprendre ce qui a réussi','analytique'),
 o('Partager ce que tu as découvert','social'),
 o('Passer à un nouveau défi','pratique')])
 ]
}
];
export function getQuiz(id){return QUIZZES.find(q=>q.id===id)||null;}
export function scoreQuiz(id,answers){
 const quiz=getQuiz(id);if(!quiz||!Array.isArray(answers)||answers.length!==quiz.questions.length)return null;
 const scores=Object.fromEntries(Object.keys(TRAITS).map(k=>[k,0]));
 for(let i=0;i<quiz.questions.length;i++){
  const choice=quiz.questions[i].options.find(o=>o.label===answers[i]);
  if(!choice||!(choice.trait in scores))return null;
  scores[choice.trait]++;
 }
 const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]||Object.keys(TRAITS).indexOf(a[0])-Object.keys(TRAITS).indexOf(b[0]));
 const primary=sorted[0][0],secondary=sorted[1][0];
 return {quiz:quiz.id,primary,secondary,scores,
  main:TRAITS[primary],complement:TRAITS[secondary],
  isTie:sorted[0][1]===sorted[1][1],
  careers:[...new Map([...TRAITS[primary].jobs,...TRAITS[secondary].jobs].map(j=>[j.id,j])).values()].slice(0,4),
  summary:'Ce résultat reflète uniquement tes choix dans ce quiz, pas une vérité sur ta personnalité ni une orientation obligatoire.'};
}
