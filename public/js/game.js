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

let isCustomGame = false;
let alreadyLost = false;

function loadMovies() {
    fetch('/api/movies')
        .then(response => response.json())
        .then(data => {
            movies = data.movies;
            checkForCustomGame();
            if (!isCustomGame)
                {
                    console.log("isCustomGame is false");
                    selectedMovie = data.selectedMovie; 
                }

            if (selectedMovie) {
                // document.getElementById('devSelectedMovie').textContent = `Dev: ${selectedMovie['Movie Title']}`;
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
    let lastVictoryDay = parseInt(getCookie('lastVictoryDay')) || -1;
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

function checkIfAlreadyLostToday() {
    let lastLoseDay = parseInt(getCookie('lastLoseDay')) || -1;
    console.log('Last Lose Day:', lastLoseDay, 'Day of Year Today:', dayOfYearToday);
    if (lastLoseDay === dayOfYearToday) {
        console.log('User has already lost today.');
        alreadyLost = true;
        updateGameMessage(`You've already played today! Come back tomorrow and play again!`);
    } else {
        console.log('No lose recorded today. Last lose was on day:', lastLoseDay);
    }
}

function updateGuessCountDisplay() {
    let guesses;
    if (!isCustomGame)
    {
        guesses = parseInt(getCookie('guesses')) || 1;
    }
    else if (isCustomGame)
    {
        guesses = parseInt(getCookie('customGame_guesses')) || 1;
    }
    if (guesses >= 10) 
    {
        guesses = 10;
    }
    document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`;
}

function storeGuessHistory(guess) {
    let guessHistory = JSON.parse(localStorage.getItem('guessHistory') || '[]');
    guessHistory.unshift({
        title: guess['Movie Title'],
        feedback: {
            year: document.getElementById('yearFeedback').textContent,
            genre: document.getElementById('genreFeedback').innerHTML,
            director: document.getElementById('directorFeedback').innerHTML,
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

    guessHistory = guessHistory.slice(-10);

    historyContainer.classList.add('fade-out');

    setTimeout(() => {
        historyContainer.innerHTML = '';
        historyContainer.classList.remove('fade-out');

        guessHistory.forEach(guess => {
            const guessDiv = document.createElement('div');
            guessDiv.className = 'guess-history-entry';
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
    }, 250);
}

document.getElementById('guessButton').addEventListener('click', function() {

    if (isCustomGameCreationMode) {
        share_custom_game();
        const linkMessageElement = document.getElementById('guessButton');
        linkMessageElement.textContent = "LINK COPIED!";
        
        // Clear the message after 2 seconds
        setTimeout(() => {
            linkMessageElement.textContent = "CREATE LINK";
        }, 2000);
        return;
    }

    document.getElementById('gameMessage').textContent = "";
    const userInput = document.getElementById('guessInput').value.trim().toLowerCase();
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === userInput);

    if (movie) {
        if (!checkGuessLimit()) return;

        displayMovieDetails(movie);
        updateFeedback(movie);
        storeGuessHistory(movie);
        displayGuessHistory();

        if (movie['Movie Title'].toLowerCase() === selectedMovie['Movie Title'].toLowerCase()) {
            document.getElementById('gameMessage').textContent = `You got it! ${movie['Movie Title']}.`;
            recordVictory();
            playSound(soundVictory);
        } else {
            let guesses = parseInt(getCookie('guesses')) || 1;
            if (guesses > 10) {
                updateGameMessage("Game Over! The movie was " + selectedMovie['Movie Title'] + ". Come back tomorrow and try again!");
                disableGuessing();
                recordLose();
            }
        }
    } else {
        document.getElementById('gameMessage').textContent = "Invalid Movie Title!";
    }
    document.getElementById('guessInput').value = '';
    hideSuggestions();
});

function hideSuggestions() {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';
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
    let cookieName = isCustomGame ? 'customGame_guesses' : 'guesses';
    let guesses = parseInt(getCookie(cookieName)) || 1;
    console.log("Old guess amount: " + guesses)
    if (guesses > 10 || alreadyLost && !isCustomGame) 
    {
        updateGameMessage("Game Over! You have reached your guessing limit for today.");
        disableGuessing();
        return false;
    }
    else 
    {
        guesses++;
        setCookie(cookieName, guesses, 1);
        document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`;
        console.log("New guess amount: " + guesses)
        if (isCustomGame && guesses > 10)
        {
            updateGameMessage("Game Over! The movie was: " + selectedMovie['Movie Title']);
            disableGuessing();
        }
        return true;
    }
}

function checkGuessLimitOnLoad() {
    let cookieName = isCustomGame ? 'customGame_guesses' : 'guesses';
    let guesses = parseInt(getCookie(cookieName)) || 1;
    if (!isCustomGame && guesses > 10 || alreadyLost && !isCustomGame) {
        updateGameMessage('Game Over! You have reached your guessing limit for today. Come back tomorrow and play again!');
        disableGuessing();
        document.getElementById('guessCount').textContent = `Guess: ${guesses}/10`;
        return false;
    }

    console.log("Guess amount: " + guesses)
}

function disableGuessing() {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessButton').disabled = true;
}

function recordVictory() {
    confetti({
        particleCount: 200,
        startVelocity: 50,
        spread: 270,
        shapes: ['square','square','star']
      });
    if (!isCustomGame)
    {
        incrementVictories();
        setCookie('lastVictoryDay', dayOfYearToday, 1);
    }
    updateVictoryCountDisplay();
    disableGuessing();
    updateGameMessage(`Nice! You've correctly guessed the movie: ${selectedMovie['Movie Title']}.\nCome back tomorrow and play again!`);

    document.getElementById('victoryMovieTitle').textContent = selectedMovie['Movie Title'];
    document.getElementById('victoryContainer').style.display = 'block';

    showVictoryModal(selectedMovie['Movie Title']);

    // display the victory popup with animation
    const victoryModal = document.getElementById('victoryContainer');
    victoryModal.style.display = 'block';
    victoryModal.style.opacity = '1';
    victoryModal.style.animation = 'slideUpFadeIn 2.0s ease-out forwards';
}

function recordLose() {
    if (!isCustomGame)
        {
            setCookie('lastLoseDay', dayOfYearToday, 1);
        }
}

function closeVictoryModal() {
    document.getElementById('victoryContainer').style.display = 'none';
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
    displaySuggestions(input);
});

function displaySuggestions(input) {
    const suggestionsBox = document.getElementById('suggestions');
    suggestionsBox.innerHTML = '';
    suggestionsBox.style.display = 'none';

    if (input.length >= 2) {
        const filteredMovies = movies.filter(movie => movie['Movie Title'].toLowerCase().includes(input.toLowerCase()));

        if (filteredMovies.length > 0) {
            filteredMovies.slice(0, 5).forEach(movie => {
                const div = document.createElement('div');
                div.textContent = movie['Movie Title'];
                div.onclick = () => {
                    document.getElementById('guessInput').value = movie['Movie Title'];
                    suggestionsBox.style.display = 'none';
                };
                suggestionsBox.appendChild(div);
            });
            suggestionsBox.style.display = 'block';
        }
    }
}

function displayMovieDetails(movie) {
    document.getElementById('yearFeedback').textContent = `Year: ${movie['Year of Release']}`;
    document.getElementById('genreFeedback').textContent = `Genre: ${movie['Genre']}`;
    document.getElementById('directorFeedback').textContent = `Director(s): ${movie['Director']}`;
    document.getElementById('certificateFeedback').textContent = `Age Rating: ${movie['Certificate']}`;
    document.getElementById('durationFeedback').textContent = `Duration: ${movie['Duration']}`;
}

function durationToMinutes(duration) {
    const parts = duration.match(/(\d+)h (\d+)min/);
    if (!parts) return 0;
    const hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    return hours * 60 + minutes;
}

// i hate this function
function updateFeedback(guess) {
    const yearDifference = selectedMovie['Year of Release'] - guess['Year of Release'];

    // Calculate duration differences
    const selectedDurationMinutes = durationToMinutes(selectedMovie['Duration']);
    const guessDurationMinutes = durationToMinutes(guess['Duration']);
    const durationDifference = selectedDurationMinutes - guessDurationMinutes;

    // year feedback
    document.getElementById('yearFeedback').style.backgroundColor = yearDifference === 0 ? COLOR_CORRECT : Math.abs(yearDifference) <= 5 ? COLOR_PARTIAL : COLOR_WRONG;
    let year_status = yearDifference === 0 ? 2 : Math.abs(yearDifference) <= 5 ? 1 : 0;
    document.getElementById('yearFeedback').textContent = `Year: ${guess['Year of Release']} ${yearDifference === 0 ? '' : (yearDifference > 0 ? '↑' : '↓')}`;

    // duration feedback
    document.getElementById('durationFeedback').style.backgroundColor = durationDifference === 0 ? COLOR_CORRECT : Math.abs(durationDifference) <= 15 ? COLOR_PARTIAL : COLOR_WRONG;
    let duration_status = durationDifference === 0 ? 2 : Math.abs(durationDifference) <= 15 ? 1 : 0;
    document.getElementById('durationFeedback').textContent = `Duration: ${guess['Duration']} ${durationDifference === 0 ? '' : (durationDifference > 0 ? '↑' : '↓')}`;

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
    if (correctGenresCount === guessGenres.length) {
        document.getElementById('genreFeedback').style.backgroundColor = COLOR_CORRECT;  // all genres are correct
    } else if (correctGenresCount > 0) {
        document.getElementById('genreFeedback').style.backgroundColor = COLOR_PARTIAL;  // some but not all genres are correct
    } else {
        document.getElementById('genreFeedback').style.backgroundColor = COLOR_WRONG;  // no genres are correct
    }

    // directors
    const selectedDirectors = selectedMovie['Director'].split(',').map(director => director.trim().toLowerCase());
    const guessDirectors = guess['Director'].split(',').map(director => director.trim().toLowerCase());
    let directorFeedbackText = 'Director(s): ';
    let correctDirectorsCount = 0;

    guessDirectors.forEach((director, index) => {
        const originalDirectorText = guess['Director'].split(',')[index].trim();
        if (selectedDirectors.includes(director)) {
            directorFeedbackText += `<span style="background-color:${COLOR_CORRECT};">${originalDirectorText}</span>`;
            correctDirectorsCount++;
        } else {
            directorFeedbackText += originalDirectorText;
        }
        if (index < guessDirectors.length - 1) directorFeedbackText += ', ';
    });

    document.getElementById('directorFeedback').innerHTML = directorFeedbackText;
    if (correctDirectorsCount === guessDirectors.length) {
        document.getElementById('directorFeedback').style.backgroundColor = COLOR_CORRECT;  // all director are correct
    } else if (correctDirectorsCount > 0) {
        document.getElementById('directorFeedback').style.backgroundColor = COLOR_PARTIAL;  // some but not all director are correct
    } else {
        document.getElementById('directorFeedback').style.backgroundColor = COLOR_WRONG;  // no director are correct
    }

    // certificate
    document.getElementById('certificateFeedback').style.backgroundColor = selectedMovie['Certificate'] === guess['Certificate'] ? COLOR_CORRECT : COLOR_WRONG;
    let certificate_status = selectedMovie['Certificate'] === guess['Certificate'] ? 1 : 0;

    if (year_status == 2 || duration_status == 2 || correctGenresCount >= 2 || correctDirectorsCount >= 1 || certificate_status == 1)
    {
        playSound(soundCorrect);
        console.log("Sound correct");
    }
    else if (year_status == 1 || duration_status == 1 || correctGenresCount > 0 || correctDirectorsCount != 0)
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
        document.getElementById('gameMessage').textContent = "Game Over! You've already won today. The movie was " + selectedMovie['Movie Title'];
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
    clearLocalStorageExceptLastResetTime();
    const cookiesToDelete = ['guesses', 'lastVictoryDay', 'lastLoseDay'];
    document.cookie.split(';').forEach(cookie => {
        let [name, value] = cookie.split('=');
        name = name.trim();
        if (cookiesToDelete.includes(name)) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    });
}

function setupGameWithCustomMovie(title) {
    // Attempt to find the movie by title in the loaded movie list
    const movie = movies.find(movie => movie['Movie Title'].toLowerCase() === title.toLowerCase());
    if (movie) {
        selectedMovie = movie;  // Set the custom game movie
        console.log("Custom game setup with movie:", movie['Movie Title']);
        isCustomGame = true;
    } else {
        console.error("Movie not found:", title);
    }
}

function clearLocalStorageExceptLastResetTime() {
    const lastResetTime = localStorage.getItem('lastResetTime');

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'lastResetTime') {
            localStorage.removeItem(key);
        }
    }

    // Set back the lastResetTime
    if (lastResetTime) {
        localStorage.setItem('lastResetTime', lastResetTime);
    }
}

window.onload = function() {
    console.log("Window loaded successfully.");
        fetch('/api/last-reset-time')
        .then(response => {
            console.log("Response received");
            return response.json();
        })
        .then(data => {
            console.log("Data parsed", data)
            const serverResetTime = new Date(data.lastReset);
            const lastClientResetTime = new Date(localStorage.getItem('lastResetTime'));

            console.log("Server reset time:", serverResetTime);
            console.log("Last client reset time:", lastClientResetTime);

            if (!lastClientResetTime || serverResetTime > lastClientResetTime) {
                console.log("Clearing data due to reset.");
                checkAndClearData();
                localStorage.setItem('lastResetTime', serverResetTime.toISOString());
            }
            
            loadMovies();
            checkIfAlreadyLostToday();
            displayGuessHistory();
            checkGuessLimitOnLoad();
            updateGuessCountDisplay();
            updateVictoryCountDisplay();
            checkIfAlreadyWonToday();
            updateShareLinks();
        })
        .catch(error => {
            console.error('Error fetching last reset time:', error);
        });
};
