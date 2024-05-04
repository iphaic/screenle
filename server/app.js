// app.js
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
let movieData = [];
function loadMovies() {
    const filePath = path.join(__dirname, '..', 'data', 'imdb_top_films.csv');
    
    if (fs.existsSync(filePath)) {
        const tempMovieData = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => tempMovieData.push(data))
            .on('end', () => {
                console.log('Movies loaded:', tempMovieData.length);
                serverGame.setMovies(tempMovieData);  // Now calling setMovies here
            });
    } else {
        console.error('File not found:', filePath);
    }
}

loadMovies();

// Read movie data
app.get('/api/movies', (req, res) => {
    res.json({
        movies: serverGame.getMovies(),
        selectedMovie: serverGame.getSelectedMovie()
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
    loadMovies();
    serverGame.selectMovieOfDay();
    console.log('Guesses have been reset for all users');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
