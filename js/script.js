/* --
déclaration et affectation des variables contenant les données ou les options
--*/
let texteHover = null; //De base il n'y a aucun texte pour les valeurs des barres affichés
let barreSuperpose = false; //De base les barres ne sont pas superposées
/* --
déclaration des variables globales
--*/
let s;
let bouton5;
let boutonEntre;
let bouton10;
/* --
déclaration des fonctions classiques
--*/
//function xx(xxx, xxx){}
/* --
déclaration des fonctions de callback
--*/
//function xx(){} ou function xx(event){}
//FONCTION NIVEAU 1
function onSVGLoaded(data){ 
    s.append(data);       // ajoute le graphique svg dans #graph sur mon html
    s = s.select("svg");  //permet d'accéder au svg lui meme (pour pouvoir afficher les texteHover)

    //Pour la fonction boutonClick
    bouton5 = s.select("#bouton-5"); // récupère le calque bouton-5 sur le svg 
    boutonEntre = s.select("#bouton-Entre"); // récupère le calque bouton-Entre sur le svg 
    bouton10 = s.select("#bouton-10"); // récupère le calque bouton-10 sur le svg

    bouton5.click(boutonClick);
    boutonEntre.click(boutonClick);
    bouton10.click(boutonClick);

    //Pour la fonction hover
    //Je recupere toutes les barres individuellement 
    let barres = s.selectAll("#barres path"); // path en fonction de l'arborescence de mon svg
    //Pour chaque barre j'associe les fonctions hoverIn et hoverOut et superposerBarres, ca m'evite de répéter 9 fois le code 
    barres.forEach(barre => {
        //Lancer les fonctions hoverIn et hoverOut lors du hover
        barre.hover(hoverIn, hoverOut);
        //Lancer la superposition des barres au double click
        barre.dblclick(superposerBarres);
    });

    //Pour la fonction zoom
    // récupérer l'id du bouton zoomPlus
    let boutonPlus = document.getElementById('zoomPlus');
    // réaliser l'abonnement entre le bouton et le zoom avant
    if (boutonPlus !== null) {
        boutonPlus.addEventListener("click", zoomPlus);
    }

    // récupérer l'id du bouton zoomMoins
    let boutonMoins = document.getElementById('zoomMoins');
    // réaliser l'abonnement entre le bouton et le zoom arrière
    if (boutonMoins !== null) {
        boutonMoins.addEventListener("click", zoomMoins);
    }

    //Pour la fonction changement de couleur 
    document.getElementById("changeTypo").addEventListener("click", () => {
    document.fonts.ready.then(() => {
        changeTypo();
        console.log("Police chargée et appliquée !");
    });
});
}

//Fonction pour afficher les barres en fonction de leur couleur
function boutonClick(event){
    //recuperer l'id du bouton sur lequel on a cliqué (avec current target pour pas que ca selectionne le mauvais calque)
    let id = event.currentTarget.getAttribute("id");  
    //recuperer soit 5 soit Entre soit 10 pour afficher les bonnes barres du graphique   
    let type = id.split("-")[1];
    //les noms des calques des groupes de barre sur le svg
    let barresId = ["5", "Entre", "10"];

    // Verifier si les barres choisies ne sont pas déjà affichées
    let barreAffiche = s.select("#barre-" + type);
    //Verifier que les autres barres sont cachées (sinon l'interaction pourra pas se lancer)
    let barreCache = true;
    //On teste toutes les barres
    barresId.forEach(barreId => {
        //si la barre qu'on verifie n'est pas celle selectionnée et qu'elle n'a pas de display none
        if (barreId !== type && s.select("#barre-" + barreId).attr("display") !== "none") {
            //Alors toutes les barres ne sont pas cachées
            barreCache = false;
        }
    });

    //Si la barre séléctionnée est déjà affichée et que les autres sont cachées
    if(barreAffiche.attr("display") !== "none" && barreCache==true) {
        // Ré-afficher toutes les barres
        barresId.forEach(barreId => {
            let barre = s.select("#barre-" + barreId);
            barre.attr({ opacity: 0, display: "inline" }); // la mettre visible mais transparente
            barre.animate({ opacity: 1 }, 200, mina.easeinout);

        });
    } else {
        // sinon cacher les barres pas sélectionnées et afficher celle séléctionné
        barresId.forEach(barreId => {
            //Selectionner toutes les barres
            let barre = s.select("#barre-" + barreId);
            //Si la barre est du type sélectionné alors
            if (barreId == type) {
                //on l'affiche
                barre.attr({ opacity: 0, display: "inline" }); // la mettre visible mais transparente
                barre.animate({ opacity: 1 }, 200, mina.easeinout);
            //sinon on la cache
            } else {
                barre.attr({ display: "none" });
            }
        });
    }
}
    
//Fonction quand on survole
function hoverIn(){
    // Récupérer l'id (le nom du calque) de la barre survolée
    let id = this.node.getAttribute("id");
    //Comme les noms ressemblent à : barre-5-2023-1905, je dois récuperer seulement la fin donc je split avec les - et je récupère le dernier élément avec pop
    let valeur = id.split("-").pop(); 
    //console.log("Valeur récupérée :", valeur); Pour verifier que la valeur recupérée est bien ma bonne
    //Je récupère les coordonnées de la barre hover pour pouvoir ensuite placer le texte 
    let barreHover = this.getBBox();
    //Si un texteHover est déjà affiché alors on le supprime avat d'afficher le nouveau
    if (texteHover !== null && texteHover !== undefined) { 
        texteHover.remove();
    }
    //placer le texteHover en fonction de la barre (au milieu et un peu au dessus) et lui donner sa valeur
    texteHover = s.text( barreHover.cx, barreHover.y - 20, valeur).attr({  
        //Les attributs de la boite de texte
        "text-anchor": "middle", //placer au milieu
        "font-size": 40,
        "fill": "#000", 
        "font-weight": "bold",
        "opacity" : 0.5,
});
}
//Fonction lorsqu'on sort du hover
function hoverOut(event) {
    //si il y a un texte hover alors on le supprime, cela empeche que les textes restent tous affiché après le hoverIn
    if (texteHover !== null && texteHover !== undefined) { 
        texteHover.remove();
    }
}

//Fonction superposition des barres
function superposerBarres(){
    //Les différentes années du graphique
    let barresAnnees = ["2003", "2014", "2024"];
    //boucle pour passer par chaque année à chaque fois
    barresAnnees.forEach(annee => {
            // séléctionne toutes les barres d'une année
            let barres = s.selectAll(`#barres path[id*='-${annee}-']`)
    

    //console.log(s.select("#barre-10-2003-74"));
    //console.log(s.select("#barre-Entre-2003-146"));
    //console.log(s.select("#barre-5-2003-1905"));

    // Recuperer positions de la premiere barre
    let posBarre1 = barres[0].getBBox();
    //Recuperer positions X de la Barre 
    let posXBarre1 = posBarre1.x;

    //Comme je ne peux pas utiliser slice (pour recuperer seulement une partie du tableau) sur des éléments snap svg, je suis obligée de transformer mon "tableau" barre en réel tableau javascript : 
    //https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    let barresTableau = Array.from(barres);
    //Récupérer toutes les positions de base des barres pour pouvoir les replacer ensuite à leur position de départ 
    barresTableau.forEach(barre => {
        let pos = barre.getBBox();
        barre.data("posInitx", pos.x);   // position x initiale
        barre.data("posInity", pos.y);   // position y initiale
    });

    //Le foreach passe par toutes les barres sauf la premiere 
    //https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
    barresTableau.slice(1).forEach(barre => {
        let posBarre = barre.getBBox();
        //Déplacer la barre de la difference entre le x son coin haut gauche et celui de la premiere barre
        let calcDeplacX = posXBarre1 - posBarre.x;      
        //Déplacer la barre de la différence entre son y et le y de la premiere barre + la hauteur (pour que les autres barre se placent au dessus au lieu de s'aligner sur le coin gauche)   
        let calcDeplacY = (posBarre.y) - (posBarre.y + posBarre1.height);

        // Déplacer la barre grâce aux calculs
        if (barreSuperpose ==false){ // si les barres ne sont pas déjà superposées alors on les empile
       barre.animate({
                //Animer d'abord en x 
                transform: `t${calcDeplacX},0` 
        }, 300, function() { //Une fois que l'animation en x est faite, déplacer le y
                    barre.animate({
                        // Déplacement en y 
                        transform: `t${calcDeplacX},${calcDeplacY}` 
                    }, 500);
                });
        }
        else{
            barre.animate({ // si les barres sont déjà superposées alors on les désempile
                //recuperer les valeurs de base des positions des barres 
                transform: `t0,0}`
            }, 300)
        }

        // Mettre à jour les coordonnées de la barre déplacée pour déplacer la prochaine barre
        posBarre = barre.getBBox();
    });
    });
    //Inverser la valeur de barreSuperpose pour empiler et desempiler en fonction du besoin
    barreSuperpose = !barreSuperpose
}

//FONCTION NIVEAU 2 
//Fonction du zoom
function zoomPlus(){
    // récupérer le SVG
    let graphique = s; 

    // récupérer le zoom actuel sur le graphique
    let zoomActuel = graphique.data("scale");
    //Pour eviter les erreurs, si le zoom actuel n'est pas définis on le met par défaut à 1
    if (zoomActuel === undefined){
        zoomActuel = 1;
    }

    // définir le zoom, c'est à dire de combien ca va s'agrandir
    let changement = 0.1;

    // calculer la nouvelle taille avec le zoom
    let nouvelleTaille = zoomActuel + changement;

    // vérifier que la taille n'est pas supérieure à 1,2 (car sinon le graphique est trop coupé lors du zoom)
    if (nouvelleTaille <= 1.2) {
        // appliquer le zoom au graphique
        graphique.attr({ transform: `scale(${nouvelleTaille})` });
        // on associe la taille du zoom à scale dans le svg pour mettre à jour le zoom
        graphique.data("scale", nouvelleTaille);
    } else {
        //On arrete les zooms à 1.2
        //faire le zoom jusqu'à 1.2
        graphique.attr({ transform: `scale(1.2)` });
        // on associe 1.2 à scale dans le svg 
        graphique.data("scale", 1.2);
    }
}

function zoomMoins(){
    // récupérer le SVG
    let graphique = s; 

   // récupérer le zoom actuel sur le graphique
    let zoomActuel = graphique.data("scale");
    if (zoomActuel === undefined){
         zoomActuel = 1;
    }

    // définir le zoom, c'est à dire de combien ca va s'agrandir
    let changement = 0.1;

    // calculer la nouvelle taille avec le zoom
    let nouvelleTaille = zoomActuel - changement;

    // vérifier que la taille n'est pas inférieure à 0.8
    if (nouvelleTaille >= 0.8) {
        // appliquer le zoom au graphique
        graphique.attr({ transform: `scale(${nouvelleTaille})` });
        // on associe la taille du zoom à scale dans le svg pour mettre à jour le zoom
        graphique.data("scale", nouvelleTaille);
    } else {
        //On arrete les zooms à 0.8
        //faire le zoom jusqu'à 0.8
        graphique.attr({ transform: `scale(0.8)` });
        graphique.data("scale", 0.8);
    }
}

//Fonction du changement de typo
function changeTypo() {
    // Sélection de tous les textes dans le SVG
    let textes = s.selectAll("text");
    //console.log("Nombre total de textes trouvés :", textes.length);

    // Definir les deux polices utilisées
    let typoDys = "OpenDyslexic, Arial, sans-serif";
    let typoNormale = "ArialMT, Arial, sans-serif";

    // Parcours tout les textes du svg
    textes.forEach((txt) => {
        //Recuperer la police d'ecriture 
        let fontActuelle = txt.node.style.fontFamily;
        if (fontActuelle === null || fontActuelle === undefined || fontActuelle === "") {
            //On utilise getComputedStyle pour être sur de récupérer la police (calculé par le navigateur)
            fontActuelle = window.getComputedStyle(txt.node).fontFamily;
        }

        // Appliquer la police sen fonction de la police affichée
        if (fontActuelle.includes("ArialMT")) {
            //Si c'est arial on affiche la police dys
            txt.node.style.fontFamily = typoDys;
        } else {
            //Si c'est pas arial on affiche arial
            txt.node.style.fontFamily = typoNormale;
        }
    });

    console.log("Changement de typo terminé !");
}






    
// fonction de callback pour récupérer les premiers éléments du DOM, mettre en place les abonnements, ...
function init(){
    //Afficher le graphique dans la div avec l'id graph 
    s = Snap("#graph");
    Snap.load("images/graph.svg", onSVGLoaded);


}
/* --
quand le DOM a été entièrement chargé, on peut appeler la fonction d'initialisation
-- */
window.addEventListener("load", init);