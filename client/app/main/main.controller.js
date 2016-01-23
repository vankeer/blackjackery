'use strict';

(function() {

class MainController {

  constructor(Game) {
    this.getCurrentPlayer = Game.getCurrentPlayer;
    this.getGameState = Game.getGameState;
  }

  hit() {
  }

  stick() {
  }

}

angular.module('blackjackeryApp')
  .controller('MainController', MainController);

})();
