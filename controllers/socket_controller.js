/* SERVER-SIDE SCRIPT */

const debug = require('debug')('kill-the-virus:socket_controller');
const moment = require('moment');

let io = null;

const players = {};

/* Get names of active players */
function getActivePlayers() {
	return Object.values(players);
}

/* Generic function for getting a random number */
function getRandomNumber(range) {
	return Math.floor(Math.random() * range)
};

function startTimer() {
	let timestamp = moment().startOf("day");
	setInterval(function () {
		timestamp.add(1, 'second');
		io.emit('start-timer', timestamp.format('HH:mm:ss'));
	}, 1000);
}

/* Handle player disconnecting */
function handlePlayerDisconnect() {
	debug(`Socket ${this.id} left the game :(`);

	// Let player know that the opponent left the game
	if (players[this.id]) {
		this.broadcast.emit('player-disconnected', players[this.id]);
	}

	// Remove player from list of active players
	delete players[this.id];
}

/* Handle when a player clicks */
function handleClick(playerAlias) {
	console.log(playerAlias, "clicked")

	startTimer();

	const data = {
		target: {
			x: getRandomNumber(400),
			y: getRandomNumber(400)
		},
		delay: getRandomNumber(5000),
	}

	// Emit new image
	io.emit('player-click', data);
}

/* Handle new player joining game */
function handleNewPlayer(playerAlias) {
	debug("Player '%s' joined the game", playerAlias);

	const activePlayers = getActivePlayers();

	if (activePlayers.length === 0) {
		players[this.id] = playerAlias;
		console.log("Waiting for an opponent to join...")
	} else if ( activePlayers.length === 1) {
		players[this.id] = playerAlias;

		// Emit active players
		io.emit('init-game', getActivePlayers());
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


