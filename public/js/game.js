// game.js
let movies = [];
let selectedMovie;
let today = new Date();
let dayOfYearToday = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

const soundCorrect = new Audio('sounds/correct.mp3');
const soundPartial = new Audio('sounds/partial.mp3');
const soundWrong = new Audio('sounds/wrong.mp3');
const soundVictory = new Audio('sounds/victory.mp3');

function playSound(sound) {
    if (getCookie('soundEnabled') === 'true') {
        sound.play();
    }
}

const COLOR_CORRECT = 'rgba(0, 173, 43, 1)';
const COLOR_PARTIAL = 'rgba(243, 156, 18, 1)';
const COLOR_WRONG = 'rgba(63, 71, 82, 1)';

function loadMovies() {
    fetch('/api/movies')
        .then(response => response.json())
        .then(data => {
            movies = data.movies;
            selectedMovie = data.selectedMovie;

            if (selectedMovie) {
                document.getElementById('devSelectedMovie').textContent = `Dev: ${selectedMovie['Movie Title']}`;
            } else {
                document.getElementById('devSelectedMovie').textContent = 'No movie selected';
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            document.getElementById('devSelectedMovie').textContent = 'Failed to load movies';
        });
}

function checkIfAlreadyWonToday() {
    let lastVictoryDay = parseInt(getCookie('lastVictoryDay')) || 0;
    console.log('Last Victory Day:', lastVictoryDay, 'Day of Year Today:', dayOfYearToday);
    if (lastVictoryDay === dayOfYearToday) {
        console.log('User has already won today.');
        gameOver();
        disableGuessing();
        updateGameMessage(`You've already won today! Come back tomorrow and play again!`);
    } else {
        console.log('No win recorded today. Last win was on day:', lastVictoryDay);
    }
}

function updateGuessCountDisplay() {
    let guesses = parseInt(getCookie('guesses')) || 1;
    document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`;
}

function storeGuessHistory(guess) {
    let guessHistory = JSON.parse(localStorage.getItem('guessHistory') || '[]');
    guessHistory.unshift({
        title: guess['Movie Title'],
        feedback: {
            year: document.getElementById('yearFeedback').textContent,
            genre: document.getElementById('genreFeedback').innerHTML,  // Save HTML content
            director: document.getElementById('directorFeedback').textContent,
            certificate: document.getElementById('certificateFeedback').textContent,
            duration: document.getElementById('durationFeedback').textContent,
        },
        colors: {
            year: document.getElementById('yearFeedback').style.backgroundColor,
            genre: document.getElementById('genreFeedback').style.backgroundColor,
            director: document.getElementById('directorFeedback').style.backgroundColor,
            certificate: document.getElementById('certificateFeedback').style.backgroundColor,
            duration: document.getElementById('durationFeedback').style.backgroundColor,
        }
    });

    localStorage.setItem('guessHistory', JSON.stringify(guessHistory));
    console.log('Stored guess history:', guessHistory);
}

function displayGuessHistory() {
    const historyContainer = document.getElementById('guessHistoryContainer');
    let guessHistory = JSON.parse(localStorage.getItem('guessHistory') || '[]');

    // First, fade out the existing content
    historyContainer.classList.add('fade-out');

    // Wait for the fade-out to complete
    setTimeout(() => {
        // Clear the container after the fade-out
        historyContainer.innerHTML = '';
        historyContainer.classList.remove('fade-out'); // Remove fade-out to reset the style

        // Now, add new content with a fade-in animation
        guessHistory.forEach(guess => {
            const guessDiv = document.createElement('div');
            guessDiv.className = 'guess-history-entry'; // Assign class for styling and animation
            guessDiv.innerHTML = `
                <h4>${guess.title}</h4>
                <p style="background-color:${guess.colors.year}">${guess.feedback.year}</p>
                <p style="background-color:${guess.colors.genre}">${guess.feedback.genre}</p>
                <p style="background-color:${guess.colors.director}">${guess.feedback.director}</p>
                <p style="background-color:${guess.colors.certificate}">${guess.feedback.certificate}</p>
                <p style="background-color:${guess.colors.duration}">${guess.feedback.duration}</p>
            `;
            historyContainer.appendChild(guessDiv);
        });
    }, 250); // This delay should match the fade-out transition time
}

document.getElementById('guessButton').addEventListener('click', function() {
    document.getElementById('gameMessage').textContent = "";  // Clear previous messages
    const userInput = document.getElementById('guessInput').value.trim().toLowerCase();  // Normalize input
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === userInput);

    if (movie) {
        if (!checkGuessLimit()) return;  // Check if the guess limit has been reached before processing the guess

        displayMovieDetails(movie);
        updateFeedback(movie);
        storeGuessHistory(movie);
        displayGuessHistory();

        if (movie['Movie Title'].toLowerCase() === selectedMovie['Movie Title'].toLowerCase()) {
            document.getElementById('gameMessage').textContent = `You got it! ${movie['Movie Title']}.`;
            recordVictory();
            playSound(soundVictory);
        } else {
            let guesses = parseInt(getCookie('guesses')) || 0;
            if (guesses > 10) {  // Check if this guess was the 10th
                updateGameMessage("Game Over! Try again tomorrow!");
                disableGuessing();
            }
        }
    } else {
        document.getElementById('gameMessage').textContent = "Invalid Movie Title!";
    }
    document.getElementById('guessInput').value = '';  // Clear the input field after processing the guess
    hideSuggestions();  // Hide suggestions after a guess is made
});

function hideSuggestions() {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = '';  // Clear suggestions content
    suggestionsBox.style.display = 'none';  // Hide suggestions box
}

function checkGuess(guess) {
    const movie = movies.find(movie => movie.title.toLowerCase() === guess.toLowerCase());
    if (movie) {
        updateFeedback(movie);
    } else {
        document.getElementById('gameMessage').textContent = "Invalid Movie Title!";
    }
}

function checkGuessLimit() {
    let guesses = parseInt(getCookie('guesses')) || 1;
    if (guesses > 10) {  // If 10 guesses have already been made, prevent further guessing.
        updateGameMessage("Game Over! You have reached your guessing limit for today.");
        disableGuessing();
        return false;
    }
    guesses++;  // Increment the guess count since the guess is about to be processed.
    setCookie('guesses', guesses, 1); // Save the updated count in a cookie.
    document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`; // Update the display.
    return true;
}

function checkGuessLimitOnLoad() {
    let guesses = parseInt(getCookie('guesses')) || 1;
    if (guesses > 10) {
        updateGameMessage('Game Over! You have reached your guessing limit for today.\nCome back tomorrow and play again!');
        disableGuessing();
        document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`; // show max guesses reached
        return false;
    }
}

function disableGuessing() {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessButton').disabled = true;
    document.getElementById('gameMessage').textContent += "Come back tomorrow and play again!";
}

function recordVictory() {
    confetti({
        particleCount: 200,
        startVelocity: 50,
        spread: 270,
        shapes: ['square','square','star']
      });
    incrementVictories();
    setCookie('lastVictoryDay', dayOfYearToday, 1);
    updateVictoryCountDisplay();
    disableGuessing();
    updateGameMessage(`Nice! You've correctly guessed the movie: ${selectedMovie['Movie Title']}.\nCome back tomorrow and play again!`);
}

// function to check and display victories
function checkVictory() {
    let victories = parseInt(getCookie('victories')) || 0;
    document.getElementById('victoryCount').textContent = `Victories: ${victories}`;
    if (victories > 0) {
        disableGuessing();
    }
}

// check input
document.getElementById('guessInput').addEventListener('input', function() {
    const input = this.value;
    console.log('Input received:', input);  // log inputs
    displaySuggestions(input);
});

function displaySuggestions(input) {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions
    suggestionsBox.style.display = 'none'; // Initially hide the suggestions box

    if (input.length >= 2) {
        const filteredMovies = movies.filter(movie => movie['Movie Title'].toLowerCase().includes(input.toLowerCase()));
        console.log('Filtered movies:', filteredMovies);  // Check what is filtered

        if (filteredMovies.length > 0) {
            // Only take up to 5 filtered movies to display as suggestions
            filteredMovies.slice(0, 5).forEach(movie => {
                const div = document.createElement('div');
                div.textContent = movie['Movie Title'];
                div.onclick = () => {
                    document.getElementById('guessInput').value = movie['Movie Title'];
                    suggestionsBox.style.display = 'none'; // Hide after selection
                };
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = 'block'; // Show suggestions
        }
    }
}

function displayMovieDetails(movie) {
    document.getElementById('yearFeedback').textContent = `Year: ${movie['Year of Release']}`;
    document.getElementById('genreFeedback').textContent = `Genre: ${movie['Genre']}`;
    document.getElementById('directorFeedback').textContent = `Director: ${movie['Director']}`;
    document.getElementById('certificateFeedback').textContent = `Age Rating: ${movie['Certificate']}`;
    document.getElementById('durationFeedback').textContent = `Duration: ${movie['Duration']} min`;
}

// i hate this function
function updateFeedback(guess) {
    const yearDifference = selectedMovie['Year of Release'] - guess['Year of Release'];
    const durationDifference = selectedMovie['Duration'] - guess['Duration'];

    // year
    document.getElementById('yearFeedback').style.backgroundColor = yearDifference === 0 ? COLOR_CORRECT : Math.abs(yearDifference) <= 5 ? COLOR_PARTIAL : COLOR_WRONG;
    let year_status = yearDifference === 0 ? 2 : Math.abs(yearDifference) <= 5 ? 1 : 0;
    document.getElementById('yearFeedback').textContent = `Year: ${guess['Year of Release']} ${yearDifference === 0 ? '' : (yearDifference > 0 ? '↑' : '↓')}`;

    // duration
    document.getElementById('durationFeedback').style.backgroundColor = durationDifference === 0 ? COLOR_CORRECT : Math.abs(durationDifference) <= 15 ? COLOR_PARTIAL : COLOR_WRONG;
    let duration_status = durationDifference === 0 ? 2 : Math.abs(durationDifference) <= 15 ? 1 : 0;
    document.getElementById('durationFeedback').textContent = `Duration: ${guess['Duration']} min ${durationDifference === 0 ? '' : (durationDifference > 0 ? '↑' : '↓')}`;

    // genres
    const selectedGenres = selectedMovie['Genre'].split(',').map(genre => genre.trim().toLowerCase());
    const guessGenres = guess['Genre'].split(',').map(genre => genre.trim().toLowerCase());
    let genreFeedbackText = 'Genre: ';
    let correctGenresCount = 0; // track number of correct genres

    guessGenres.forEach((genre, index) => {
        const originalGenreText = guess['Genre'].split(',')[index].trim(); // get the original text to maintain capitalization
        if (selectedGenres.includes(genre)) {
            genreFeedbackText += `<span style="background-color:${COLOR_CORRECT};">${originalGenreText}</span>`;
            correctGenresCount++;
        } else {
            genreFeedbackText += originalGenreText;
        }
        if (index < guessGenres.length - 1) genreFeedbackText += ', ';
    });

    document.getElementById('genreFeedback').innerHTML = genreFeedbackText;
    // adjust the background color based on the number of correct genres
    if (correctGenresCount === guessGenres.length) {
        document.getElementById('genreFeedback').style.backgroundColor = COLOR_CORRECT;  // all genres are correct
    } else if (correctGenresCount > 0) {
        document.getElementById('genreFeedback').style.backgroundColor = COLOR_PARTIAL;  // some but not all genres are correct
    } else {
        document.getElementById('genreFeedback').style.backgroundColor = COLOR_WRONG;  // no genres are correct
    }

    document.getElementById('directorFeedback').style.backgroundColor = selectedMovie['Director'] === guess['Director'] ? COLOR_CORRECT : COLOR_WRONG;
    let director_status = selectedMovie['Director'] === guess['Director'] ? 1 : 0;
    document.getElementById('certificateFeedback').style.backgroundColor = selectedMovie['Certificate'] === guess['Certificate'] ? COLOR_CORRECT : COLOR_WRONG;
    let certificate_status = selectedMovie['Certificate'] === guess['Certificate'] ? 1 : 0;

    if (year_status == 2 || duration_status == 2 || correctGenresCount >= 2 || director_status == 1 || certificate_status == 1)
    {
        playSound(soundCorrect);
        console.log("Sound correct");
    }
    else if (year_status == 1 || duration_status == 1 || correctGenresCount <= 2)
    {
        playSound(soundPartial);
        console.log("Sound partial");
    }
    else
    {
        playSound(soundWrong);
        console.log("Sound wrong");
    }

}

function gameOver() {
    if (selectedMovie && selectedMovie['Movie Title']) {
        document.getElementById('gameMessage').textContent = "Game Over! You've already won today. The movie was: " + selectedMovie['Movie Title'];
    } else {
        document.getElementById('gameMessage').textContent = "Game Over! You've already won today! Come back tomorrow and play again!";
    }
    disableGuessing();
}

function updateVictoryCountDisplay() {
    let victories = parseInt(getCookie('victories')) || 0;
    document.getElementById('victoryCount').textContent = `Victories: ${victories}`;
}

function checkAndClearData() 
{
    localStorage.clear();
    const cookiesToDelete = ['guesses', 'lastVictoryDay'];
    document.cookie.split(';').forEach(cookie => {
        let [name, value] = cookie.split('=');
        name = name.trim();
        if (cookiesToDelete.includes(name)) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    });
}

window.onload = function() {
    console.log("Window loaded successfully.");
    fetch('/api/last-reset-time')
        .then(response => response.json())
        .then(data => {
            const serverResetTime = new Date(data.lastReset);
            const lastClientResetTime = new Date(localStorage.getItem('lastResetTime'));

            console.log("Server reset time:", serverResetTime);
            console.log("Last client reset time:", lastClientResetTime);

            if (!lastClientResetTime || serverResetTime > lastClientResetTime) {
                console.log("Clearing data due to reset.");
                window.location.reload();
                checkAndClearData();
                localStorage.setItem('lastResetTime', serverResetTime.toISOString());
            }

            loadMovies();
            updateGuessCountDisplay();
            displayGuessHistory();
            checkGuessLimitOnLoad();
            updateVictoryCountDisplay();
            checkIfAlreadyWonToday();
        })
        .catch(error => {
            console.error('Error fetching last reset time:', error);
        });
};
