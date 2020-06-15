/* SERVER-SIDE SCRIPT */

const debug = require('debug')('kill-the-virus:socket_controller');

let io = null;

let rounds = 0;
const maxRounds = 3;
const players = [];
let player = {};

/* Get names of active players */
function getPlayerNames() {
	return players.map(player => player.alias);
}

/* Generic function for getting a random number */
function getRandomNumber(range) {
	return Math.floor(Math.random() * range)
};

/* Handle player disconnecting */
function handlePlayerDisconnect() {
	for (let i =0; i < players.length; i++) {
		if (players[i].playerId === this.id) {
			players.splice(i,1);
			break;
		}
	}

	io.emit('remaining-players', getPlayerNames());
}

/* Determine the winner/loser and emit personalized messages */
function determineWinner() {

	const winner = players.reduce((max, player) => max.score > player.score ? max : player);
	const loser = players.reduce((min, player) => min.score < player.score ? min : player);

	io.to(winner.playerId).emit('congratulations', { winner, maxRounds });
	io.to(loser.playerId).emit('game-over', {loser, maxRounds });
}

/* Handle when a player clicks a virus */
function handleClick(playerData) {
	rounds++;

	io.emit('reset-timer');

	const playerIndex = players.findIndex((player => player.playerId === this.id));
	players[playerIndex].alias = playerData.playerAlias;
	players[playerIndex].score = playerData.score;
	players[playerIndex].reactionTime = playerData.reactionTime;

	const imgCords = {
		target: {
			x: getRandomNumber(400),
			y: getRandomNumber(400)
		},
		delay: getRandomNumber(5000),
	};

	const gameData = {
		players,
		rounds,
		maxRounds,
	}

	if (rounds < maxRounds) {
		io.emit('new-round', imgCords, gameData);
	} else if (rounds === maxRounds) {
		determineWinner();
		rounds = 0;
	}
}

/* Handle new player joining game */
function handleNewPlayer(playerAlias) {
	const activePlayers = getPlayerNames();

	const imgCords = {
		target: {
			x: getRandomNumber(400),
			y: getRandomNumber(400)
		},
		delay: getRandomNumber(5000),
	};

	player = {
		playerId: this.id,
		alias: playerAlias,
		score: 0,
		reactionTime: "",
	}

	if (activePlayers.length === 0) {
		players.push(player)
	} else if (activePlayers.length === 1) {
		players.push(player)

		// Emit active players and event to start new game
		io.emit('active-players', getPlayerNames());
		io.emit('init-game', imgCords);
	} else {
		console.log("Too many players...")
	}
}

module.exports = function(socket) {
	debug(`Client ${socket.id} connected!`);

	io = this;

	socket.on('disconnect', handlePlayerDisconnect);
	socket.on('player-click', handleClick);
	socket.on('add-player', handleNewPlayer);
}

