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
    xhr.open("GET", "../simonGame/tiles.json", true);

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

let tilesJS = null;
let playersPos = [];
let playerToPlay = 0;
let maxPosTile = 0;

/**
 * Lance le jeu, initialise toutes les ressources
 */
function startGame() {
    let namesOfPlayers = JSON.parse(localStorage.getItem("namesOfPlayers"));
    for (let i = 0; i < namesOfPlayers.length; i++) {
        playersPos.push([namesOfPlayers[i], 0]);
    }

    //On prend le nombre de case qu'il y a dans le jeu
    ajaxGet((fileJSON) => {
        maxPosTile = Object.keys(fileJSON["tilesContent"]).length-1;
        tilesJS = fileJSON["tilesContent"];
    });
}

/**
 * lance un tour
 */
function playRound() {
    let diceVal = rollDice();
    console.log("diceVal : " + diceVal);
    movePlayer(diceVal);

    setTimeout(checkEffect, 1000);

    console.log("playerToPlay : " + playerToPlay);
    console.log(playersPos);
    ajaxGet(reloadJSON);
}

function checkEffect() {
    //On gère les effets de case
    var effect = tilesJS[playersPos[playerToPlay][1]]["effect"];
    if (effect == "again") {
    }
    else {
        if (effect.split("/")[0] == "before") {
            movePlayer(-parseInt(effect.split("/")[1], 10));
        }
        else if (effect.split("/")[0] == "after") {
            movePlayer(parseInt(effect.split("/")[1], 10));
        }
        nextPlayer();
    } 
}

startGame();

function rollDice() {
    var randomNumber = Math.floor(Math.random()*6)+1;
    return randomNumber;
}

function movePlayer(nbCases) {
    if (playersPos[playerToPlay][1] + nbCases < maxPosTile) {
        playersPos[playerToPlay][1] += nbCases;
    }
    else if (playersPos[playerToPlay][1] + nbCases < 0) {
        playersPos[playerToPlay][1] = 0;
    }
    else  {
        playersPos[playerToPlay][1] = maxPosTile;
    }
    showDetails();
    showText();
}

function nextPlayer() {
    //Evite d'avoir une boucle infini dans le cas où tout les joueurs sont arrivés
    let i = 0;
    //On choisit quel est le joueur suivant
    do {
        if (playerToPlay >= playersPos.length-1) {
            playerToPlay = 0;
        }
        else {
            playerToPlay++;
        }
        i++;
    } while (playersPos[playerToPlay][1] == maxPosTile && i < playersPos.length)
}

function showDetails() {
    var text = tilesJS[playersPos[playerToPlay][1]]["text"];
    alert(text);
}

function showText() {
    const simonSentencesMain = document.querySelector("#simonPlaySentencesMain");

    while (simonSentencesMain.hasChildNodes()) {
        simonSentencesMain.removeChild(simonSentencesMain.lastChild);
    }

    for (let i = 0; i < tilesJS.length; i++) {
        var spanTile = document.createElement("span");
        spanTile.innerText = tilesJS[i]["text"];
        for (let j = 0; j < playersPos.length; j++) {
            if (playersPos[j][1] == i) {
                spanTile.innerText = spanTile.innerText + "   --> " + playersPos[j][0];
            }
        }
        simonSentencesMain.appendChild(spanTile);
    }
}

function reloadJSON(tilesJSON) {
    tilesJS = tilesJSON["tilesContent"];
}