// /* SERVER-SIDE SCRIPT */

// const debug = require('debug')('kill-the-virus:socket_controller');

// const players = {};

// /* Get names of active players */
// function getActivePlayers() {
// 	return Object.values(players);
// }

// /* Handle player disconnecting */
// function handlePlayerDisconnect() {
// 	debug(`Socket ${this.id} left the game :(`);

// 	// Let player know that the opponent left the game
// 	if (players[this.id]) {
// 		this.broadcast.emit('player-disconnected', players[this.id]);
// 	}

// 	// Remove player from list of active players
// 	delete players[this.id];
// }

// /* Handle when a player clicks */
// function handleClick (click) {
// 	debug("Someone clicked");
// }

// /* Handle new player joining game */
// function handleNewPlayer(playerAlias) {
// 	debug("Player '%s' joined the game", playerAlias);

// 	const activePlayers = getActivePlayers();

// 	if (activePlayers.length === 0) {
// 		players[this.id] = playerAlias;
// 		console.log("Waiting for an opponent to join...")
// 	} else if ( activePlayers.length === 1) {
// 		players[this.id] = playerAlias;

// 		// Broadcast active players
// 		this.emit('init-game', getActivePlayers());
// 	} else {
// 		console.log("Too many players...")
// 	}
// }

// module.exports = function(socket) {
// 	debug(`Client ${socket.id} connected!`);

// 	socket.on('disconnect', handlePlayerDisconnect);
// 	socket.on('player-click', handleClick);
// 	socket.on('add-player', handleNewPlayer);
// }



