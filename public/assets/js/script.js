/* CLIENT-SIDE SCRIPT */

const socket = io();

const start = document.querySelector('#start');
const playerForm = document.querySelector('#player-form');

const gameView = document.querySelector('#game-view');
const playingField = document.querySelector('#playing-field');
const playersField = document.querySelector('#players');
const activePlayers = document.querySelector('#active-players');

const virus = document.getElementById('img-virus-play');

let playerAlias = null;

/* Log player connect/disconnect events */
const infoFromAdmin = (data) => {
	const notification = document.createElement('li');
	notification.classList.add('list-group-item', 'list-group-item-light', 'notification');

	notification.innerHTML = data;

	activePlayers.appendChild(notification);
}


const showActivePlayers = (players) => {
	activePlayers.innerHTML = players.map(player => `<li class="player">${player}</li>`).join("");
}

const imgRandom = (data) => {
	setTimeout(() => {
		imgCoordinates(data.target)
	}, data.delay);
}

const imgCoordinates = (target) => {
	virus.style.left = target.width + "px";
	virus.style.top = target.height + "px";
}

const initGame = (players) => {
	start.classList.add('hide');
	gameView.classList.remove('hide');

	showActivePlayers(players);
}


/* Event handlers */

// Generate new image in random position
virus.addEventListener('click', () => {
	socket.emit('player-click', playerAlias);
});

// Get player alias from form and emit "add-player" event to server
playerForm.addEventListener('submit', e => {
	e.preventDefault();

	playerAlias = document.querySelector('#player-alias').value;

	socket.emit('add-player', playerAlias);
});


/* Listening for events emitted from server */

socket.on('reconnect', () => {
	if (playerAlias) {
		socket.emit('add-player', playerAlias, () => {
			console.log("The server acknowledged the reconnection.");
		});
	}
});

socket.on('player-disconnected', playerAlias => {
	infoFromAdmin(`${playerAlias} left the game`);
});

socket.on('init-game', players => {
	initGame(players);
});

socket.on('player-click', (data) => {
	imgRandom(data);
});
