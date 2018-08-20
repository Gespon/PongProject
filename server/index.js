const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const Game = require('./game');
const DB = require('./db');
const db = new DB();

const rooms = {};

let getId = (() => {
  let id = 0;
  return () => id++;
})();

const fps = 60;

app.use(express.static('client'))
app.use(express.static(__dirname + '/db'));

app.get('/', res => {
  res.sendFile(path.resolve('./client/index.html'));
});

io.on('connection', socket => {
  const userId = getId();

  socket.on('registration attempt', ({ username, password }) => {
    tryRegister(username, password)
      .then(ans => socket.emit('successful registration', ans))
      .catch(err => socket.emit('unsuccessful registration', err));
  });

  socket.on('login attempt', ({ username, password }) => {
    tryLogin(username, password)
      .then((user) => socket.emit('successful login', user))
      .catch((err) => socket.emit('unsuccessful login', err))
  });

  socket.on('create new room', () => {
    const roomId = getId();

    rooms[roomId] = {
      game: new Game(),
      hostScoket: socket,
      guestScoket: undefined
    };

    socket.emit('new room created', roomId);
  });

  socket.on('join room', roomId => {
    if (rooms[roomId]) {
      rooms[roomId].guestScoket = socket;
      rooms[roomId].game.start();

      rooms[roomId].hostScoket.emit('start');
      rooms[roomId].guestScoket.emit('start');
    }
  });

  socket.on('player action', ({ roomId, action }) => {
    if (rooms[roomId] && rooms[roomId].game.started) {
      if (rooms[roomId].hostScoket == socket)
        rooms[roomId].game.moveLeftPlayer(action);
      else rooms[roomId].game.moveRightPlayer(action);
    }
  });
});

const tryLogin = (username, password) => {
  return new Promise((res, rej) => {
    if (
      username.includes("'") || password.includes("'") ||
      username.length < 5 || password.length < 6
    ) rej("Invalid username or password!");
    else db.getUser(username, password)
      .then(user => res(user))
      .catch(err => rej(err));
  });
};

const tryRegister = (username, password) => {
  return new Promise((res, rej) => {
    if (username.includes("'") || password.includes("'"))
      return rej("Username and password must not contain \" ' \" !");

    if (username.length < 5)
      return rej("Username length must be at least 5 characters!");

    if (password.length < 6)
      return rej("Password length must be at least 6 characters!");

    db.ifRegistered(username).then(() => {
      db.register(username, password)
        .then(() => res("Username registered successfully!"))
        .catch(err => rej(err));
    }).catch(err => rej(err));
  });
};

setInterval(() => {
  for (let roomId in rooms) {
    const game = rooms[roomId].game;

    if (game.started) {
      game.update();

      rooms[roomId].hostScoket.emit('game update', game);
      rooms[roomId].guestScoket.emit('game update', game);
    }

    if (game.started && game.leftPlayerWinner) {
      game.started = false;
      rooms[roomId].hostScoket.emit('won');
      rooms[roomId].guestScoket.emit('lost');
    }

    if (game.started && game.rightPlayerWinner) {
      game.started = false;
      rooms[roomId].hostScoket.emit('lost');
      rooms[roomId].guestScoket.emit('won');
    }
  }
}, 1000 / fps);

server.listen(3030, () => {
  console.log('listening on: port 3030');
});
