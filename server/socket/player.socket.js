'use strict';

let Game = require('../model/Game');
let Player = require('../model/Player');

module.exports = function(socket) {

  // VARS

  socket.player = new Player({});
  socket.Game = Game;

  // INIT

  if (Game.join(socket.player)) {
    console.log('Player is joining the table');
    socket.emit('joining', {
      currentPlayer: socket.player,
      gameState: Game.getState()
    });
    socket.broadcast.emit('playerJoining');
  }
  else {
    console.log('Player is waiting in the queue');
    socket.emit('waiting', {
      currentPlayer: socket.player,
      gameState: Game.getState()
    });
    socket.broadcast.emit('playerWaiting');
  }

  // ACTIONS

  socket.on('hit', function() {
    let card = socket.player.hit(Game.table);
    if (card) {
      console.log(socket.player.getName() + ' hits a ' + card);
      let gameState = Game.getState();
      socket.emit('hit', {
        gameState: gameState
      });
      socket.broadcast.emit('hit', {
        gameState: gameState
      });
    }
  });

  socket.on('stick', function() {
    if (socket.player.stick(Game.table)) {
      console.log(socket.player.getName() + ' sticks');
      let gameState = Game.getState();
      socket.emit('hit', {
        gameState: gameState
      });
      socket.broadcast.emit('hit', {
        gameState: gameState
      });
    }
  });

};