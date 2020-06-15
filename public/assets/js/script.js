/* CLIENT-SIDE SCRIPT */

const socket = io();

const activePlayers = document.querySelector('#active-players');
const adminInfo = document.querySelector('#admin-info');
const congratulations = document.querySelector('#congratulations');
const currentScore = document.querySelector('#current-score');
const gameOver = document.querySelector('#game-over');
const playerForm = document.querySelector('#player-form');
const playingField = document.querySelector('#playing-field');
const reactionTimes = document.querySelector('#reaction-times');
const roundsPlayed = document.querySelector('#rounds-played');
const timer = document.querySelector('#timer');
const virus = document.getElementById('img-virus-play');

let currTime = null;
let playerAlias = "";
let reactionTime = "";
let score = 0;
let timeOfImg = null;


/*
* Render functions
*/

/* Log player connect/disconnect events */
const infoFromAdmin = (data) => {
	const notification = document.createElement('li');

	notification.classList.add('notification');
	notification.innerHTML = data;

	adminInfo.appendChild(notification);
}

/* Show all player in the current game */
const showActivePlayers = (players) => {
	activePlayers.innerHTML = players.map(player => `<li class="player">${player}</li>`).join("");
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

/* Send game over message to the loser */
const showGameOver = (player, maxRounds) => {
	gameOver.innerHTML = `
		<h3>GAME OVER</h3>
		<p>You lost with a score of ${player.score}/${maxRounds}</p>
	`
	gameOver.classList.remove("hide");
	playingField.classList.add("hide");
}

/* Show the most recent winning reaction time of both players */
const showReactionTime = (players) => {
	reactionTimes.innerHTML = "";
	reactionTimes.innerHTML = players.map(player => `<li>${player.alias}: ${player.reactionTime}</li>`).join("");
}

/* Show number of rounds played */
const showRound = (rounds, maxRounds) => {
	roundsPlayed.innerHTML = "";

	const roundEl = document.createElement('li');
	roundEl.innerHTML = `${rounds}/${maxRounds}`;

	roundsPlayed.appendChild(roundEl);
}

/* Show current score of both players */
const showScore = (players) => {
	currentScore.innerHTML = "";
	currentScore.innerHTML = players.map(player => `<li>${player.alias}: ${player.score}</li>`).join("");
}






/*
* Main functions
*/

/* Handle when a player disconnects */
const handleDisconnect = (playerAlias) => {
	infoFromAdmin(`${playerAlias} left the game`);
	resetTimer();
}

/* Show virus in new location */
const imgCoordinates = (target) => {
	virus.style.display = "inline";
	virus.style.left = target.x + "px";
	virus.style.top = target.y + "px";
}

/* Start a new game */
const initGame = (imgCords) => {

	infoFromAdmin("Starting game...");

	setTimeout(() => {
		adminInfo.innerHTML = "";
		virus.classList.remove('hide');
		startRound(imgCords);
	}, 3000);
}

/* Empty timer field */
const resetTimer = () => {
	clearInterval(currTime);
	timer.innerHTML = "";
}

/* Show timer */
const showTimer = (timeOfImg) => {
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

/* Start new round */
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



/*
* Event handlers
*/

/* When someone submits their alias, emit "add-player" event to server */
playerForm.addEventListener('submit', e => {
	e.preventDefault();

	playerAlias = document.querySelector('#player-alias').value;

	socket.emit('add-player', playerAlias, (status) => {
		if (status.joinGame) {
			document.querySelector('#start').classList.add('hide');
			document.querySelector('#game-view').classList.remove('hide');

			showActivePlayers(status.activePlayers);
		}
	});
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

socket.on('active-players', (players) => {
	showActivePlayers(players);
});

socket.on('congratulations', ({ winner, maxRounds }) => {
	showCongratulations(winner, maxRounds);
	resetTimer();
});

socket.on('game-over', ({ loser, maxRounds }) => {
	showGameOver(loser, maxRounds);
	resetTimer();
});

socket.on('init-game', (imgCords) => {
	initGame(imgCords);
});

socket.on('new-round', (imgCords, gameData) => {
	showScore(gameData.players);
	showReactionTime(gameData.players);
	showRound(gameData.rounds, gameData.maxRounds)
	startRound(imgCords);
});

socket.on('player-disconnected', playerAlias => {
	handleDisconnect (playerAlias);
});

socket.on('reconnect', () => {
	if (playerAlias) {
		socket.emit('add-player', playerAlias, () => {
			console.log("The server acknowledged the reconnection.");
		});
	}
});

socket.on('remaining-players', (players) => {
	showActivePlayers(players);
});

socket.on('reset-timer', () => {
	resetTimer();
});





