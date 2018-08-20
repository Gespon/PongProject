# PongProject
### Pong online game

A simple browser based game of [Pong](https://en.wikipedia.org/wiki/Pong) - two players control a paddle each and try to send the projectile behind the opponent's paddle.
Each user must first register an account or login into an already existing one. After that, any user can create a room or join an existing one based on its ID.
When a user creates a room, its unique ID will be displayed via an alert message. The user must then send that room ID to the person they would like to challenge.
The other person then clicks on 'Join Room' and enters the room ID via the prompt. The host (person who created the room) is always on the left, and the guest is always on the right.
The game is played until one of the players reaches a score of 3, after which they are both returned to the main screen.

## Libraries used:
- Express
- Socket.io
- Sqlite3
