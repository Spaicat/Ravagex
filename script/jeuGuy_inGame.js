function getXMLHttpRequest() {
    var xhr = null;
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest(); 
        }
    } else {
        alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
        return null;
    }
    return xhr;
}

function ajaxGet(callback) {
    //On crée l'objet XHR
    var xhr = getXMLHttpRequest();
    //On l'ouvre = type, url/file, async
    xhr.open("GET", "../jeuGuy/listHard.json", true);

    xhr.onload = function() {
        //HTTP status : 200=OK, 403=Forbidden, 404=Not Found
        if (xhr.status == 200) {
            var fileJSON = JSON.parse(xhr.responseText);
            callback(fileJSON);
        }
    }

    //Envoie la requête
    xhr.send();
}

//Liste des noms des joueurs
const namesOfPlayers = null;
var sentencesChosen = [];

/**
 * On pioche les phrases
 */
function pickSentences() {
    sentencesChosen = [];
    ajaxGet((fileJSON) => {
        var listSentences = fileJSON.listHard.sentences
        //Pour rechercher un certain type (si structure json change) :
        //listSentences.filter(sentence => sentence.type == "normal");

        var sentencesNotPick = [];
        //Pour chaque phrases on vérifie si on a le nombre de joueur requis
        for (var i = 0; i < listSentences.length ; i++) {
            //On vérifie s'il y a bien, autant ou plus de joueur que la phrases en nécessite
            if (namesOfPlayers.length >= listSentences[i].minPlayer)
                sentencesNotPick.push(listSentences[i]);
        }

        //Nombre de phrases à choisir
        var nPicked = 30;
        //On voit s'il y a assez de phrases dans le json
        if (nPicked > listSentences.length) {
            nPicked = listSentences.length;
        }

        //On pioche un certains nombre de phrases
        for (var i = 0; i < nPicked; i++) {
            //On prend le numéro de la phrase choisit au hasard
            var nRandomSentences = Math.floor(Math.random()*sentencesNotPick.length);
            //On supprime la phrase choisit dans notre liste de phrase pas encore tiré
            sentencesChosen.push(sentencesNotPick.splice(nRandomSentences, 1)[0]);
        }
    });
}

/**
 * On configure les phrases
 */
function initSentences() {
    var eltToFind = "[nom]";
    for (var i = 0; i < sentencesChosen.length; i++) {
        for (var j = 0; j < sentencesChosen[i].minPlayer; j++) {
            var playerPicked = namesOfPlayers[Math.floor(Math.random()*namesOfPlayers.length)];
            //TODO : Vérifier si on a pas déjà piocher le joueur (voir prog python)
            sentencesChosen[i].text.replace(eltToFind, playerPicked);
        }
    }
}

/**
 * Lance le jeu, initialise toutes les ressources
 */
function startGame() {
    namesOfPlayers = JSON.parse(localStorage.getItem("namesOfPlayers"));
}

startGame();