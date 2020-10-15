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

function verifySentences(fileJSON) {
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
            let lineMinPlayerError = 4 + i*6 + 2;
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

    if (allError.length > 0) {throw "verifySentences() : " + allError};
}

function verifyStartProgram() {
    getList().then((fileJSON) => {
        verifySentences(fileJSON);
        console.log("Le JSON n'a pas d'erreur");
    }).catch(console.error);
}