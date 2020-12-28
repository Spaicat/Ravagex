const guyMenu = document.querySelector("#menu-players");
const nameEntryButton = document.querySelector(".name-entry-container button");
const nameEntryTextbox = document.querySelector(".name-entry-container .name-entry");

//Event listener
guyMenu.addEventListener("click", removePlayer);
guyMenu.addEventListener("input", focusNameField);
nameEntryButton.addEventListener("click", addPlayerEvent);
nameEntryTextbox.addEventListener("keyup", addPlayerByKey);

let posXLogoAnimation = 0;
window.addEventListener("mousemove", (event) => {
	posXLogoAnimation = window.innerWidth/2-event.clientX;
	if (event.clientX > window.innerWidth/2) {
		posXLogoAnimation = -event.clientX+window.innerWidth/2;
	}
	posXLogoAnimation /= 30;
	requestAnimationFrame(updateAnimation);
});

function updateAnimation() {
	console.log(posXLogoAnimation);
	document.documentElement.style.setProperty("--axis-x", posXLogoAnimation + "px");
}

function addPlayerEvent(e) {
	item = e.target;
	if (item.parentElement.classList[0] == "name-entry-container") {
		const nameEntry = document.querySelector(".name-entry");
		addPlayer(nameEntry.value);
		nameEntry.value = "";
	}
}

function addPlayerByKey(event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		nameEntryButton.click();
	}
}

let nbLiPlayers = 0;
/**
 * Ajoute un joueur dans la liste
 */
function addPlayer(name, gender) {
	const newPlayerLi = document.createElement("li");

	//On ajoute le span pour le nom
	const span = document.createElement("span");
	span.innerText = name;
	span.classList.add("nameField");
	newPlayerLi.appendChild(span);

	//On ajoute le choix du sexe
	if (gender == null) {gender = (nbLiPlayers % 2) ? "M" : "F"};
	const choiceSex = document.createElement("div");
	choiceSex.classList.add("genderChoice");
	choiceSex.innerHTML = "<input type=\"radio\" id=\"femmeInput" + nbLiPlayers + "\" name=\"genderInput" + nbLiPlayers + "\"" + ((gender == "F") ? " checked />" : "/>");
	choiceSex.innerHTML += "<label for=\"femmeInput" + nbLiPlayers + "\">♀</label>";
	choiceSex.innerHTML += "<input type=\"radio\" id=\"hommeInput" + nbLiPlayers + "\" name=\"genderInput" + nbLiPlayers + "\"" + ((gender == "M") ? " checked />" : "/>");
	choiceSex.innerHTML += "<label for=\"hommeInput" + nbLiPlayers + "\">♂</label>";
	newPlayerLi.appendChild(choiceSex);

	//On ajoute le bouton pour supprimer
	const button = document.createElement("button");
	button.classList.add("btn-remove");
	button.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 41.756 41.756\"><g><path d=\"M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z\"/></g></svg>";
	newPlayerLi.appendChild(button);

	guyMenu.appendChild(newPlayerLi);

	nbLiPlayers++;
	return newPlayerLi;
}

/**
 * Enlève un joueur de la liste
 * @param {Event} e l'event listener
 */
function removePlayer(e) {
	let item = e.target;
	let eIsNotEvent = typeof e.altKey == "undefined";
	//Si l'objet e n'est pas un event alors on change la valeur de item
	if (eIsNotEvent) {
		item = e;
	}

	//On supprime l'item
	if (eIsNotEvent && item.tagName == "LI" && item.parentElement.id == "menu-players") {
		item.remove();
	}
	else if (item.classList[0] == "btn-remove") {
		const playerLi = item.parentElement;
		playerLi.remove();
	}
}

/**
 * Enlève l'erreur sur le champ du nom lorsque l'utilisateur écrit quelque chose dedans
 * @param {Event} e l'event listener
 */
function focusNameField(e) {
	const item = e.target;

	if (item.classList[0] == "nameField") {
		item.classList.remove("errorName");
	}
}

/**
 * Vérifie si toutes les conditions des noms sont remplies et met un message d'erreur dans le cas contraire
 * @return {boolean} renvoie true si toutes les conditions sont respectés
 */
function isAllNameValid() {
	const allNameInput = document.querySelectorAll("#menu-players li span");
	let nameValid = true;
	let nbName;
	for (nbName = 0; nbName < allNameInput.length; nbName++) {
		if (allNameInput[nbName].innerText == "") {
			nameValid = false;
			allNameInput[nbName].classList.add("errorName");
		}
	}
	
	if (!nameValid) {
		document.querySelector("#errorName").innerText = "Remplir tous les champs";
	}
	else if (nbName < 2) {
        nameValid = false;
		document.querySelector("#errorName").innerText = "Minimum deux joueurs";
	}
	else {
		document.querySelector("#errorName").innerText = "";
	}

	return nameValid;
}

/**
 * Lance le jeu en vérifiant les informations
 */
function playjeuGuy() {
	//On prend les noms entrés
	const allNameInput = document.querySelectorAll("#menu-players li span");
	const allGenderInput = document.querySelectorAll("#menu-players li .genderChoice");
	let namesOfPlayers = [];
	for (let i = 0; i < allNameInput.length; i++) {
		let genderOfInput = (allGenderInput[i].firstElementChild.checked) ? "F" : "M";
		namesOfPlayers.push({"name" : allNameInput[i].innerText, "gender" : genderOfInput});
	}

	let gameMode;
	if (document.getElementById("radio-easy").checked) {
		gameMode = "easy";
	}
	else if (document.getElementById("radio-hard").checked) {
		gameMode = "hard";
	}

	if (isAllNameValid()) {
		loadGame(namesOfPlayers, gameMode);
	}
}

function loadGame(namesOfPlayers, gameMode) {    
	//Initialisation de la position des joueurs
	localStorage.removeItem("namesOfPlayers");
	localStorage.setItem("namesOfPlayers", JSON.stringify(namesOfPlayers));

	localStorage.removeItem("gameMode");
	localStorage.setItem("gameMode", gameMode);

    window.location='play.html';
}

function loadPlayers() {
	let names = localStorage.getItem("namesOfPlayers");
	names = JSON.parse(names);
	if (names != null) {
		for (let i = 0; i < names.length; i++) {
			let playerLi = addPlayer(names[i].name, names[i].gender);
		}
	}
}

loadPlayers();