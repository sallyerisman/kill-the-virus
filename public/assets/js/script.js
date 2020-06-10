/* CLIENT-SIDE SCRIPT */

const socket = io();

const start = document.querySelector('#start');
const playerForm = document.querySelector('#player-form');
const btnPlay = document.querySelector('#btn-play');

const gameView = document.querySelector('#game-view');
const playingField = document.querySelector('#playing-field');
const playersField = document.querySelector('#players');
const activePlayers = document.querySelector('#active-players');

let playerAlias = null;

/* Log player connect/disconnect events */
const infoFromAdmin = (data) => {
	console.log("What is data:", data)
	const notification = document.createElement('li');
	notification.classList.add('list-group-item', 'list-group-item-light', 'notification');

	notification.innerHTML = data;

	activePlayers.appendChild(notification);
}

/* Store click info */
const storePlayerClick = (click) => {

}

const showActivePlayers = (players) => {
	activePlayers.innerHTML = players.map(player => `<li class="player">${player}</li>`).join("");
}

const initGame = (players) => {

	start.classList.add('hide');
	gameView.classList.remove('hide');

	showActivePlayers(players);
}

// Get player alias from form and emit "add-player" event to server
playerForm.addEventListener('submit', e => {
	e.preventDefault();

	playerAlias = document.querySelector('#player-alias').value;

	socket.emit('add-player', playerAlias);
});

socket.on('reconnect', () => {
	if (playerAlias) {
		socket.emit('add-player', playerAlias, () => {
			console.log("The server acknowledged the reconnection.");
		});
	}
});


socket.on('player-disconnected', (playerAlias) => {
	infoFromAdmin(`${playerAlias} left the game`);
});

socket.on('player-click', (click) => {
	storePlayerClick(click);
});

socket.on('init-game', (players) => {
	initGame(players);
});
