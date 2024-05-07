// cookies.js
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


function checkGuessLimit() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses >= 10) {
        document.getElementById('gameMessage').textContent = "Game Over!";
        disableGuessing();
        return false;
    } else {
        guesses++;
        setCookie('guesses', guesses, 1); // reset the cookie to expire in 1 day
        return true;
    }
}

function resetGuessesAtMidnightEST() {
    let now = new Date();
    let est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    est.setHours(24, 0, 0, 0); // Set time to next midnight EST
    let utcMidnightEst = est.getTime() + est.getTimezoneOffset() * 60000;
    let expires = new Date(utcMidnightEst);
    setCookie('guesses', 0, expires);
}

// function to check victory and manage game state
function checkVictory() {
    let victories = parseInt(getCookie('victories')) || 0;
    document.getElementById('victoryCount').textContent = `Victories: ${victories}`;
}

// function to record a victory
function recordVictory() {
    let victories = parseInt(getCookie('victories')) || 0;
    victories++;
    setCookie('victories', victories, 365); // store victories for a longer period
    checkVictory(); // update the game state based on the new victory count
}

// disable further guessing
function disableGuessing() {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessButton').disabled = true;
    updateGameMessage("No more guesses allowed today.");
}

// enable guessing if conditions are met
function enableGuessing() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses < 10) {
        document.getElementById('guessInput').disabled = false;
        document.getElementById('guessButton').disabled = false;
        document.getElementById('gameMessage').textContent = "";
    } else {
        disableGuessing();
    }
}

// function to update messages in the gameInfo section
function updateGameMessage(message) {
    const gameMessage = document.getElementById('gameMessage');
    if (gameMessage) {
        gameMessage.textContent = message;
    } else {
        console.error("Game message element not found!");
    }
}

// update this in your checkGuessLimit or similar functions
function checkGuessLimit() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses >= 10) {
        updateGameMessage("Game Over! You have reached your guessing limit for today.");
        disableGuessing();
        return false;
    } else {
        guesses++;
        setCookie('guesses', guesses, 1);
        updateGameMessage("Guess submitted. You have " + (10 - guesses) + " guesses left today.");
        return true;
    }
}