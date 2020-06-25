const guyMenu = document.querySelector("#jeuGuyMenu");

//Event listener
guyMenu.addEventListener("click", removePlayer);
guyMenu.addEventListener("input", focusNameField);

/**
 * Ajoute un joueur dans la liste
 */
function addPlayer() {
	const newPlayerLi = document.createElement("li");

	//On ajoute l'input pour le nom
	const input = document.createElement("input");
	input.classList.add("nameField");
	input.setAttribute("type", "text")
	newPlayerLi.appendChild(input);

	//On ajoute le bouton pour supprimer
	const button = document.createElement("button");
	button.classList.add("btn-remove");
	button.innerText = "-";
	newPlayerLi.appendChild(button);

	guyMenu.appendChild(newPlayerLi);
}

/**
 * Enlève un joueur de la liste
 * @param {Event} e l'event listener
 */
function removePlayer(e) {
	const item = e.target;
	//On supprime l'item
	if (item.classList[0] == "btn-remove") {
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
	const allNameInput = document.querySelectorAll("#jeuGuyMenu li input");
	var nameValid = true;
	var nbName;
	for (nbName = 0; nbName < allNameInput.length; nbName++) {
		if (allNameInput[nbName].value == "") {
			nameValid = false;
			allNameInput[nbName].classList.add("errorName");
		}
	}
	
	if (!nameValid) {
		document.querySelector("#errorName").innerText = "Remplir tous les champs";
	}
	else if (nbName < 2) {
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
	const allNameInput = document.querySelectorAll("#jeuGuyMenu li input");
	var namesOfPlayers = [];
	for (let i = 0; i < allNameInput.length; i++) {
		namesOfPlayers.push(allNameInput[i].value);
	}

	if (isAllNameValid()) {
		console.log(namesOfPlayers);
		//window.location="play.php";
	}
}