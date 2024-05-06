document.addEventListener('DOMContentLoaded', function () {
    const howToPlayButton = document.getElementById('howToPlayButton');
    const howToPlayContainer = document.getElementById('howToPlayContainer');
    const closeHowToPlay = document.getElementById('closeHowToPlay');

    howToPlayButton.addEventListener('click', function() {
        if (howToPlayContainer.style.visibility === 'visible') {
            howToPlayContainer.style.opacity = '0';
            setTimeout(() => {
                howToPlayContainer.style.visibility = 'hidden';
            }, 300);
        } else {
            howToPlayContainer.style.visibility = 'visible';
            setTimeout(() => {
                howToPlayContainer.style.opacity = '1';
            }, 10);
        }
    });

    closeHowToPlay.addEventListener('click', function() {
        howToPlayContainer.style.opacity = '0';
        setTimeout(() => {
            howToPlayContainer.style.visibility = 'hidden';
        }, 300);
    });
});