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
    let regexEltMaleToFind = /\[nomM\]/g;
    let regexEltFemaleToFind = /\[nomF\]/g;

    let nbMale = namesOfPlayers.filter(player => player.gender == "M").length;
    let nbFemale = namesOfPlayers.filter(player => player.gender == "F").length;

    let sentencesNotPick = [];
    for (let i = 0; i < listSentences.length; i++) {

        let nbEltFinded = listSentences[i].text.match(regexEltToFind);
        nbEltFinded = nbEltFinded == null ? 0 : nbEltFinded.length;

        let nbEltMaleFinded = listSentences[i].text.match(regexEltMaleToFind);
        nbEltMaleFinded = nbEltMaleFinded == null ? 0 : nbEltMaleFinded.length;

        let nbEltFemaleFinded = listSentences[i].text.match(regexEltFemaleToFind);
        nbEltFemaleFinded = nbEltFemaleFinded == null ? 0 : nbEltFemaleFinded.length;

        //On vérifie s'il y a bien, autant ou plus de joueur que la phrases en nécessite (en fonction du sexe)
        let enoughEltHomme = nbMale >= nbEltMaleFinded;
        let enoughEltFemme = nbFemale >= nbEltFemaleFinded;
        let enoughPlayer = namesOfPlayers.length >= (nbEltFinded + nbEltMaleFinded + nbEltFemaleFinded);
        if (enoughEltHomme && enoughEltFemme && enoughPlayer) {
            let sentencesToPush = listSentences[i];
            sentencesToPush["gender"] = {neutral: nbEltFinded, male: nbEltMaleFinded, female: nbEltFemaleFinded};
            sentencesNotPick.push(sentencesToPush);
        }
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
 * On configure les phrases (met les noms)
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

        initSentence(sentencesChosen[i], eltToFind, sentencesChosen[i].gender.neutral);
        initSentence(sentencesChosen[i], eltHommeToFind, sentencesChosen[i].gender.male);
        initSentence(sentencesChosen[i], eltFemmeToFind, sentencesChosen[i].gender.female);
        //Pour le nombre de joueur que la phrase necessite
        function initSentence(sentenceToInit, eltToFindGender, nbGender) {
            for (let j = 0; j < nbGender; j++) {
                //On prends la liste des joueurs à choisir (en fonction du genre)
                let playerToPick;
                if (eltToFindGender == eltFemmeToFind)
                    playerToPick = playersNotPicked.filter(player => player.gender == "F");
                else if (eltToFindGender == eltHommeToFind)
                    playerToPick = playersNotPicked.filter(player => player.gender == "M");
                else
                    playerToPick = playersNotPicked;

                //Choisit un joueur au hasard
                let playerPicked = playerToPick[Math.floor(Math.random()*playerToPick.length)];

                //Retire ce joueur de la liste des joueurs non pris
                playersNotPicked.splice(playersNotPicked.indexOf(playerPicked), 1);

                //Remplace le eltToFind par le nom du joueur
                sentenceToInit.text = sentenceToInit.text.replace(eltToFindGender, playerPicked.name);
                //Si la phrase est un virus et qu'on trouve un eltToFind dans les details
                if (sentenceToInit.type == "virus" && sentenceToInit.details.indexOf(eltToFindGender) > -1) {
                    //Remplace le eltToFind par le nom du joueur (le même que le text)
                    sentenceToInit.details = sentenceToInit.details.replace(eltToFindGender, playerPicked.name);
                }
            }
        }
    }
    return sentencesChosen;
}

/**
 * Place les virus en tant que phrase
 * @param  {Array} sentences tableau des phrases retenues
 */
function putVirus(sentences) {
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
        console.log(promises[0]);
        let sentencesChosen = pickSentences(promises[0], promises[1], promises[2]);
        sentencesChosen = initSentences(promises[0], sentencesChosen);
        putVirus(sentencesChosen);
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
        window.location = "../jeuGuy/play.html"
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