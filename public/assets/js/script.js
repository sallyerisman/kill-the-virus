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

let room = null;
let playerAlias = null;
let score = 0;


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

const showRoomName = (roomEl) => {
	document.querySelector('#current-room').innerHTML = "";

	const roomName = document.createElement('li');
	const name = roomEl;
	roomName.innerHTML = `${name}`;

	document.querySelector('#current-room').appendChild(roomName);
}

const startTimer = (timestamp) => {
	timer.innerHTML = timestamp;
}
let timeOfImg = null;

const startRound = (imgCords) => {
	virus.style.display = "none";
	setTimeout(() => {
		imgCoordinates(imgCords.target);
		timeOfImg = new Date().getTime();
	}, imgCords.delay);
}

const imgCoordinates = (target) => {
	virus.style.display = "inline";
	virus.style.left = target.x + "px";
	virus.style.top = target.y + "px";
}

const initGame = (imgCords) => {
	start.classList.add('hide');
	gameView.classList.remove('hide');

	showRoomName(room);

	startRound(imgCords);
}

const getRoomList = () => {
	socket.emit('get-room-list', (rooms) => {
		updateRoomList(rooms)
	})
}

const updateRoomList = (rooms) => {
	document.querySelector('#room').innerHTML = rooms.map(room => `<option value="${room}">${room}</option>`).join("");
}

const logReactionTime = (data) => {

	document.querySelector('#reaction-times').innerHTML = "";

	const reactionEl = document.createElement('li');

	const alias = data.alias;
	reactionEl.innerHTML = `${alias}: ${data.reactionTime}`;

	document.querySelector('#reaction-times').appendChild(reactionEl);
}

const logScore = (data) => {

	let opponentScore = 0;

	if (data.alias !== playerAlias) {
		opponentScore ++
		document.querySelector('#current-score').innerHTML = `<li>${data.alias}: ${opponentScore}</li>`;
		return;
	}

	document.querySelector('#current-score').innerHTML = `<li>${playerAlias}: ${score}</li>`;
}

const showGameOverMessage = (data) => {
	document.querySelector("#game-over").classList.remove("hide");
	document.querySelector("#game-over").classList.add("show");

	document.querySelector("#playing-field").classList.remove("show");
	document.querySelector("#playing-field").classList.add("hide");
}

/* Event handlers */

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
	room = playerForm.room.value;

	socket.emit('add-player', room, playerAlias);
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

socket.on('init-game', (imgCords) => {
	initGame(imgCords);
});

socket.on('player-click', (data, imgCords) => {
	logScore(data);
	logReactionTime(data);
	startRound(imgCords);
});

socket.on('start-timer', timestamp => {
	startTimer(timestamp);
});

socket.on('active-players', (players) => {
	showActivePlayers(players);
});

socket.on('game-over', (data) => {
	showGameOverMessage(data);
});


window.onload = () => {
	getRoomList();
}


