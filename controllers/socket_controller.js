/* SERVER-SIDE SCRIPT */

const debug = require('debug')('kill-the-virus:socket_controller');

let io = null;
let rounds = 0;
const maxRounds = 3;
const players = [];
let player = {};

const rooms = [
	{
		name: "Corona",
		players: {},
	},
	{
		name: "Ebola",
		players: {},
	},
	{
		name: "SARS",
		players: {},
	},
	{
		name: "Swine flu",
		players: {},
	},
	{
		name: "Zika",
		players: {},
	}
];




/* Get names of active players */
function getActivePlayers() {
	return players.map(player => player.alias);
}

/* Generic function for getting a random number */
function getRandomNumber(range) {
	return Math.floor(Math.random() * range)
};

/* Get names of rooms */
function getRoomNames() {
	return rooms.map(room => room.name);
}

/* Handle player disconnecting */
function handlePlayerDisconnect() {
	for (let i =0; i < players.length; i++) {
		if (players[i].playerId === this.id) {
		players.splice(i,1);
		break;
		}
   	}

	io.emit('active-players', getActivePlayers());
}

/* Determine the winner/loser and emit personalized messages */
function determineWinner() {

	const winner = players.reduce((max, player) => max.score > player.score ? max : player);
	const loser = players.reduce((min, player) => min.score < player.score ? min : player);

	io.to(winner.playerId).emit('congratulations', winner, maxRounds);

	io.to(loser.playerId).emit('game-over', loser, maxRounds);
}

/* Handle when a player clicks a virus */
function handleClick(playerAlias, score, reactionTime) {
	rounds++;

	io.emit('reset-timer');

	const playerIndex = players.findIndex((player => player.playerId === this.id));
	players[playerIndex].alias = playerAlias;
	players[playerIndex].score = score;
	players[playerIndex].reactionTime = reactionTime;

	const imgCords = {
		target: {
			x: getRandomNumber(400),
			y: getRandomNumber(400)
		},
		delay: getRandomNumber(5000),
	};

	if (rounds < maxRounds) {
		io.emit('player-click', imgCords, players, rounds, maxRounds);
	} else if (rounds === maxRounds) {
		determineWinner();
	}
}

/* Get a list of all rooms */
function handleGetRoomList(callback) {
	callback(getRoomNames());
}

/* Handle new player joining game */
function handleNewPlayer(room, playerAlias) {
	const activePlayers = getActivePlayers();

	this.join(room);

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
		io.in(room).emit('active-players', getActivePlayers());
		io.in(room).emit('init-game', imgCords);
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
	socket.on('get-room-list', handleGetRoomList)
}

