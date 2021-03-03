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

function checkFile(fileJSON) {
	const listEasy = fileJSON.listEasy.sentences;
	const listHard = fileJSON.listHard.sentences;

	
	let checkSentences = (list) => {
		let sentencesInfo = {
			nombreTot: 0, nbTotVirus: 0,
			nbRegex: {nbCulSec: 0, nbVetements: 0, nbEmbrasse: 0}
		};
		for (let i = 0; i < list.length; i++) {
			//On vérifie si la phrase n'est pas vide
			if (list[i].text.length === 0)
				throw Error(`Il n'y a pas de texte (${i})`);

			//On vérifie si les virus ont bien des détails
			if (list[i].type == "virus" && list[i].details === 0)
				throw Error(`Il n'y a pas de détails dans le virus suivant : ${list[i].text}`);
			
			sentencesInfo.nombreTot++;

			if (list[i].type == "virus") sentencesInfo.nbTotVirus++;

			let nbCulSec = list[i].text.match(/cul sec/i);
			sentencesInfo.nbRegex.nbCulSec += nbCulSec == null ? 0 : nbCulSec.length;

			let nbVetements = list[i].text.match(/vêtement/i);
			sentencesInfo.nbRegex.nbVetements += nbVetements == null ? 0 : nbVetements.length;

			let nbEmbrasse = list[i].text.match(/embrasse/i);
			sentencesInfo.nbRegex.nbEmbrasse += nbEmbrasse == null ? 0 : nbEmbrasse.length;
		}
		return sentencesInfo;
	}

	let sentencesEasyResult = checkSentences(listEasy);
	let sentencesHardResult = checkSentences(listHard);

	return {Easy: sentencesEasyResult, Hard: sentencesHardResult}
}

function jsonCheckMain() {
	getList().then((fileJSON) => {
		let res = checkFile(fileJSON);
		console.log(res);
	}).catch(console.error);
}

jsonCheckMain();