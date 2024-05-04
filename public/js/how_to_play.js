document.addEventListener('DOMContentLoaded', function () {
    const howToPlayButton = document.getElementById('howToPlayButton');
    const howToPlayContainer = document.getElementById('howToPlayContainer');
    const closeHowToPlay = document.getElementById('closeHowToPlay');

    // Show the How to Play container
    howToPlayButton.addEventListener('click', function() {
        howToPlayContainer.style.opacity = '1';
        howToPlayContainer.style.visibility = 'visible';
    });

    // Hide the How to Play container
    closeHowToPlay.addEventListener('click', function() {
        howToPlayContainer.style.opacity = '0';
        howToPlayContainer.style.visibility = 'hidden';
    });
});