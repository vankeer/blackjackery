'use strict';

const TICK_INTERVAL = 700;

let Game = require('../model/Game');

module.exports = function(socket) {

  /**
   * Checks game state every interval
   * and emits event to all connected clients if necessary.
   */
  setInterval(function() {

    let toEmit = Game.tick();
    if (toEmit) {
      let gameState = Game.getState();
      console.log('Emitting: ' + toEmit);
      socket.emit(toEmit, {
        gameState: gameState
      });
    }

  }, TICK_INTERVAL);

};