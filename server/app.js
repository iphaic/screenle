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
    const resetTime = new Date();
    fs.writeFileSync(path.join(__dirname, 'resetTime.json'), JSON.stringify({ lastReset: resetTime }));
    console.log('Game data has been reset');
}

app.get('/api/last-reset-time', (req, res) => {
    const resetTimePath = path.join(__dirname, 'resetTime.json');
    if (fs.existsSync(resetTimePath)) {
        res.sendFile(resetTimePath);
    } else {
        res.status(404).send('Reset time not found');
    }
});

const resetTimePath = path.join(__dirname, 'resetTime.json');

// Function to initialize the reset time
function initializeResetTime() {
    if (!fs.existsSync(resetTimePath)) {
        const resetTime = new Date();
        fs.writeFileSync(resetTimePath, JSON.stringify({ lastReset: resetTime }));
        console.log('\x1b[36m%s\x1b[0m','Initial reset time set at:', resetTime.toISOString());
    } else {
        const storedResetData = JSON.parse(fs.readFileSync(resetTimePath, 'utf8'));
        console.log('\x1b[36m%s\x1b[0m','Existing reset time found:', storedResetData.lastReset);
    }
}

// Basic Authentication Middleware
function basicAuth(req, res, next) {
    const auth = { login: 'admin', password: 'secret' }  // Set login and password

    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
        return next(); // Access granted
    }

    // Access denied
    res.set('WWW-Authenticate', 'Basic realm="401"'); // Change this as you want.
    res.status(401).send('Authentication required.'); // Custom message
}

// Route to protect
app.get('/data/imdb_top_films.csv', basicAuth, (req, res) => {
    // You can modify the path according to where you store your files
    res.sendFile(`${__dirname}/path_to_your_files/imdb_top_films.csv`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\x1b[32m',`Server running on port ${PORT}`);
    initializeResetTime();
});
