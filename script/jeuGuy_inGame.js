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
        const response = await fetch("../jeuGuy/jeuGuySentencesTest.json");
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
 * On pioche les phrases (On vérifie s'il y a assez de joueurs)
 */
function pickAllSentences(namesOfPlayers, gameMode, fileJSON) {
    let listSentences;
    if (gameMode == "easy") {
        listSentences = fileJSON.listEasy.sentences;
    }
    else {
        listSentences = fileJSON.listHard.sentences;
    }
    const eltToFind = "[nom]";
    let regexEltToFind = /\[nom\]/g;
    let regexEltHommeToFind = /\[nomM\]/g;
    let regexEltFemmeToFind = /\[nomF\]/g;

    let nbHomme = namesOfPlayers.filter(player => player.gender == "M").length;
    let nbFemme = namesOfPlayers.filter(player => player.gender == "F").length;

    let sentencesNotPick = [];
    for (let i = 0; i < listSentences.length; i++) {

        let nbEltFinded = listSentences[i].text.match(regexEltToFind);
        nbEltFinded = nbEltFinded == null ? 0 : nbEltFinded.length;

        let nbEltHommeFinded = listSentences[i].text.match(regexEltHommeToFind);
        nbEltHommeFinded = nbEltHommeFinded == null ? 0 : nbEltHommeFinded.length;

        let nbEltFemmeFinded = listSentences[i].text.match(regexEltFemmeToFind);
        nbEltFemmeFinded = nbEltFemmeFinded == null ? 0 : nbEltFemmeFinded.length;

        //On vérifie s'il y a bien, autant ou plus de joueur que la phrases en nécessite (en fonction du sexe)
        let enoughElt = namesOfPlayers.length >= nbEltFinded;
        let enoughEltHomme = nbHomme >= nbEltHommeFinded;
        let enoughEltFemme = nbFemme >= nbEltFemmeFinded;
        if (enoughElt && enoughEltHomme && enoughEltFemme)
            sentencesNotPick.push(listSentences[i]);
    }
    return sentencesNotPick;
}

function pickSentences(namesOfPlayers, gameMode, fileJSON) {
    let sentencesNotPick = pickAllSentences(namesOfPlayers, gameMode, fileJSON);

    let sentencesChosen = [];
    //Nombre de phrases qu'il nous reste à choisir
    let nPicked = 30;
    //Nombre de virus max
    const maxVirus = 4;
    //On voit s'il y a assez de phrases dans le json
    if (nPicked > sentencesNotPick.length) {
        nPicked = sentencesNotPick.length;
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
    const eltFemmeToFind = "[nomF]";
    const eltHommeToFind = "[nomM]";
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
        /*sentencesChosen.forEach(function(v){ delete v.minPlayer });*/
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

function progressBarChange() {
    const bar = document.getElementsByClassName("progress-value")[0];
    let widthCurrent = bar.style.width;
    let widthFinal = currentSentence*100 / sentences.length;
    bar.style.width = widthFinal + "%";
}