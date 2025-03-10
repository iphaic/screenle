// share.js
function showVictoryModal() {
    let guessCount;
    if (!isCustomGame) {
        guessCount = parseInt(getCookie('guesses'));
    } else if (isCustomGame) {
        guessCount = parseInt(getCookie('customGame_guesses'));
    }
    guessCount = Math.max(1, guessCount - 1);
    document.getElementById('guessCountDisplay').textContent = `${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}!`;
    updateShareLinks(guessCount);
    document.getElementById('victoryContainer').style.display = 'block';
}

function updateShareLinks(guessCount) {
    const message = `I beat today's screenle in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}! Can you beat my score?`;
    document.getElementById('shareOnTwitter').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(document.location.href)}`;
    document.getElementById('shareOnFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(document.location.href)}&quote=${encodeURIComponent(message)}`;
}

function handleGenericShare() {
    let guessCount;
    if (!isCustomGame) {
        guessCount = parseInt(getCookie('guesses'));
    } else if (isCustomGame) {
        guessCount = parseInt(getCookie('customGame_guesses'));
    }
    guessCount = Math.max(1, guessCount - 1);
    const guessText = guessCount === 1 ? 'guess' : 'guesses';
    const message = `I beat the screenle in ${guessCount} ${guessText}! Try to beat my score.`;
    const url = document.location.href;

    const shareButton = document.getElementById('genericShareButton');

    // Detect if the user is on a mobile device
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        navigator.share({
            title: 'Play screenle',
            text: message,
            url: url
        }).then(() => {
            shareButton.textContent = 'Shared!';
            setTimeout(() => {
                shareButton.innerHTML = '<img src="images/copy.png" alt="Copy Link">';
            }, 2000);
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(`${message} ${url}`).then(() => {
            shareButton.textContent = 'Copied!';
            setTimeout(() => {
                shareButton.innerHTML = '<img src="images/copy.png" alt="Copy Link">';
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            shareButton.textContent = 'Failed to copy!';
            setTimeout(() => {
                shareButton.innerHTML = '<img src="images/copy.png" alt="Copy Link">';
            }, 1000);
        });
    }
}

function share_custom_game() {
    const movieTitle = document.getElementById('guessInput').value.trim();
    if (!movieTitle) {
        alert("Please enter a movie title.");
        return;
    }

    const movie = movies.find(m => m['Movie Title'].toLowerCase() === movieTitle.toLowerCase());
    if (!movie) {
        document.getElementById('gameMessage').textContent = "Movie not found, try again.";
        return;
    }

    const encodedTitle = encodeMovieTitle(movie['Movie Title']);
    const customLink = generateCustomGameLink(encodedTitle);
    const message = `I made a custom screenle game for you! Try it here:`;
    shareLink(message, customLink);
}

function shareLink(message, url) {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        navigator.share({
            title: 'Play screenle - Custom Game',
            text: message,
            url: url
        }).then(() => console.log('Share was successful.'))
          .catch(console.error);
    } else {
        navigator.clipboard.writeText(`${message} ${url}`).then(() => {
            // alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link to clipboard: ', err);
            alert('Failed to copy link to clipboard.');
        });
    }
}
