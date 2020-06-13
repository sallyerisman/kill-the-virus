/* CLIENT-SIDE SCRIPT */

const socket = io();

const activePlayers = document.querySelector('#active-players');
const congratulations = document.querySelector('#congratulations');
const currentRoom = document.querySelector('#current-room');
const currentScore = document.querySelector('#current-score');
const gameOver = document.querySelector('#game-over');
const playerForm = document.querySelector('#player-form');
const playingField = document.querySelector('#playing-field');
const reactionTimes = document.querySelector('#reaction-times');
const roundsPlayed = document.querySelector('#rounds-played');
const timer = document.querySelector('#timer');
const virus = document.getElementById('img-virus-play');

<<<<<<< HEAD
=======
let currTime = null;
let playerAlias = "";
let reactionTime = "";
>>>>>>> dev
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

<<<<<<< HEAD
/* Show all players in current game */
=======
const getRoomList = () => {
	socket.emit('get-room-list', (rooms) => {
		updateRoomList(rooms)
	})
}

const updateRoomList = (rooms) => {
	document.querySelector('#room').innerHTML = rooms.map(room => `<option value="${room}">${room}</option>`).join("");
}

/* Show all player in the current game */
>>>>>>> dev
const showActivePlayers = (players) => {
	activePlayers.innerHTML = players.map(player => `<li class="player">${player}</li>`).join("");
}

/* Show name of current room */
const showRoomName = (roomEl) => {
	currentRoom.innerHTML = "";

	const roomName = document.createElement('li');
	roomName.innerHTML = `${roomEl}`;

	currentRoom.appendChild(roomName);
}

<<<<<<< HEAD
=======
/* Show number of rounds played */
const showRound = (round, maxRounds) => {
	roundsPlayed.innerHTML = "";

	const roundEl = document.createElement('li');
	roundEl.innerHTML = `${round}/${maxRounds}`;

	roundsPlayed.appendChild(roundEl);
}

/* Show current score of both players */
const showScore = (players) => {
	currentScore.innerHTML = "";
	currentScore.innerHTML = players.map(player => `<li>${player.alias}: ${player.score}</li>`).join("");
}

/* Empty timer field */
const resetTimer = () => {
	clearInterval(currTime);
	timer.innerHTML = "";
}

>>>>>>> dev
/* Show timer */
function showTimer(timeOfImg) {
	let mins = 0;
	let secs = 0;
	let cents = 0;

	currTime = setInterval(() => {
		reactionTime = Date.now() - timeOfImg;
		mins = Math.floor((reactionTime/1000/60)),
		secs = Math.floor((reactionTime/1000));
		cents = Math.floor((reactionTime/100));

		if (mins < 10){
			mins = "0" + mins;
		}

		if (secs < 10){
			secs = "0" + secs;
		}

		if (cents < 10){
			cents = "0" + cents;
		}

		timer.innerHTML = mins + ":" + secs + ":" + cents;
	}, 10);
}

/* Empty timer field */
function resetTimer() {
	clearInterval(currTime);
	timer.innerHTML = "";
}

/* Start a new round */
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

<<<<<<< HEAD
/* Show virus in new location */
const imgCoordinates = (target) => {
	virus.style.display = "inline";
	virus.style.left = target.x + "px";
	virus.style.top = target.y + "px";
}

/* Start new game */
const initGame = (imgCords) => {
	document.querySelector('#start').classList.add('hide');
	document.querySelector('#game-view').classList.remove('hide');

	showRoomName(room);
	startRound(imgCords);
}

/* Get a list of all rooms */
const getRoomList = () => {
	socket.emit('get-room-list', (rooms) => {
		updateRoomList(rooms)
	})
}

/* Update the list of rooms */
const updateRoomList = (rooms) => {
	document.querySelector('#room').innerHTML = rooms.map(room => `<option value="${room}">${room}</option>`).join("");
=======
/* Start a new game */
const initGame = (imgCords) => {
	document.querySelector('#start').classList.add('hide');
	document.querySelector('#game-view').classList.remove('hide');

	showRoomName(room);
	startRound(imgCords);
>>>>>>> dev
}

/* Show the most recent winning reaction time of both players */
const showReactionTime = (players) => {
	reactionTimes.innerHTML = "";
	reactionTimes.innerHTML = players.map(player => `<li>${player.alias}: ${player.reactionTime}</li>`).join("");
}

/* Show current score of both players */
const showScore = (players) => {
	currentScore.innerHTML = "";
	currentScore.innerHTML = players.map(player => `<li>${player.alias}: ${player.score}</li>`).join("");
}

/* Show number of rounds played */
const showRound = (rounds, maxRounds) => {
	roundsPlayed.innerHTML = "";

	const roundEl = document.createElement('li');
	roundEl.innerHTML = `${rounds}/${maxRounds}`;

	roundsPlayed.appendChild(roundEl);
}

/* Send game over message to the loser */
const showGameOver = (player, maxRounds) => {
	gameOver.innerHTML = `
		<h3>GAME OVER</h3>
		<p>You lost with a score of ${player.score}/${maxRounds}</p>
	`
	gameOver.classList.remove("hide");
	playingField.classList.add("hide");
}

/* Send congratulations message to the winner */
const showCongratulations = (player, maxRounds) => {
	congratulations.innerHTML = `
		<h3>Congratulations ${player.alias}!</h3>
		<p>Your score was ${player.score}/${maxRounds}</p>
	`
	congratulations.classList.remove("hide");
	playingField.classList.add("hide");
}



/*
* Event handlers
*/

/* When someone submits their alias, emit "add-player" event to server */
playerForm.addEventListener('submit', e => {
	e.preventDefault();

	playerAlias = document.querySelector('#player-alias').value;
	room = playerForm.room.value;

	socket.emit('add-player', room, playerAlias);
});

/* When player clicks on virus, send player data and emit "player-click" event */
virus.addEventListener('click', () => {
	score ++;
	reactionTime = reactionTime / 1000 + " seconds";

	const playerData = {
		playerAlias,
		score,
		reactionTime,
	}

	socket.emit('player-click', playerData);
});


/*
* Listening for events emitted from server
*/

<<<<<<< HEAD
socket.on('reconnect', () => {
	if (playerAlias) {
		socket.emit('add-player', playerAlias, () => {
			console.log("The server acknowledged the reconnection.");
		});
	}
=======
socket.on('active-players', (players) => {
	showActivePlayers(players);
});

socket.on('remaining-players', (players) => {
	showActivePlayers(players);
});

socket.on('congratulations', (winner, maxRounds) => {
	showCongratulations(winner, maxRounds);
>>>>>>> dev
});

socket.on('player-disconnected', playerAlias => {
	infoFromAdmin(`${playerAlias} left the game`);
});

socket.on('init-game', (imgCords) => {
	initGame(imgCords);
});

<<<<<<< HEAD
socket.on('player-click', (imgCords, players, rounds, maxRounds) => {
	showScore(players);
	showReactionTime(players);
	showRound(rounds, maxRounds)
=======
socket.on('player-click', (imgCords, gameData) => {
	showScore(gameData.players);
	showReactionTime(gameData.players);
	showRound(gameData.rounds, gameData.maxRounds)
>>>>>>> dev
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


