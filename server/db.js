const sqlite3 = require('sqlite3').verbose();

module.exports = class DB {
  constructor() {
    this.connection = new sqlite3.Database('./db/users.db', err => {
      if (err) console.error(err.message);
      console.log('Connected to users.db');
    });
  }

  register(username, password) {
    return new Promise((res, rej) => {
      this.connection.run(
        `INSERT INTO RegisteredUsers(username, password) VALUES (?, ?)`,
        [username, password],
        err => {
          if (err) rej(err);
          else res();
        });
    });
  }

  ifRegistered(username) {
    return new Promise((res, rej) => {
      this.connection.get(
        `SELECT username FROM RegisteredUsers WHERE username = ?`,
        [username],
        (err, row) => {
          if (err) rej(err);
          else if (row) rej("Username already exists. Please try again.");
          else res();
        });
    });
  }

  getUser(username, password) {
    return new Promise((res, rej) => {
      this.connection.get(
        `SELECT password FROM RegisteredUsers WHERE username = ?`,
        [username],
        (err, row) => {
          if (err) rej(err);
          else if (row) {
            if (row.password === password) res(username);
            else rej("Incorrect username or password!");
          }
          else rej("Incorrect username or password!");
        });
    });
  }

  install() {
    this.connection.serialize(() => this.connection.run(`
      CREATE TABLE IF NOT EXISTS RegisteredUsers(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
      );
    `));
  }

  close() {
    this.connection.close();
  }
}
