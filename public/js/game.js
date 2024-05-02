let movies = [];
let selectedMovie;

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
                selectRandomMovie();
            } else {
                console.log('No movies available in the dataset');
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            document.getElementById('devSelectedMovie').textContent = 'Failed to load movies';
        });
}

function selectRandomMovie() {
    if (movies.length > 0) {
        selectedMovie = movies[Math.floor(Math.random() * movies.length)];
        console.log('Selected movie:', selectedMovie);
        document.getElementById('devSelectedMovie').textContent = `Dev: ${selectedMovie['Movie Title'] || 'No title found'}`;
    } else {
        console.log('No movies to select');
        document.getElementById('devSelectedMovie').textContent = 'Dev: No movies loaded';
    }
}

function updateGuessCountDisplay() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    document.getElementById('guessCount').textContent = `Guesses: ${guesses}/10`;
}

window.onload = function() {
    loadMovies();  // Existing function to load movies
    updateGuessCountDisplay();  // Update the guess count display
};

document.getElementById('guessButton').addEventListener('click', function() {
    const userInput = document.getElementById('guessInput').value;
    if (!checkGuessLimit()) return; // Stop if guess limit reached
    
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === userInput.toLowerCase());
    
    if (movie) {
        updateFeedback(movie);
        displayMovieDetails(movie);
    } else {
        alert('Please select a valid movie from the suggestions.');
    }
});

function checkGuess(guess) {
    const movie = movies.find(movie => movie.title.toLowerCase() === guess.toLowerCase());
    if (movie) {
        updateFeedback(movie);
    } else {
        alert('Please select a valid movie from the suggestions.');
    }
}

function checkGuessLimit() {
    let guesses = parseInt(getCookie('guesses')) || 0;
    if (guesses >= 10) {
        alert("Game Over! You have reached your guessing limit for today.");
        document.getElementById('guessCount').textContent = `Guesses: 10/10`;
        return false;
    } else {
        guesses++;
        console.log("Guesses updated to:", guesses);
        setCookie('guesses', guesses, 1);  // Reset the cookie to expire in 1 day
        document.getElementById('guessCount').textContent = `Guesses: ${guesses}/10`;
        return true;
    }
}

document.getElementById('guessInput').addEventListener('input', function() {
    const input = this.value;
    console.log('Input received:', input);  // Debugging to see if input is being captured
    displaySuggestions(input);
});

function displaySuggestions(input) {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = ''; // Clear previous suggestions
    suggestionsBox.style.display = 'none'; // Hide initially

    if (input.length >= 3) {
        const filteredMovies = movies.filter(movie => movie['Movie Title'].toLowerCase().includes(input.toLowerCase()));
        console.log('Filtered movies:', filteredMovies);  // Check what's being filtered

        if (filteredMovies.length > 0) {
            filteredMovies.forEach(movie => {
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
    const yearDifference = Math.abs(selectedMovie['Year of Release'] - guess['Year of Release']);
    document.getElementById('yearFeedback').style.backgroundColor = yearDifference === 0 ? COLOR_CORRECT : yearDifference <= 5 ? COLOR_PARTIAL : COLOR_WRONG;

    const selectedGenres = selectedMovie['Genre'].split(', ');
    const guessGenres = guess['Genre'].split(', ');
    const genreMatch = guessGenres.some(genre => selectedGenres.includes(genre));
    const allGenresMatch = selectedGenres.length === guessGenres.length && genreMatch;
    document.getElementById('genreFeedback').style.backgroundColor = allGenresMatch ? COLOR_CORRECT : genreMatch ? COLOR_PARTIAL : COLOR_WRONG;

    document.getElementById('directorFeedback').style.backgroundColor = selectedMovie['Director'] === guess['Director'] ? COLOR_CORRECT : COLOR_WRONG;
    document.getElementById('certificateFeedback').style.backgroundColor = selectedMovie['Certificate'] === guess['Certificate'] ? COLOR_CORRECT : COLOR_WRONG;

    const durationDifference = Math.abs(selectedMovie['Duration'] - guess['Duration']);
    document.getElementById('durationFeedback').style.backgroundColor = durationDifference === 0 ? COLOR_CORRECT : durationDifference <= 15 ? COLOR_PARTIAL : COLOR_WRONG;
}

function evaluateYear(year) {
    const diff = Math.abs(selectedMovie.year - year);
    return diff === 0 ? 'green' : diff <= 5 ? 'yellow' : 'gray';
}

function evaluateGenre(genre) {
    const selectedGenres = selectedMovie['Genre'].split(', ');
    const inputGenres = genre.split(', ');
    const match = inputGenres.some(genre => selectedGenres.includes(genre));
    const allMatch = inputGenres.every(genre => selectedGenres.includes(genre)) && selectedGenres.length === inputGenres.length;
    return allMatch ? 'green' : match ? 'yellow' : 'gray';
}

function evaluateDuration(duration) {
    const diff = Math.abs(selectedMovie.duration - duration);
    return diff === 0 ? 'green' : diff <= 15 ? 'yellow' : 'gray';
}

function gameOver() {
    alert("Game Over! The correct movie was: " + selectedMovie['Movie Title']);
}

document.addEventListener('DOMContentLoaded', function() {
    loadMovies();
    updateGuessCountDisplay();
});

window.addEventListener('load', function() {
    loadMovies();
    updateGuessCountDisplay();
});
