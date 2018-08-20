class Auth {
  login(user) {
    window.localStorage.setItem('user', user);
  }

  logout() {
    window.localStorage.clear();
  }

  isLogged() {
    return !!this.getUser();
  }

  getUser() {
    return window.localStorage.getItem('user');
  }
}

class UserInput {
  constructor(handler) {
    this.handler = handler
    this.action = 'stay';

    window.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp') this.action = 'up';
      if (event.key === 'ArrowDown') this.action = 'down';
    });

    window.addEventListener('keyup', event => {
      this.action = 'stay';
    });
  }

  update() {
    this.handler(this.action);
  }
}

const app = new class App {
  constructor() {
    const width = 800;
    const height = 450;

    const canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    this.socket = io();
    this.auth = new Auth();
    this.renderer = new Renderer(ctx, width, height);
    this.roomId = undefined;
    this.userInput = new UserInput(action => this.socket.emit('player action', {
      roomId: this.roomId, action
    }));

    if (this.auth.isLogged()) this.goToPage('hub');
    else this.goToPage('auth');

    this.setupLogin();
    this.setupRegistration();

    this.socket.on('new room created', roomId => {
      alert('Room Id: ' + roomId);
      this.roomId = roomId;
      document.getElementById("cancelRoom").addEventListener('click', () => this.cancelRoom());
      this.goToPage('waitingForPartner');
    });

    

    this.socket.on('start', () => this.goToPage('game'));

    this.socket.on('game update', game => this.update(game));

    this.socket.on('won', () => this.endGame('You won the game!'));
    this.socket.on('lost', () => this.endGame('You lost the game!'));
  }

  endGame(message) {
    alert(message);
    this.roomId = undefined;
    this.goToPage('hub');
  }

  goToPage(pageId) {
    const main = document.getElementById('main');

    Array.from(main.children).forEach(page => {
      page.style.display = 'none';
    });

    document.getElementById(pageId).style.display = 'block';
  }

  logout() {
    this.auth.logout();
    this.goToPage('auth');
  }

  cancelRoom() {
    this.roomId = undefined;
    this.goToPage('hub');
  }

  setupRegistration() {
    document.getElementById('regButton').addEventListener('click', () => {
      let usernameInput = document.getElementById('username');
      let passwordInput = document.getElementById('password');

      this.socket.emit('registration attempt', {
        username: usernameInput.value,
        password: passwordInput.value
      });

      usernameInput.value = '';
      passwordInput.value = '';
    });

    this.socket.on('successful registration', ans => {
      document.getElementById('infoMessage').innerHTML = ans;
    });

    this.socket.on('unsuccessful registration', err => {
      document.getElementById('infoMessage').innerHTML = err;
    });
  }

  setupLogin() {
    document.getElementById('logButton').addEventListener('click', () => {
      let usernameInput = document.getElementById('username');
      let passwordInput = document.getElementById('password')

      this.socket.emit('login attempt', {
        username: usernameInput.value,
        password: passwordInput.value
      });

      usernameInput.value = '';
      passwordInput.value = '';
    });

    this.socket.on('successful login', user => {
      this.auth.login(user);
      this.goToPage('hub');
      document.getElementById('logout').addEventListener('click', () => this.logout());
      document.getElementById('newroom').addEventListener('click', () => this.newRoom());
      document.getElementById('joinroom').addEventListener('click', () => this.joinRoom());
    });

    this.socket.on('unsuccessful login', err => {
      document.getElementById('infoMessage').innerHTML = err;
    });
  }

  update(game) {
    this.userInput.update();
    this.renderer.clear();

    this.renderer.renderRect(game.ballPosition, game.ballSize);

    this.renderer.renderRect({
      x: game.playerWallOffset,
      y: game.playerLeftYPos
    }, game.playerSize);

    this.renderer.renderRect({
      x: 1 - game.playerWallOffset - game.playerSize.width,
      y: game.playerRightYPos
    }, game.playerSize);

    this.renderer.renderLeftScore(game.playerLeftScore);
    this.renderer.renderRightScore(game.playerRightScore);
  }

  newRoom() {
    this.socket.emit('create new room');
  }

  joinRoom() {
    this.roomId = prompt('room id');
    this.socket.emit('join room', this.roomId);
  }
}
