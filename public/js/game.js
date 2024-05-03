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
            movies = data;
            console.log('Movies loaded:', movies);
            if (movies.length > 0) {
                selectMovieOfDay();
            } else {
                console.log('No movies available in the dataset');
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            document.getElementById('devSelectedMovie').textContent = 'Failed to load movies';
        });
}

function selectMovieOfDay() {
    let today = new Date(); // Get the current date and time
    let dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    if (movies.length > 0) {
        selectedMovie = movies[dayOfYear % movies.length];
        document.getElementById('devSelectedMovie').textContent = `Dev: ${selectedMovie['Movie Title'] || 'No title found'}`;
    } else {
        document.getElementById('devSelectedMovie').textContent = 'Dev: No movies loaded';
    }
    checkIfAlreadyWonToday();
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
    document.getElementById('guessCount').textContent = `Guesses: ${guesses}/10`;
}

window.onload = function() {
    loadMovies();
    updateGuessCountDisplay();
};

document.getElementById('guessButton').addEventListener('click', function() {
    const userInput = document.getElementById('guessInput').value.trim().toLowerCase();  // normalize input
    if (!checkGuessLimit()) return; // stop if guess limit reached
    
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === userInput);
    
    if (movie) {
        updateFeedback(movie);
        displayMovieDetails(movie);
        if (movie['Movie Title'].toLowerCase() === selectedMovie['Movie Title'].toLowerCase()) {
            document.getElementById('gameMessage').textContent = `You got it! ${movie['Movie Title']}.`;
            recordVictory();
        }
    } else {
        document.getElementById('gameMessage').textContent = "Invalid Movie Title!";
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
        document.getElementById('guessCount').textContent = `Guesses: ${guesses}/10`; // show max guesses reached
        return false;
    } else {
        guesses++;
        setCookie('guesses', guesses, 1); // reset the cookie to expire in 1 day
        document.getElementById('guessCount').textContent = `Guesses: ${guesses}/10`; // update the guess count displayed
        return true;
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
    suggestionsBox.innerHTML = ''; // clear previous suggestions
    suggestionsBox.style.display = 'none'; // invis initially

    if (input.length >= 2) {
        const filteredMovies = movies.filter(movie => movie['Movie Title'].toLowerCase().includes(input.toLowerCase()));
        console.log('Filtered movies:', filteredMovies);  // check what is filtered

        if (filteredMovies.length > 0) {
            filteredMovies.forEach(movie => {
                const div = document.createElement('div');
                div.textContent = movie['Movie Title'];
                div.onclick = () => {
                    document.getElementById('guessInput').value = movie['Movie Title'];
                    suggestionsBox.style.display = 'none'; // hide after selection
                };
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = 'block'; // show suggestions
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
    const yearDifference = Math.abs(selectedMovie['Year of Release'] - guess['Year of Release']);
    document.getElementById('yearFeedback').style.backgroundColor = yearDifference === 0 ? COLOR_CORRECT : yearDifference <= 5 ? COLOR_PARTIAL : COLOR_WRONG;

    // split genres and trim whitespace
    const selectedGenres = selectedMovie['Genre'].split(',').map(genre => genre.trim());
    const guessGenres = guess['Genre'].split(',').map(genre => genre.trim());

    // check if any genre matches
    const genreMatch = guessGenres.some(genre => selectedGenres.includes(genre));
    // check if all genres match in any order
    const allGenresMatch = guessGenres.length === selectedGenres.length && guessGenres.every(genre => selectedGenres.includes(genre));

    // update the genre feedback color based on matches
    document.getElementById('genreFeedback').style.backgroundColor = allGenresMatch ? COLOR_CORRECT : genreMatch ? COLOR_PARTIAL : COLOR_WRONG;

    document.getElementById('directorFeedback').style.backgroundColor = selectedMovie['Director'] === guess['Director'] ? COLOR_CORRECT : COLOR_WRONG;
    document.getElementById('certificateFeedback').style.backgroundColor = selectedMovie['Certificate'] === guess['Certificate'] ? COLOR_CORRECT : COLOR_WRONG;

    const durationDifference = Math.abs(selectedMovie['Duration'] - guess['Duration']);
    document.getElementById('durationFeedback').style.backgroundColor = durationDifference === 0 ? COLOR_CORRECT : durationDifference <= 15 ? COLOR_PARTIAL : COLOR_WRONG;
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
    updateVictoryCountDisplay();
};