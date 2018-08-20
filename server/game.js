module.exports = class Game {
  constructor() {
    this.started = false;

    this.playerSize = { width: 0.01, height: 0.08 }

    this.playerWallOffset = 0.01;

    const ar = 16 / 9;
    const size = 0.02;

    this.ballSize = { width: size, height: size * ar };
    this.playerLeftYPos = 0.5;
    this.playerRightYPos = 0.5;
    this.playerSpeed = 0.01;

    this.ballPosition = { x: 0.5, y: 0.5 };
    this.ballVelocity = { x: 0.004, y: 0.003 };

    this.playerLeftScore = 0;
    this.playerRightScore = 0;
    this.maxScore = 3;

    this.leftPlayerWinner = false;
    this.rightPlayerWinner = false;
  }

  start() {
    this.started = true;
  }

  update() {
    let newX = this.ballPosition.x + this.ballVelocity.x;
    let newY = this.ballPosition.y + this.ballVelocity.y;

    if (newX + this.ballSize.width > 1) {
      this.playerLeftScore++;
      this.restart();
      return;
    }
    else if (newX < 0) {
      this.playerRightScore++;
      this.restart();
      return;
    }
    else if (newY + this.ballSize.height > 1 || newY < 0) {
      this.ballVelocity.y = -(this.ballVelocity.y + this.ballVelocity.y/100);
    }
    else if (
      newX + this.ballSize.width > (1 - this.playerWallOffset - this.playerSize.width) &&
      newY < (this.playerRightYPos + this.playerSize.height) &&
      (newY + this.ballSize.height) > this.playerRightYPos
    ) {
      this.ballVelocity.x = -(this.ballVelocity.x + this.ballVelocity.x/85);
    }
    else if (
      newX < (this.playerWallOffset + this.playerSize.width) &&
      newY < (this.playerLeftYPos + this.playerSize.height) &&
      (newY + this.ballSize.height) > this.playerLeftYPos
    ) {
      this.ballVelocity.x = -(this.ballVelocity.x + this.ballVelocity.x/85);
    }

    this.ballPosition.x = newX;
    this.ballPosition.y = newY;
  }

  restart() {
    this.updateWinners();
    this.ballPosition.x = this.ballPosition.y = 0.5;
    this.ballVelocity.x = Math.random() * 0.003 + 0.003;
    this.ballVelocity.y = Math.random() * 0.004 + 0.002;
    Math.random() > 0.5 ? this.ballVelocity.x = -this.ballVelocity.x : null;
    Math.random() > 0.5 ? this.ballVelocity.y = -this.ballVelocity.y : null;
  }

  updateWinners() {
    if (this.playerLeftScore >= 3) this.leftPlayerWinner = true;
    if (this.playerRightScore >= 3) this.rightPlayerWinner = true;
  }

  moveLeftPlayer(action) {
    const newPosUp = this.playerLeftYPos - this.playerSpeed;
    const newPosDown = this.playerLeftYPos + this.playerSpeed;

    if (action === 'up' && newPosUp > 0)
      this.playerLeftYPos = newPosUp;
    else if (action === 'down' && newPosDown + this.playerSize.height < 1)
      this.playerLeftYPos = newPosDown;
  }

  moveRightPlayer(action) {
    const newPosUp = this.playerRightYPos - this.playerSpeed;
    const newPosDown = this.playerRightYPos + this.playerSpeed;

    if (action === 'up' && newPosUp > 0)
      this.playerRightYPos = newPosUp;
    else if (action === 'down' && newPosDown + this.playerSize.height < 1)
      this.playerRightYPos = newPosDown;
  }
}
