/* SERVER-SIDE SCRIPT */

const debug = require('debug')('kill-the-virus:socket_controller');
const moment = require('moment');

let io = null;
let rounds = 0;

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

// const players = {};
const players = [];
let player = {};


/* Get names of active players */
function getActivePlayers() {
	// return Object.values(players);
	return players.map(player => player.alias);
}

/* Generic function for getting a random number */
function getRandomNumber(range) {
	return Math.floor(Math.random() * range)
};

/* Get names of active players */
function getRoomNames() {
	return rooms.map(room => room.name);
}

function startTimer() {
	let timestamp = moment().startOf("day");
	setInterval(function () {
		timestamp.add(1, 'second');
		io.emit('start-timer', timestamp.format('HH:mm:ss'));
	}, 1000);
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


/* Handle when a player clicks */
function handleClick(playerAlias, score, reactionTime) {

	const playerIndex = players.findIndex((player => player.playerId === this.id));

	players[playerIndex].alias = playerAlias;
	players[playerIndex].score = score;
	players[playerIndex].reactionTime = reactionTime;

	rounds++;

	const imgCords = {
		target: {
			x: getRandomNumber(400),
			y: getRandomNumber(400)
		},
		delay: getRandomNumber(5000),
	};

	if (rounds < 10) {
		// Emit event and start timer
		io.emit('player-click', imgCords, players);
		startTimer();
	} else if (rounds === 10) {
		io.emit('game-over');
	}
}

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
		// players[this.id] = playerAlias;
		players.push(player)
	} else if (activePlayers.length === 1) {
		// players[this.id] = playerAlias;
		players.push(player)

		// Emit active players
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



