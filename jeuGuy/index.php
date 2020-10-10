<!doctype html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<title>jeuGuy</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="../style/reset.css">
	<link rel="stylesheet" href="../style/jeuGuyStyle.css">
	<link rel="shortcut icon" type="image/png" href="../include/r_favicon.png"/>
	<script defer src="../script/jeuGuy_selectPlayer.js"></script>
</head>
<body>
	<main id="select-main">
		<div id="select-box">
			<div id="jeuGuy-title">
				<h1>jeuGuy</h1>
				<!--<img src="images/RavagexTitle.png" id="imagejeuGuyTitle" alt="Titre jeuGuy" />-->
			</div>
			<span id="text-desc">Entrez le nom des participants : </span>
			<div class="name-entry-container">
				<input class="name-entry" type="text">
				<button>Ajouter</button>
			</div>
			<ul id="menu-players">
			</ul>
			<span id="errorName"></span>
			<div id="select-mode-container">
				<div class="select-mode-box">
					<input id="radio-easy" type="radio" name="mode-selection" />
					<label for="radio-easy">Easy</label>
				</div>
				<div class="select-mode-box">
					<input id="radio-hard" type="radio" name="mode-selection" checked="checked" />
					<label for="radio-hard">Hard</label>
				</div>
			</div>
			<button onclick="playjeuGuy()">Jouer</button>
			<a href="#" class="quitbtn" onclick="window.location='../index.php';"></a>
		</div>
	</main>
</body>
</html>