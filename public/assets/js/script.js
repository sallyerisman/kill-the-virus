/* CLIENT-SIDE SCRIPT */

const socket = io();

const start = document.querySelector('#start');
const playerForm = document.querySelector('#player-form');

const gameView = document.querySelector('#game-view');
const playingField = document.querySelector('#playing-field');

const timer = document.querySelector('#timer');

const gameData = document.querySelector('#game-data');
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

const startTimer = (timestamp) => {
	timer.innerHTML = timestamp;
}
let timeOfImg = null;

const startRound = (data) => {
	virus.style.display = "none";
	setTimeout(() => {
		imgCoordinates(data.target);
		timeOfImg = new Date().getTime();
	}, data.delay);
}

const imgCoordinates = (target) => {
	virus.style.display = "inline";
	virus.style.left = target.x + "px";
	virus.style.top = target.y + "px";
}

const initGame = (data) => {
	start.classList.add('hide');
	gameView.classList.remove('hide');

	showActivePlayers(data.activePlayers);

	startRound(data);
}

const logReactionTime = (data) => {
	document.querySelector('#reaction-times').innerHTML = "";

	const reactionEl = document.createElement('li');

	const alias = data.alias;
	reactionEl.innerHTML = `${alias}: ${data.reactionTime}`;

	document.querySelector('#reaction-times').appendChild(reactionEl);
}

const logScore = (data, ownScore = false) => {
	document.querySelector('#current-score').innerHTML = "";

	const scoreEl = document.createElement('li');

	const player = ownScore ? playerAlias : data.alias;
	scoreEl.innerHTML = `<span id="alias">${player}</span>: ${data.score}`;

	document.querySelector('#current-score').appendChild(scoreEl);
}

/* Event handlers */

let score = 0;
// On player click, store data and emit "player-click" event
virus.addEventListener('click', () => {

	score ++;

	const playerData = {
		timeOfImg,
		timeOfClick: new Date().getTime(),
		playerAlias,
		score,
	}

	socket.emit('player-click', playerData);
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

socket.on('init-game', data => {
	initGame(data);
});

socket.on('player-click', data => {
	logScore(data);
	logReactionTime(data);
	startRound(data);
});

socket.on('start-timer', timestamp => {
	startTimer(timestamp);
});


