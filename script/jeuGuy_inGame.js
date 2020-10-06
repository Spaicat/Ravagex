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

    //On attends une réponse au format JSON
    xhr.responseType = 'json';
    //Envoie la requête
    xhr.send();

    xhr.onload = function() {
        //HTTP status : 200=OK, 403=Forbidden, 404=Not Found
        if (xhr.status == 200) {
            var fileJSON = xhr.response;
            callback(fileJSON);
        }
    }
}

//Liste des noms des joueurs
var namesOfPlayers = null;
var sentencesChosen = [];

/**
 * On pioche les phrases
 */
function pickSentences(fileJSON) {
    sentencesChosen = [];
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
    var nPicked = 20;
    //Nombre de virus max
    var maxVirus = 2;
    //On voit s'il y a assez de phrases dans le json
    if (nPicked > listSentences.length) {
        nPicked = listSentences.length;
    }

    //Nombre de virus pioché
    var nPickedVirus = 0;

    //On pioche un certains nombre de phrases
    while (nPicked > 0) {
        //On prend le numéro de la phrase choisit au hasard
        var nRandomSentences = Math.floor(Math.random()*sentencesNotPick.length);
        if (sentencesNotPick[nRandomSentences].type == "virus") {
            if(nPickedVirus < maxVirus) {
                //On supprime la phrase choisit dans notre liste de phrase pas encore tiré
                sentencesChosen.push(sentencesNotPick.splice(nRandomSentences, 1)[0]);
                nPicked -= 2;
            }
        }
        else {
            //On supprime la phrase choisit dans notre liste de phrase pas encore tiré
            sentencesChosen.push(sentencesNotPick.splice(nRandomSentences, 1)[0]);
            nPicked--;
        }
    }
}

/**
 * On configure les phrases
 */
function initSentences() {
    //Element correspondant à ce qu'on doit remplacer par un nom d'un joueur
    var eltToFind = "[nom]";
    //Pour chaque phrases qui avaient été piochées
    for (var i = 0; i < sentencesChosen.length; i++) {
        //On crée la variable qui stocke les joueurs qu'on aura pas encore choisie dans une phrase
        var playersNotPicked = namesOfPlayers.slice();

        //Pour le nombre de joueur que la phrase necessite
        for (var j = 0; j < sentencesChosen[i].minPlayer; j++) {
            //On regarde si le joueur n'a pas déjà été tiré
            do {
                //On choisit un joueur au hasard
                var playerPicked = namesOfPlayers[Math.floor(Math.random()*namesOfPlayers.length)];
                //On regarde si on ne l'a pas déjà choisi
                var isPlayerNotPicked = playersNotPicked.indexOf(playerPicked) > -1;

                //Si le joueur pris au hasard n'a pas été choisi
                if (isPlayerNotPicked) {
                    //On retire ce joueur de la liste des joueurs non pris
                    playersNotPicked.splice(playersNotPicked.indexOf(playerPicked), 1);
                    //On remplace le eltToFind par les nom du joueur
                    sentencesChosen[i].text = sentencesChosen[i].text.replace(eltToFind, playerPicked);
                    //Si la phrase est un virus et qu'on trouve un eltToFind dans les details
                    if (sentencesChosen[i].type == "virus" && sentencesChosen[i].details.indexOf(eltToFind) > -1) {
                        //On remplace le eltToFind par le nom du joueur (le même que le text)
                        sentencesChosen[i].details = sentencesChosen[i].details.replace(eltToFind, playerPicked);
                    }
                }
            } while (!isPlayerNotPicked);
        }
    }
}

/**
 * Lance le jeu, initialise toutes les ressources
 */
function startGame() {
    namesOfPlayers = JSON.parse(localStorage.getItem("namesOfPlayers"));
    ajaxGet((fileJSON) => {
        pickSentences(fileJSON);
        initSentences();
    });
}

startGame();