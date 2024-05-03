// function to get a cookie value by name
function getCookie(name) {
    let cookieArray = document.cookie.split(';');
    for (let cookie of cookieArray) {
        let [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) return decodeURIComponent(cookieValue);
    }
    return null;
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

function updateVictoriesDisplay() {
    let victories = parseInt(getCookie('victories')) || 0;
    document.getElementById('victoryCount').textContent = `Victories: ${victories}`;
}

function incrementVictories() {
    let victories = parseInt(getCookie('victories')) || 0;
    victories++;
    setCookie('victories', victories, 365 * 50);
    updateVictoriesDisplay();
}

function loadVictories() {
    updateVictoriesDisplay();
}

window.onload = loadVictories;