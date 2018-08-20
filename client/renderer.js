class Renderer {
  constructor(ctx, width, height) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.leftPlayerScorePosition = { x: 0.15 * width, y : 0.11 * height };
    this.rightPlayerScorePosition = { x: 0.8 * width, y : 0.11 * height };
    this.ctx.font = "40px Arial";
  }

  renderRect(position, size) {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(
      position.x * this.width, position.y * this.height,
      size.width * this.width, size.height * this.height
    );
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  renderLeftScore(score) {
    this.ctx.fillText(score, this.leftPlayerScorePosition.x, this.leftPlayerScorePosition.y);
  }

  renderRightScore(score) {
    this.ctx.fillText(score, this.rightPlayerScorePosition.x, this.rightPlayerScorePosition.y);
  }
}
