function playAudioOnInteraction() {
    var audio = document.getElementById('indexAudio');
    audio.play().then(() => {
        console.log('Audio playing');
        document.removeEventListener('click', playAudioOnInteraction);
        document.removeEventListener('keydown', playAudioOnInteraction);
        document.removeEventListener('mousemove', playAudioOnInteraction);
    }).catch(function(error) {
        console.log('Audio playback failed:', error);
    });
}

document.addEventListener('click', playAudioOnInteraction);
document.addEventListener('keydown', playAudioOnInteraction);
document.addEventListener('mousemove', playAudioOnInteraction, {once: true});

document.getElementById('speakerIcon').innerHTML = '&#128264;'; // Speaker off icon

document.getElementById('speakerIcon').addEventListener('click', function() {
    var audio = document.getElementById('indexAudio');
    if (audio.paused) {
        audio.play().then(() => {
            console.log('Audio playing');
            this.innerHTML = '&#128266;'; 
        }).catch(error => {
            console.error('Error attempting to play audio:', error);
        });
    } else {
        audio.pause();
        this.innerHTML = '&#128264;'; 
    }
});

console.log(`
    /\\_/\\  
   ( o.o ) 
    > ^ <  woof!
`);
