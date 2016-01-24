'use strict';

(function() {

class MainController {

  constructor(Game, Socket) {
    this.getCurrentPlayer = Game.getCurrentPlayer;
    this.getGameState = Game.getGameState;
    this.getMsg = Game.getMsg;

    // dependencies
    this.Socket = Socket;
  }

  hit() {
    this.Socket.hit();
  }

  stick() {
    this.Socket.stick();
  }

}

angular.module('blackjackeryApp')
  .controller('MainController', MainController);

})();
