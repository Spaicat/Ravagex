function getXMLHttpRequest() {
    var xhr = null;
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest(); 
        }
    } else {
        alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
        return null;
    }
    return xhr;
}

function ajaxGet(callback) {
    //On crée l'objet XHR
    var xhr = getXMLHttpRequest();
    //On l'ouvre = type, url/file, async
    xhr.open("GET", "../simonGame/tiles.json", true);

    xhr.onload = function() {
        //HTTP status : 200=OK, 403=Forbidden, 404=Not Found
        if (xhr.status == 200) {
            var fileJSON = JSON.parse(xhr.responseText);
            callback(fileJSON);
        }
    }

    //Envoie la requête
    xhr.send();
}



function 

/**
 * Lance le jeu, initialise toutes les ressources
 */
function startGame() {
    let namesOfPlayers = JSON.parse(localStorage.getItem("namesOfPlayers"));
}

startGame();