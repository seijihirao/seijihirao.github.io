// YouTube Player
let player;
let isPlaying = false;
let shouldPlayOnReady = false;

function startMusic() {
    if (player && player.playVideo) {
        player.seekTo(464);
        player.playVideo();
        isPlaying = true;
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.innerHTML = '<i class="ri-music-2-fill text-xl"></i>';
        }
    } else {
        shouldPlayOnReady = true;
    }
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: 'lg4i5xCMJpI',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'enablejsapi': 1,
            'loop': 1,
            'playlist': 'lg4i5xCMJpI',
            'rel': 0,
            'start': 452,
            'origin': window.location.protocol + '//' + window.location.host
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError
        }
    });
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event);
}

function onPlayerReady(event) {
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            if (isPlaying) {
                player.pauseVideo();
                musicToggle.innerHTML = '<i class="ri-music-2-line text-xl"></i>';
            } else {
                player.seekTo(452);
                player.playVideo();
                musicToggle.innerHTML = '<i class="ri-music-2-fill text-xl"></i>';
            }
            isPlaying = !isPlaying;
        });
    }

    // Set initial volume to 50%
    player.setVolume(50);

    // If envelope was opened before player was ready, start music now
    if (shouldPlayOnReady) {
        startMusic();
    }
}

// Make startMusic available globally
window.startMusic = startMusic; 