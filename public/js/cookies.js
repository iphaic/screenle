// Function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to set a cookie with an expiration in days
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

// Function to check the number of guesses and manage game limits
function checkGuessLimit() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses >= 10) {
        alert("Game Over! You have reached your guessing limit for today.");
        return false;
    } else {
        guesses++;
        setCookie('guesses', guesses, 1); // Reset the cookie to expire in 1 day
        return true;
    }
}

// Resets the guess count at midnight EST
function resetGuessesAtMidnightEST() {
    let now = new Date();
    let est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    est.setHours(24, 0, 0, 0); // Set time to next midnight EST
    let utcMidnightEst = est.getTime() + est.getTimezoneOffset() * 60000;
    let expires = new Date(utcMidnightEst);
    setCookie('guesses', 0, expires);
}
