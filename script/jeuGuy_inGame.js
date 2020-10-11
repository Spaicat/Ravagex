function verifySentencesJSON() {
    getList().then((fileJSON) => {
        const listEasy = fileJSON.listEasy.sentences;
        const listHard = fileJSON.listHard.sentences;
        const eltToFind = "[nom]";
        let regexEltToFind = /\[nom\]/g;

        let allError = "";

        let allErrorEasy = "";
        for (let i = 0; i < listEasy.length; i++) {
            let nbEltToFind = listEasy[i].text.match(regexEltToFind);
            nbEltToFind = nbEltToFind == null ? 0 : nbEltToFind.length;
            let easyMinPlayer = listEasy[i].minPlayer == nbEltToFind;

            if (!easyMinPlayer) {
                let lineMinPlayerError = 1+2+1 + i*6 + 2;
                allErrorEasy += "Le nombre de joueur ne correspond pas au nombre de " + eltToFind + " dans text (ligne ~" + lineMinPlayerError + ")\n";
            }
        }


        let allErrorHard = "";
        for (let i = 0; i < listHard.length; i++) {
            let nbEltToFind = listHard[i].text.match(regexEltToFind);
            nbEltToFind = nbEltToFind == null ? 0 : nbEltToFind.length;
            let easyMinPlayer = listHard[i].minPlayer == nbEltToFind;

            if (!easyMinPlayer) {
                let lineMinPlayerError = 4 + listEasy.length*6 + 5 + i*6 + 2;
                allErrorHard += "Le nombre de joueur ne correspond pas au nombre de " + eltToFind + " dans text (ligne ~" + lineMinPlayerError + ")\n";
            }
        }
        if (allErrorEasy.length > 0) {allError += "\nlistEasy : \n" + allErrorEasy}
        if (allErrorHard.length > 0) {allError += "\nlistHard : \n" + allErrorHard}

        if (allError.length > 0) {throw allError};
    }).catch((e) => {console.error("verifySentencesJSON() : ", e)});
}

async function getNamesOfPlayers() {
    return new Promise((resolve, reject) => {
        const names = localStorage.getItem("namesOfPlayers");
        resolve(JSON.parse(names));
    });
}

async function getGameMode() {
    return new Promise((resolve, reject) => {
        const mode = localStorage.getItem("gameMode");
        resolve(mode);
    });
}

async function getList() {
    try {
        const response = await fetch("../jeuGuy/jeuGuySentences.json");
        if (response.ok) {
            const fileJSON = await response.json();
            return fileJSON;
        }
        else {
            console.error("getList() :", response.status);
        }
    }
    catch (e) {
        console.error("getList() :", e);
    }
}

/**
 * Renvoie un entier aléatoire entre min et max [min, max]
 * @param  {int} min la valeur minimum que peut atteindre l'entier
 * @param  {int} max la valeur maximum que peut atteindre l'entier
 * @return {int}     L'entier tiré au hasard
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * On pioche les phrases
 */
function pickSentences(namesOfPlayers, gameMode, fileJSON) {
    let sentencesChosen = [];
    let listSentences;
    if (gameMode == "easy") {
        listSentences = fileJSON.listEasy.sentences;
    }
    else {
        listSentences = fileJSON.listHard.sentences;
    }
    //Pour rechercher un certain type (si structure json change) :
    //listSentences.filter(sentence => sentence.type == "normal");

    let sentencesNotPick = [];
    //Pour chaque phrases on vérifie si on a le nombre de joueur requis
    for (let i = 0; i < listSentences.length ; i++) {
            //On vérifie s'il y a bien, autant ou plus de joueur que la phrases en nécessite
        if (namesOfPlayers.length >= listSentences[i].minPlayer)
            sentencesNotPick.push(listSentences[i]);
    }

    //Nombre de phrases qu'il nous reste à choisir
    let nPicked = 30;
    //Nombre de virus max
    const maxVirus = 4;
    //On voit s'il y a assez de phrases dans le json
    if (nPicked > listSentences.length) {
        nPicked = listSentences.length;
    }

    //Nombre de virus pioché
    let nPickedVirus = 0;
    //Pioche un certains nombre de phrases
    while (nPicked > 0 && sentencesNotPick.length > 0) {
        //Prend le numéro de la phrase choisit au hasard
        let nRandomSentences = Math.floor(Math.random()*sentencesNotPick.length);

        if (sentencesNotPick[nRandomSentences].type == "virus") {
            if(nPickedVirus < maxVirus) {
                //Supprime la phrase choisie des phrases pas encore tirées
                sentencesChosen.push(sentencesNotPick.splice(nRandomSentences, 1)[0]);
                nPickedVirus++;
                nPicked--;
            }
            else {
                //Supprime la phrase choisie des phrases pas encore tirées car on ne veut plus de virus
                sentencesNotPick.splice(nRandomSentences, 1)
            }
        }
        else {
            //Supprime la phrase choisie dans notre liste de phrases pas encore tirées
            sentencesChosen.push(sentencesNotPick.splice(nRandomSentences, 1)[0]);
            nPicked--;
        }
    }
    return sentencesChosen;
}

/**
 * On configure les phrases
 */
function initSentences(namesOfPlayers, sentencesChosen) {
    //Element correspondant à ce qu'on doit remplacer par un nom d'un joueur
    const eltToFind = "[nom]";
    //Pour chaque phrases qui avaient été piochées
    for (let i = 0; i < sentencesChosen.length; i++) {
        //Stocke les joueurs qu'on a pas encore choisie dans une phrase
        let playersNotPicked = namesOfPlayers.slice();

        //Pour le nombre de joueur que la phrase necessite
        for (let j = 0; j < sentencesChosen[i].minPlayer; j++) {
            //Choisit un joueur au hasard
            let playerPicked = playersNotPicked[Math.floor(Math.random()*playersNotPicked.length)];

            //Retire ce joueur de la liste des joueurs non pris
            playersNotPicked.splice(playersNotPicked.indexOf(playerPicked), 1);

            //Remplace le eltToFind par le nom du joueur
            sentencesChosen[i].text = sentencesChosen[i].text.replace(eltToFind, playerPicked);
            //Si la phrase est un virus et qu'on trouve un eltToFind dans les details
            if (sentencesChosen[i].type == "virus" && sentencesChosen[i].details.indexOf(eltToFind) > -1) {
                //Remplace le eltToFind par le nom du joueur (le même que le text)
                sentencesChosen[i].details = sentencesChosen[i].details.replace(eltToFind, playerPicked);
            }
        }
    }
    return sentencesChosen;
}

/**
 * Place les virus en tant que phrase
 * @param  {Array} sentences tableau des phrases retenues
 */
function placeVirus(sentences) {
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].type == "virus") {
            const indexRandVirus = getRandomInt(3, 6);
            const sentenceVirus = {"text": sentences[i].details, "type": "virusEnd"};
            sentences.splice(i+indexRandVirus, 0, sentenceVirus);
        }
    }
    console.log(sentences);
}

let sentences = [];

/**
 * Lance le jeu, initialise toutes les ressources
 */
function startGame() {
    const namesPromise = getNamesOfPlayers();
    const gameModePromise = getGameMode();
    const listPromise = getList();

    Promise.all([namesPromise, gameModePromise, listPromise]).then((promises) => {
        let sentencesChosen = pickSentences(promises[0], promises[1], promises[2]);
        sentencesChosen = initSentences(promises[0], sentencesChosen);
        sentencesChosen.forEach(function(v){ delete v.minPlayer });
        placeVirus(sentencesChosen);
        return sentencesChosen;
    }).then((sentencesFinal) => {
        let sentenceText = document.getElementById("sentence-p");
        sentenceText.innerHTML = sentencesFinal[0].text;
        sentences = sentencesFinal;
    }).catch((e) => {console.error("startGame() :", e)});
}

startGame();



let currentSentence = 0;

function nextSentence() {
    if (currentSentence < sentences.length-1) {
        currentSentence++;
        let sentenceText = document.getElementById("sentence-p");
        sentenceText.innerText = sentences[currentSentence].text;
        progressBarChange();
    }
    else {
        window.location = "../jeuGuy/play.php"
    }
}

function previousSentence() {
    if (currentSentence > 0) {
        currentSentence--;
        let sentenceText = document.getElementById("sentence-p");
        sentenceText.innerText = sentences[currentSentence].text;
        progressBarChange();
    }
}

let backMainElt = document.getElementById("container-click");
backMainElt.onclick = function (e) {
    const item = e.target;
    const previous = document.getElementById("previous-click");
    const next = document.getElementById("next-click");
    if(item === this || item === next) {
        nextSentence();
    }
    else if (item === previous) {
        previousSentence();
    }
}
initProgressBar();
function initProgressBar() {
    const hexColor = ["ff4081", "0078fa", "ffa500", "ff0000"];
    const bar = document.getElementsByClassName("progress-value")[0];
    const indexHexColor = getRandomInt(0, hexColor.length);
    bar.style.backgroundColor = "#" + hexColor[indexHexColor];
}

function progressBarChange() {
    const bar = document.getElementsByClassName("progress-value")[0];
    let widthCurrent = bar.style.width;
    let widthFinal = currentSentence*100 / sentences.length;
    bar.style.width = widthFinal + "%";
}