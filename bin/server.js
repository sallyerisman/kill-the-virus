#!/usr/bin/env node

/**
 * Module dependencies.
 */

require('dotenv').config();

const app = require('../app');
const debug = require('debug')('kill-the-virus:server');
const http = require('http');
const SocketIO = require('socket.io');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
const io = SocketIO(server);

// io.on('connection', require('../controllers/socket_controller'));



const players = {};

/* Get names of active players */
const getActivePlayers = () => {
	return Object.values(players);
}

/* Generic function for getting a random number */
const getRandomNumber = (range) => {
	return Math.floor(Math.random() * range)
};

io.on("connection", (socket) => {

	/* Handle player disconnecting */
	socket.on('disconnect', () => {
		debug(`Socket ${socket.id} left the game :(`);

		// Let player know that the opponent left the game
		if (players[socket.id]) {
			socket.broadcast.emit('player-disconnected', players[socket.id]);
		}

		// Remove player from list of active players
		delete players[socket.id];
	});

	/* Handle new player joining game */
	socket.on('add-player', (playerAlias) => {
		debug("Player '%s' joined the game", playerAlias);

		const activePlayers = getActivePlayers();

		if (activePlayers.length === 0) {
			players[socket.id] = playerAlias;
			console.log("Waiting for an opponent to join...")
		} else if ( activePlayers.length === 1) {
			players[socket.id] = playerAlias;

			// Emit active players
			io.emit('init-game', getActivePlayers());

		} else {
			console.log("Too many players...")
		}
	});

	/* Handle player click */
	socket.on('player-click', (playerAlias) => {
		console.log(playerAlias, "clicked")

		const target = {
			width: getRandomNumber(400),
			height: getRandomNumber(400)
		}

		// Emit new image
		io.emit('player-click', target);

	});

});









/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

