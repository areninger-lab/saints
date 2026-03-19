let player;
let songs = [];
let currentSongIndex = 0;
let gameState = 'IDLE'; // IDLE, PHASE1, PHASE2, FEEDBACK
let correctDanceTypes = [];
let targetBeats = [];
let userHitTime = 0;
let feedbackTimeout;
let checkInterval;

// All possible ballroom dances for the buttons
const danceStyles = [
    "Waltz", "Tango", "Foxtrot", "Viennese Waltz", "Quickstep",
    "Samba", "Cha Cha", "Rumba", "Paso Doble", "Jive",
    "Swing", "Nightclub 2-Step", "Bolero", "Mambo"
];

// Initialize Game
async function init() {
    try {
        const response = await fetch('songs.json');
        songs = await response.json();
        shuffle(songs);
        renderDanceButtons();
        loadSong(0);
    } catch (error) {
        console.error("Failed to load songs:", error);
    }
}

// YouTube API Callback
function onYouTubeIframeAPIReady() {
    // API is ready, now we can start loading our data
    init();
}

function loadSong(index) {
    const song = songs[index];
    correctDanceTypes = song.danceTypes;
    targetBeats = song.beats;

    // Clear any previous game states/timeouts
    clearTimeout(feedbackTimeout);
    clearInterval(checkInterval);
    document.getElementById('visual-cue').classList.add('hidden');

    if (player) {
        player.loadVideoById(song.youtubeId);
    } else {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: song.youtubeId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

function onPlayerReady(event) {
    startPhase1();
}

function onPlayerStateChange(event) {
    // If user interacts directly with video (plays/pauses), keep game logic in sync
    if (event.data === YT.PlayerState.PLAYING && gameState === 'IDLE') {
        startPhase1();
    }
}

function startPhase1() {
    gameState = 'PHASE1';
    showPhase('phase-1');
}

function selectDance(style) {
    if (gameState !== 'PHASE1') return;

    const feedbackMsg = document.getElementById('feedback-message');
    if (correctDanceTypes.includes(style)) {
        startPhase2();
    } else {
        feedbackMsg.textContent = `Try again! "${style}" is not the correct dance for this song.`;
        feedbackMsg.parentNode.classList.remove('hidden');
        setTimeout(() => {
            if (gameState === 'PHASE1') feedbackMsg.parentNode.classList.add('hidden');
        }, 3000);
    }
}

function startPhase2() {
    gameState = 'PHASE2';
    showPhase('phase-2');
}

document.getElementById('hit-the-1').addEventListener('click', () => {
    if (gameState !== 'PHASE2') return;

    userHitTime = player.getCurrentTime();
    calculateFeedback();
});

function calculateFeedback() {
    gameState = 'FEEDBACK';

    // Find the closest target beat
    let closestBeat = targetBeats[0];
    let minDiff = Math.abs(userHitTime - closestBeat);

    targetBeats.forEach(beat => {
        let diff = Math.abs(userHitTime - beat);
        if (diff < minDiff) {
            minDiff = diff;
            closestBeat = beat;
        }
    });

    const diff = userHitTime - closestBeat;
    const absDiff = Math.abs(diff);
    let message = "";

    if (absDiff < 0.1) {
        message = "Perfect! Right on the 1.";
    } else {
        const timing = diff > 0 ? "late" : "early";
        message = `${absDiff.toFixed(2)} seconds ${timing}.`;
    }

    const feedbackArea = document.getElementById('feedback-area');
    const feedbackMsg = document.getElementById('feedback-message');
    feedbackMsg.textContent = message;

    showPhase('feedback-area');

    // Replay with visual cue after 2 seconds
    feedbackTimeout = setTimeout(() => {
        replayWithCue(closestBeat);
    }, 2000);
}

function replayWithCue(targetBeat) {
    const startPos = Math.max(0, targetBeat - 2);
    player.seekTo(startPos, true);
    player.playVideo();

    checkInterval = setInterval(() => {
        const currentTime = player.getCurrentTime();
        if (currentTime >= targetBeat) {
            showVisualCue();
            clearInterval(checkInterval);
        }
    }, 10);
}

function showVisualCue() {
    const cue = document.getElementById('visual-cue');
    cue.classList.remove('hidden');
    setTimeout(() => {
        cue.classList.add('hidden');
    }, 800);
}

document.getElementById('next-song').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
});

// UI Helper Functions
function showPhase(phaseId) {
    document.querySelectorAll('.phase, #feedback-area').forEach(p => p.classList.add('hidden'));
    document.getElementById(phaseId).classList.remove('hidden');
}

function renderDanceButtons() {
    const container = document.getElementById('dance-buttons');
    container.innerHTML = '';
    danceStyles.forEach(style => {
        const btn = document.createElement('button');
        btn.className = 'gold-button';
        btn.textContent = style;
        btn.onclick = () => selectDance(style);
        container.appendChild(btn);
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
