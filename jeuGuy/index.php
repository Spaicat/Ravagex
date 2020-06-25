<!doctype html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<title>jeuGuy</title>
	<link rel="stylesheet" href="../style/mainStyle.css">
	<script defer src="../script/jeuGuy.js"></script>
</head>
<body>
	<div id="jeuGuyPage">
		<div id="jeuGuyMain">
			<div id="jeuGuyTitle">
				<span>jeuGuy</span>
				<!--<img src="images/RavagexTitle.png" id="imagejeuGuyTitle" alt="Titre jeuGuy" />-->
			</div>
			<ul id="jeuGuyMenu">
				<span>Entrez le nom des participants : </span>
				<li>
					<input class="nameField" type="text">
					<button class="btn-remove">-</button>
				</li>
			</ul>
			<span id="errorName"></span>
			<button onclick="addPlayer()">Ajouter un joueur</button>
			<button onclick="playjeuGuy()">Jouer</button>
			<button onclick="window.location='../index.php';">Quitter</button>
		</div>
	</div>
</body>
</html>