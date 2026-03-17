let saintsData = [];
let deck = [];
let players = [];
let currentPlayerIndex = 0;
let timeline = []; // Array of card objects
let selectedHandCard = null;
let gameActive = false;

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const winnerScreen = document.getElementById('winner-screen');
const playerCountStep = document.getElementById('player-count-step');
const playerNamesStep = document.getElementById('player-names-step');
const nameInputsDiv = document.getElementById('name-inputs');
const playerAreasDiv = document.getElementById('player-areas');
const timelineDiv = document.getElementById('timeline');
const announcementDiv = document.getElementById('announcement');
const statusMessageDiv = document.getElementById('status-message');

// Initialize Game
async function init() {
    console.log("Initializing game...");
    try {
        const response = await fetch('saints_data.json');
        saintsData = await response.json();
        console.log("Loaded data:", saintsData.length, "saints");

        document.getElementById('next-to-names').addEventListener('click', showNameInputs);
        document.getElementById('start-game').addEventListener('click', startGame);
    } catch (error) {
        console.error("Failed to load saints data:", error);
    }
}

function showNameInputs() {
    console.log("Showing name inputs");
    const count = parseInt(document.getElementById('player-count').value);
    if (count < 2 || count > 4) return;

    nameInputsDiv.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i} Name`;
        input.id = `p${i}-name`;
        input.value = `Player ${i}`;
        nameInputsDiv.appendChild(input);
    }

    playerCountStep.classList.add('hidden');
    playerNamesStep.classList.remove('hidden');
}

function startGame() {
    console.log("Starting game");
    const count = parseInt(document.getElementById('player-count').value);
    players = [];
    timeline = [];
    selectedHandCard = null;
    currentPlayerIndex = 0;

    for (let i = 1; i <= count; i++) {
        players.push({
            name: document.getElementById(`p${i}-name`).value || `Player ${i}`,
            hand: []
        });
    }

    // Ensure we start with a clean deep copy of the data
    deck = JSON.parse(JSON.stringify(saintsData));
    shuffle(deck);

    console.log("Deck size after shuffle:", deck.length);

    // Deal cards
    players.forEach(player => {
        for (let i = 0; i < 4; i++) {
            if (deck.length > 0) {
                const card = deck.pop();
                player.hand.push(card);
                console.log(`Dealt to ${player.name}:`, card['Saint Name']);
            }
        }
    });

    // Initial timeline card
    if (deck.length > 0) {
        const initialCard = deck.pop();
        timeline.push(initialCard);
        console.log("Initial timeline card:", initialCard['Saint Name']);
    }

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameActive = true;

    renderPlayerAreas();
    renderTimeline();
    updateTurnAnnouncement();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderPlayerAreas() {
    playerAreasDiv.innerHTML = '';

    const topRow = document.createElement('div');
    topRow.className = 'player-row top';
    const bottomRow = document.createElement('div');
    bottomRow.className = 'player-row bottom';

    players.forEach((player, index) => {
        const area = document.createElement('div');
        area.className = `player-area`;
        if (index === currentPlayerIndex) area.classList.add('active');

        const nameLabel = document.createElement('div');
        nameLabel.className = 'player-name';
        nameLabel.textContent = player.name;
        area.appendChild(nameLabel);

        const handDiv = document.createElement('div');
        handDiv.className = 'hand';

        player.hand.forEach((card, cardIndex) => {
            const cardEl = createCardElement(card, false, index === currentPlayerIndex);
            if (index === currentPlayerIndex) {
                cardEl.onclick = () => selectCard(card, cardEl);
                if (selectedHandCard && selectedHandCard.card === card) {
                    cardEl.classList.add('selected');
                }
            } else {
                cardEl.style.opacity = '0.7';
                cardEl.style.cursor = 'default';
            }
            handDiv.appendChild(cardEl);
        });

        area.appendChild(handDiv);

        // Player 1 (0) and 3 (2) go top, 2 (1) and 4 (3) go bottom
        if (index === 0 || index === 2) {
            topRow.appendChild(area);
        } else {
            bottomRow.appendChild(area);
        }
    });

    playerAreasDiv.appendChild(topRow);
    playerAreasDiv.appendChild(bottomRow);
}

function createCardElement(card, showDate, isDraggable = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    if (isDraggable) {
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) => {
            selectedHandCard = { card, element: cardEl };
            cardEl.classList.add('selected');
            e.dataTransfer.setData('text/plain', ''); // Required for Firefox
        });
        cardEl.addEventListener('dragend', () => {
            cardEl.classList.remove('selected');
        });
    }

    // Clean up Patron Saint Of if it contains "null" or extra commas from CSV parsing issues
    let patron = card['Patron Saint Of'] || "";
    if (card['null']) {
        patron += (patron ? ", " : "") + card['null'].join(", ");
    }

    cardEl.innerHTML = `
        <img src="${card['Image URL']}" alt="${card['Saint Name']}" draggable="false">
        <div class="card-name">${card['Saint Name']}</div>
        <div class="card-quote">"${card['Famous Quote']}"</div>
        <div class="card-patron">Patron of: ${patron}</div>
        ${showDate ? `<div class="card-date">${card['Year of Death']}</div>` : ''}
    `;

    return cardEl;
}

function renderTimeline() {
    timelineDiv.innerHTML = '';

    // Initial slot
    addTimelineSlot(0);

    timeline.forEach((card, index) => {
        const cardEl = createCardElement(card, true);
        cardEl.classList.add('on-timeline');
        timelineDiv.appendChild(cardEl);

        // Slot after each card
        addTimelineSlot(index + 1);
    });
}

function addTimelineSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'timeline-slot';
    slot.onclick = () => placeCard(index);

    slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        placeCard(index);
    });

    timelineDiv.appendChild(slot);
}

function selectCard(card, element) {
    if (!gameActive) return;

    // Deselect previous
    const prevSelected = document.querySelector('.card.selected');
    if (prevSelected) prevSelected.classList.remove('selected');

    if (selectedHandCard && selectedHandCard.card === card) {
        selectedHandCard = null;
    } else {
        selectedHandCard = { card, element };
        element.classList.add('selected');
    }
}

function placeCard(index) {
    if (!selectedHandCard || !gameActive) return;

    const card = selectedHandCard.card;
    const year = parseInt(card['Year of Death']);

    // Check if correct
    // Correct if:
    // 1. It is >= all cards to its left
    // 2. It is <= all cards to its right

    let isCorrect = true;

    // Check cards to the left (0 to index-1)
    for (let i = 0; i < index; i++) {
        if (year < parseInt(timeline[i]['Year of Death'])) {
            isCorrect = false;
            break;
        }
    }

    // Check cards to the right (index to timeline.length-1)
    if (isCorrect) {
        for (let i = index; i < timeline.length; i++) {
            if (year > parseInt(timeline[i]['Year of Death'])) {
                isCorrect = false;
                break;
            }
        }
    }

    if (isCorrect) {
        handleCorrectPlacement(card, index);
    } else {
        handleIncorrectPlacement(card, index);
    }
}

function handleCorrectPlacement(card, index) {
    // Remove from hand
    const currentPlayer = players[currentPlayerIndex];
    currentPlayer.hand = currentPlayer.hand.filter(c => c !== card);

    // Add to timeline
    timeline.splice(index, 0, card);

    selectedHandCard = null;
    renderTimeline();
    renderPlayerAreas(); // Update hand immediately

    // Visual feedback
    const cardsOnTimeline = document.querySelectorAll('.on-timeline');
    const placedCardEl = cardsOnTimeline[index];
    placedCardEl.classList.add('correct');

    showStatus("Correct!", "success");

    if (currentPlayer.hand.length === 0) {
        endGame(currentPlayer.name);
    } else {
        nextTurn();
    }
}

function handleIncorrectPlacement(card, index) {
    gameActive = false; // Pause game during animation

    const currentPlayer = players[currentPlayerIndex];

    // Remove from hand
    currentPlayer.hand = currentPlayer.hand.filter(c => c !== card);
    renderPlayerAreas(); // Update hand immediately

    // Visual feedback - show the card in the timeline briefly
    const tempCard = createCardElement(card, true);
    tempCard.classList.add('wrong');

    // Insert into DOM at the correct spot in the timeline
    const slots = timelineDiv.querySelectorAll('.timeline-slot');
    const targetSlot = slots[index];

    // For the timeline, we need to handle the slots carefully
    // The slots are at index, card, index+1, card...
    // The targetSlot is the one the user clicked.
    // We want to replace it or insert next to it.
    timelineDiv.insertBefore(tempCard, targetSlot.nextSibling);

    showStatus(`Wrong! The date was ${card['Year of Death']}`, "error");

    setTimeout(() => {
        // Remove from timeline DOM
        if (tempCard.parentNode) {
            timelineDiv.removeChild(tempCard);
        }

        // Draw new card
        if (deck.length > 0) {
            currentPlayer.hand.push(deck.pop());
        }

        selectedHandCard = null;
        gameActive = true;
        nextTurn();
    }, 5000);
}

function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    renderPlayerAreas();
    updateTurnAnnouncement();
}

function updateTurnAnnouncement() {
    announcementDiv.textContent = `${players[currentPlayerIndex].name}'s Turn`;
}

function showStatus(msg, type) {
    statusMessageDiv.textContent = msg;
    statusMessageDiv.className = type;
    statusMessageDiv.classList.remove('hidden');
    setTimeout(() => {
        statusMessageDiv.classList.add('hidden');
    }, 3000);
}

function endGame(winnerName) {
    gameActive = false;
    winnerScreen.classList.remove('hidden');
    document.getElementById('winner-announcement').textContent = `${winnerName} Wins!`;
}

// shuffle(deck); // Removed this line as deck is shuffled in startGame
init();
