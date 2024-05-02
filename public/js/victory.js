// Function to get a cookie value by name
function getCookie(name) {
    let cookieArray = document.cookie.split(';');
    for (let cookie of cookieArray) {
        let [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) return decodeURIComponent(cookieValue);
    }
    return null;
}

// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

// Update the victories in the UI
function updateVictoriesDisplay() {
    let victories = parseInt(getCookie('victories')) || 0;
    document.getElementById('victoryCount').textContent = `Victories: ${victories}`;
}

// Increment the victory count
function incrementVictories() {
    let victories = parseInt(getCookie('victories')) || 0;
    victories++;
    setCookie('victories', victories, 365 * 10); // Store for a long time
    updateVictoriesDisplay();
}

// Load victories on page load and update the display
function loadVictories() {
    updateVictoriesDisplay();
}

// Call loadVictories when the window loads
window.onload = loadVictories;