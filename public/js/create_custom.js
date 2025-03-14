// custom_game.js
let isCustomGameCreationMode = false;

function setupCustomGameButton() {
    const customGameButton = document.getElementById('createCustomGameButton');
    customGameButton.addEventListener('click', function() {
        isCustomGameCreationMode = !isCustomGameCreationMode;

        if(isCustomGame)
        {
            redirectToBaseURL();
            return;
        }

        if (isCustomGameCreationMode) {
            prepareCustomGameUI();
        } else {
            redirectToBaseURL();
        }
    });
}

function removeQueryString(url) {
    // Split the URL at the '?' and return the first part
    return url.split('?')[0];
}

function redirectToBaseURL() {
    // Remove the query string from the current URL
    var baseUrl = removeQueryString(window.location.href);

    // Use the base URL for redirection or other purposes
    window.location.href = baseUrl;
}

function prepareCustomGameUI() {
    document.getElementById('victoryContainer').style.display = 'none';
    document.getElementById('howToPlayContainer').style.display = 'none';

    document.getElementById('gameMessage').textContent = "Select a movie for your friend to guess!";
    document.getElementById('guessButton').textContent = "CREATE/COPY LINK";
    document.getElementById('guessButton').onclick = createCustomGameLink;
    document.getElementById('guessInput').placeholder = "Enter movie title for custom game";

    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessButton').disabled = false;
}

function createCustomGameLink() {
    const movieTitle = document.getElementById('guessInput').value.trim();
    if (!movieTitle) {
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
    return btoa(title);
}

function generateCustomGameLink(encodedTitle) {
    const baseUrl = window.location.href.split('?')[0];
    return `${baseUrl}?customGame=${encodedTitle}`;
}

function displayCustomGameLink(link) {
    let linkContainer = document.getElementById('customGameContainer');

    // check if the container already exists, if not create it
    if (!linkContainer) {
        linkContainer = document.createElement('div');
        linkContainer.id = 'customGameContainer';
        document.body.appendChild(linkContainer);
    }

    // clear previous content and set new link
    linkContainer.innerHTML = `Your custom game link: <a href="${link}" target="_blank">${link}</a>`;
}

function clearData() 
{
    clearLocalStorageExceptLastResetTime();
    const cookiesToDelete = ['customGame_guesses'];
    document.cookie.split(';').forEach(cookie => {
        let [name, value] = cookie.split('=');
        name = name.trim();
        if (cookiesToDelete.includes(name)) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            console.log("Deleted guesses cookies for custom game");
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
                displayGuessHistory();
                document.getElementById('guessInput').disabled = false;
                document.getElementById('guessButton').disabled = false;
                updateGameMessage(`Custom Game Loaded. Good Luck!`);
                updateCreateCustomButton('Back');
                updateGuessCountDisplay();

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

function updateCreateCustomButton(message) {
    const createCustomGameButton = document.getElementById('createCustomGameButton');
    if (createCustomGameButton) {
        createCustomGameButton.textContent = message;
    } else {
        console.error("createCustomGameButton element not found!");
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
        selectedMovie = movie;
        document.getElementById('devSelectedMovie').textContent = `Custom Game for: ${movie['Movie Title']}`;
    } else {
        console.log("Movie not found for custom game.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupCustomGameButton();
});