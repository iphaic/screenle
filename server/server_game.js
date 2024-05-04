// server_game.js
const seedrandom = require('seedrandom');

let movies = [];
let selectedMovie;

function getMovies() {
    return movies;
}

function setMovies(data) {
    movies = data;
    console.log('Movies array set in server_game:', movies.length);
    if (movies.length > 0) {
        selectMovieOfDay();  // Ensure a movie is selected right after setting movies
    }
}

function selectMovieOfDay() {
    let today = new Date();
    // Add 3 hours to convert from PST to EST
    today.setHours(today.getHours() + 3);
    // Create a seed string from the current date
    let seed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    if (movies.length > 0) {
        // Generate a pseudo-random number from the seed
        let rng = seedrandom(seed);
        // Use the pseudo-random number modulo the number of movies to select a movie
        const index = Math.floor(rng() * movies.length);
        selectedMovie = movies[index];
        console.log(`Movie of the day selected with seed '${seed}': \x1b[36m${selectedMovie['Movie Title'] || 'No title found'}\x1b[0m - ${today.toLocaleString()}`);
    } else {
        console.log('No movies to select');
    }
}

function getSelectedMovie() {
    return selectedMovie;
}

module.exports = { getMovies, selectMovieOfDay, setMovies, getSelectedMovie };
