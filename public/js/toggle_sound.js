//toggle_sounds.js
function toggleSoundSetting() {
    let soundEnabled = getCookie('soundEnabled');
    if (soundEnabled === 'true' || soundEnabled === null) {
        setCookie('soundEnabled', 'false', 365);
        document.getElementById('toggleSound').textContent = 'Sound Disabled';
        document.getElementById('toggleSound').style.backgroundColor = '#D15656';
    } else {
        setCookie('soundEnabled', 'true', 365);
        document.getElementById('toggleSound').textContent = 'Sound Enabled';
        document.getElementById('toggleSound').style.backgroundColor = '#5AD156';
        playSound(soundPartial);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var soundEnabled = getCookie('soundEnabled');
    if (soundEnabled === 'true' || soundEnabled === null) {
        document.getElementById('toggleSound').textContent = 'Sound Enabled';
        document.getElementById('toggleSound').style.backgroundColor = '#5AD156';
        if (soundEnabled === null) {
            setCookie('soundEnabled', 'true', 365);
        }
    } else {
        document.getElementById('toggleSound').textContent = 'Sound Disabled';
        document.getElementById('toggleSound').style.backgroundColor = '#D15656';
    }

    document.getElementById('toggleSound').addEventListener('click', toggleSoundSetting);
});