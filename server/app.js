const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const app = express();
const serverGame = require('./server_game.js');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());

// Load movie data at startup and prepare for API and cron
let movieData = [];  // This will store your movie data

function loadMovies() {
    fs.createReadStream(path.join(__dirname, '..', 'data', 'imdb_top_films.csv'))
        .pipe(csv())
        .on('data', (data) => movieData.push(data))
        .on('end', () => {
            console.log('Movies loaded:', movieData.length);
            serverGame.setMovies(movieData);  // Pass the loaded movies to server_game
        });
}

loadMovies();

// Read movie data
app.get('/api/movies', (req, res) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, '..', 'data', 'imdb_top_films.csv'))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
            movies = results;
            serverGame.selectMovieOfDay();
        });
});

// Cron job to reset game data and select new movie at midnight EST
cron.schedule('0 0 * * *', () => {
    console.log('Running a daily task at midnight EST');
    let today = new Date();
    console.log(`Resetting game data - Date: ${today.toISOString()}`);
    resetGame();  // Reset the game
}, {
    scheduled: true,
    timezone: "America/New_York"
});

function resetGame() {
    console.log("Resetting game data and selecting new movie...");
    selectMovieOfDay();
    console.log(`New movie selected: ${app.locals.selectedMovie}`);
    app.locals.guesses = {};
    console.log('Guesses have been reset for all users');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
