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
let reactionTime = "";
let score = 0;
let timeOfImg = null;
let currTime = null;


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

function showTimer(timeOfImg) {
	let mins = 0;
	let secs = 0;
	let cents = 0;

	currTime = setInterval(() => {
		const time = Date.now() - timeOfImg;
		mins = Math.floor((time/1000/60)),
		secs = Math.floor((time/1000));
		cents = Math.floor((time/100));

		timer.innerHTML = mins + ":" + secs + ":" + cents;
	}, 10);
}

function resetTimer() {
	clearInterval(currTime);
	timer.innerHTML = "";
}

const startRound = (imgCords) => {
	virus.style.display = "none";

	if (currTime) {
		resetTimer();
	}

	setTimeout(() => {
		imgCoordinates(imgCords.target);
		timeOfImg = Date.now();
		showTimer(timeOfImg);
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

const logReactionTime = (players) => {
	document.querySelector('#reaction-times').innerHTML = "";
	document.querySelector('#reaction-times').innerHTML = players.map(player => `<li>${player.alias}: ${player.reactionTime}</li>`).join("");
}

const logScore = (players) => {
	document.querySelector('#current-score').innerHTML = "";
	document.querySelector('#current-score').innerHTML = players.map(player => `<li>${player.alias}: ${player.score}</li>`).join("");
}

const showGameOver = (player, maxRounds) => {
	document.querySelector("#game-over").innerHTML = `
		<h3>GAME OVER</h3>
		<p>You lost with a score of ${player.score}/${maxRounds}</p>
	`
	document.querySelector("#game-over").classList.remove("hide");
	document.querySelector("#playing-field").classList.add("hide");
}

const showCongratulations = (player, maxRounds) => {
	document.querySelector("#congratulations").innerHTML = `
		<h3>Congratulations ${player.alias}!</h3>
		<p>Your score was ${player.score}/${maxRounds}</p>
	`
	document.querySelector("#congratulations").classList.remove("hide");
	document.querySelector("#playing-field").classList.add("hide");
}

/* Event handlers */

// On player click, store data and emit "player-click" event
virus.addEventListener('click', () => {
	score ++;
	const timeOfClick = new Date().getTime();
	reactionTime = (timeOfClick - timeOfImg) / 1000 + " seconds";

	socket.emit('player-click', playerAlias, score, reactionTime);
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

socket.on('player-click', (imgCords, players) => {
	logScore(players);
	logReactionTime(players);
	startRound(imgCords);
});

socket.on('reset-timer', () => {
	resetTimer();
});

socket.on('active-players', (players) => {
	showActivePlayers(players);
});

socket.on('game-over', (player, maxRounds) => {
	showGameOver(player, maxRounds);
});

socket.on('congratulations', (player, maxRounds) => {
	showCongratulations(player, maxRounds);
});


window.onload = () => {
	getRoomList();
}


