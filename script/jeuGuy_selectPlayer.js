const guyMenu = document.querySelector("#menu-players");
const nameEntryButton = document.querySelector(".name-entry-container button");

//Event listener
guyMenu.addEventListener("click", removePlayer);
guyMenu.addEventListener("input", focusNameField);
nameEntryButton.addEventListener("click", addPlayerEvent);

function addPlayerEvent(e) {
	item = e.target;
	if (item.parentElement.classList[0] == "name-entry-container") {
		const nameEntry = document.querySelector(".name-entry");
		addPlayer(nameEntry.value);
		nameEntry.value = "";
	}
}
/**
 * Ajoute un joueur dans la liste
 */
function addPlayer(name) {
	const newPlayerLi = document.createElement("li");

	//On ajoute l'input pour le nom
	const input = document.createElement("span");
	input.innerText = name;
	input.classList.add("nameField");
	newPlayerLi.appendChild(input);

	//On ajoute le bouton pour supprimer
	const button = document.createElement("button");
	button.classList.add("btn-remove");
	button.innerText = "X";
	newPlayerLi.appendChild(button);

	guyMenu.appendChild(newPlayerLi);

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
	let namesOfPlayers = [];
	for (let i = 0; i < allNameInput.length; i++) {
		namesOfPlayers.push(allNameInput[i].innerText);
	}

	if (isAllNameValid()) {
		loadGame(namesOfPlayers);
	}
}

function loadGame(namesOfPlayers) {    
	//Initialisation de la position des joueurs
	localStorage.removeItem("namesOfPlayers");
	localStorage.setItem("namesOfPlayers", JSON.stringify(namesOfPlayers));
    window.location='play.php';
}

function loadPlayers() {
	let names = localStorage.getItem("namesOfPlayers");
	names = JSON.parse(names);
	if (names != null) {
		for (let i = 0; i < names.length; i++) {
			let playerLi = addPlayer(names[i]);
		}
	}
}

loadPlayers();