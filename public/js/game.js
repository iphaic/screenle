// game.js
let movies = [];
let selectedMovie;
let today = new Date();
let dayOfYearToday = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

const COLOR_CORRECT = 'rgba(0, 173, 43, 1)';
const COLOR_PARTIAL = 'rgba(194, 155, 51, 1)';
const COLOR_WRONG = 'rgba(63, 71, 82, 1)';

function loadMovies() {
    fetch('/api/movies')
        .then(response => response.json())
        .then(data => {
            movies = data.movies;
            selectedMovie = data.selectedMovie;
            console.log('User Movies loaded:', movies);
            console.log('User Selected movie:', selectedMovie);

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
    if (lastVictoryDay === dayOfYearToday) {
        gameOver();
        disableGuessing();
        updateGameMessage(`You've already won today! Come back tomorrow and play again!`);
    }
}

function updateGuessCountDisplay() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`;
}

function storeGuessHistory(guess) {
    let guessHistory = JSON.parse(localStorage.getItem('guessHistory') || '[]');
    guessHistory.unshift({
        title: guess['Movie Title'],
        feedback: {
            year: document.getElementById('yearFeedback').textContent,
            genre: document.getElementById('genreFeedback').textContent,
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
    let guessHistory = JSON.parse(localStorage.getItem('guessHistory') || '[]');
    const historyContainer = document.getElementById('guessHistoryContainer');
    historyContainer.innerHTML = '';

    guessHistory.forEach(guess => {
        const guessDiv = document.createElement('div');
        guessDiv.innerHTML = `<h4>${guess.title}</h4>
                              <p style="background-color:${guess.colors.year}">${guess.feedback.year}</p>
                              <p style="background-color:${guess.colors.genre}">${guess.feedback.genre}</p>
                              <p style="background-color:${guess.colors.director}">${guess.feedback.director}</p>
                              <p style="background-color:${guess.colors.certificate}">${guess.feedback.certificate}</p>
                              <p style="background-color:${guess.colors.duration}">${guess.feedback.duration}</p>`;
        historyContainer.append(guessDiv);
    });
}

document.getElementById('guessButton').addEventListener('click', function() {
    document.getElementById('gameMessage').textContent = "";
    const userInput = document.getElementById('guessInput').value.trim().toLowerCase();
    
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === userInput);
    if (movie) {
        if (!checkGuessLimit()) return;  // Check guess limit only if the movie title is valid
        
        displayMovieDetails(movie);
        updateFeedback(movie);
        storeGuessHistory(movie);
        displayGuessHistory();
        if (movie['Movie Title'].toLowerCase() === selectedMovie['Movie Title'].toLowerCase()) {
            document.getElementById('gameMessage').textContent = `You got it! ${movie['Movie Title']}.`;
            recordVictory();
        }
    } else {
        document.getElementById('gameMessage').textContent = "Invalid Movie Title!";  // Invalid guess does not count
    }
});

function checkGuess(guess) {
    const movie = movies.find(movie => movie.title.toLowerCase() === guess.toLowerCase());
    if (movie) {
        updateFeedback(movie);
    } else {
        document.getElementById('gameMessage').textContent = "Invalid Movie Title!";
    }
}

function checkGuessLimit() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses > 9) {
        updateGameMessage("Game Over! You have reached your guessing limit for today.");
        disableGuessing();
        document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`; // show max guesses reached
        return false;
    } else {
        guesses++;
        setCookie('guesses', guesses, 1); // reset the cookie to expire in 1 day
        document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`; // update the guess count displayed
        return true;
    }
}

function checkGuessLimitOnLoad() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses >= 10) {
        updateGameMessage("Game Over! You have reached your guessing limit for today.");
        disableGuessing();
        document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`; // show max guesses reached
        return false;
    }
}

function disableGuessing() {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessButton').disabled = true;
    document.getElementById('gameMessage').textContent += " Come back tomorrow and play again!";
}

function recordVictory() {
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

function updateFeedback(guess) {
    const yearDifference = selectedMovie['Year of Release'] - guess['Year of Release'];
    const durationDifference = selectedMovie['Duration'] - guess['Duration'];

    // year
    document.getElementById('yearFeedback').style.backgroundColor = yearDifference === 0 ? COLOR_CORRECT : Math.abs(yearDifference) <= 5 ? COLOR_PARTIAL : COLOR_WRONG;
    document.getElementById('yearFeedback').textContent = `Year: ${guess['Year of Release']} ${yearDifference === 0 ? '' : (yearDifference > 0 ? '↑' : '↓')}`;

    // duration
    document.getElementById('durationFeedback').style.backgroundColor = durationDifference === 0 ? COLOR_CORRECT : Math.abs(durationDifference) <= 15 ? COLOR_PARTIAL : COLOR_WRONG;
    document.getElementById('durationFeedback').textContent = `Duration: ${guess['Duration']} min ${durationDifference === 0 ? '' : (durationDifference > 0 ? '↑' : '↓')}`;

    const selectedGenres = selectedMovie['Genre'].split(',').map(genre => genre.trim());
    const guessGenres = guess['Genre'].split(',').map(genre => genre.trim());
    const genreMatch = guessGenres.some(genre => selectedGenres.includes(genre));
    const allGenresMatch = guessGenres.length === selectedGenres.length && guessGenres.every(genre => selectedGenres.includes(genre));
    document.getElementById('genreFeedback').style.backgroundColor = allGenresMatch ? COLOR_CORRECT : genreMatch ? COLOR_PARTIAL : COLOR_WRONG;

    document.getElementById('directorFeedback').style.backgroundColor = selectedMovie['Director'] === guess['Director'] ? COLOR_CORRECT : COLOR_WRONG;
    document.getElementById('certificateFeedback').style.backgroundColor = selectedMovie['Certificate'] === guess['Certificate'] ? COLOR_CORRECT : COLOR_WRONG;
}

function gameOver() {
    document.getElementById('gameMessage').textContent = "Game Over! You've already won today. The movie was: " + selectedMovie['Movie Title'];
    disableGuessing();
}

function updateVictoryCountDisplay() {
    let victories = parseInt(getCookie('victories')) || 0;
    document.getElementById('victoryCount').textContent = `Victories: ${victories}`;
}

window.onload = function() {
    loadMovies();
    updateGuessCountDisplay();
    displayGuessHistory();
    checkGuessLimitOnLoad();
    updateVictoryCountDisplay();
    checkIfAlreadyWonToday();
};