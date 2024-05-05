// custom_game.js
let isCustomGameCreationMode = false;

function setupCustomGameButton() {
    const customGameButton = document.getElementById('createCustomGameButton');
    customGameButton.addEventListener('click', function() {
        isCustomGameCreationMode = !isCustomGameCreationMode;  // Toggle the mode
        if (isCustomGameCreationMode) {
            prepareCustomGameUI();
        } else {
            window.location.reload();
        }
    });
}

function prepareCustomGameUI() {
    // Hide unnecessary UI components
    document.getElementById('victoryContainer').style.display = 'none';
    document.getElementById('howToPlayContainer').style.display = 'none';

    // Change UI elements for custom game creation
    document.getElementById('gameMessage').textContent = "Select a movie for your friend to guess!";
    document.getElementById('guessButton').textContent = "Create Link";
    document.getElementById('guessButton').onclick = createCustomGameLink; // Assign new function to the guess button
    document.getElementById('guessInput').placeholder = "Enter movie title for custom game";

    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessButton').disabled = false;
}

function createCustomGameLink() {
    const movieTitle = document.getElementById('guessInput').value.trim();
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    const movie = movies.find(m => m['Movie Title'].toLowerCase() === movieTitle.toLowerCase());
    if (!movie) {
        document.getElementById('gameMessage').textContent = "Movie not found, try again.";
        return;
    }

    const encodedTitle = encodeMovieTitle(movie['Movie Title']);
    const customLink = generateCustomGameLink(encodedTitle);
    displayCustomGameLink(customLink);
}

function encodeMovieTitle(title) {
    return btoa(title); // Base64 encoding
}

function generateCustomGameLink(encodedTitle) {
    const baseUrl = window.location.href.split('?')[0];
    return `${baseUrl}?customGame=${encodedTitle}`;
}

function displayCustomGameLink(link) {
    const linkDisplay = document.createElement('div');
    linkDisplay.innerHTML = `Your custom game link: <a href="${link}" target="_blank">${link}</a>`;
    document.body.appendChild(linkDisplay);
}

function clearData() 
{
    clearLocalStorageExceptLastResetTime();
    const cookiesToDelete = ['guesses'];
    document.cookie.split(';').forEach(cookie => {
        let [name, value] = cookie.split('=');
        name = name.trim();
        if (cookiesToDelete.includes(name)) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    });
}

function checkForCustomGame() {
    console.log("Checking for custom game...");
    const urlParams = new URLSearchParams(window.location.search);
    const customGame = urlParams.get('customGame');

    if (customGame) {
        console.log("Custom game parameter found:", customGame);
        const decodedMovieTitle = decodeMovieTitle(customGame);

        if (decodedMovieTitle) {
            const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === decodedMovieTitle.toLowerCase());
            if (movie) {
                selectedMovie = movie;
                
                isCustomGame = true;
                clearData();
                document.getElementById('guessInput').disabled = false;
                document.getElementById('guessButton').disabled = false;
                updateGameMessage(``);

            } else {
                console.log("Movie not found for custom game:", decodedMovieTitle);
            }
        } else {
            console.log("Invalid or corrupted movie title in URL.");
        }
    } else {
        console.log("No custom game parameter found.");
    }
}

function decodeMovieTitle(encodedTitle) {
    try {
        return atob(encodedTitle);
    } catch (e) {
        console.error("Error decoding movie title:", e);
        return null;
    }
}

function setupGameWithCustomMovie(title) {
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === title.toLowerCase());
    if (movie) {
        selectedMovie = movie; // Set the custom game movie
        document.getElementById('devSelectedMovie').textContent = `Custom Game for: ${movie['Movie Title']}`;
    } else {
        console.log("Movie not found for custom game.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupCustomGameButton();
    checkForCustomGame();
});