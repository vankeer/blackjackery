'use strict';

// DEPENDENCIES

let Deck = require('./Deck');
let Player = require('./Player');

// CONSTANTS

const GAME_STATES = {
  WAITING: 'waiting',
  STARTING: 'starting',
  ACTING: 'acting',
  NEXT_PLAYER: 'turn',
  DEALER_REVEAL: 'dealerReveal',
  DEALER_TURN: 'dealerTurn',
  DEALING: 'dealing',
  COMPARING: 'comparing',
  FINISHED: 'finished',
  RESTARTING: 'restarting'
};

const TIME_UNTIL_NEXT_GAME = 5000;
const DEALING_TIME = 2000;

class Table {

  /**
   * @param {Object} options
   * @param {number} [options.activePlayerPosition]
   * @param {string} [options.currentState]
   * @param {number} [options.maxPlayers = 7]
   */
  constructor(options) {
    // set options
    this.activePlayerPosition = options.activePlayerPosition || -1;
    this.currentState = options.currentState || GAME_STATES.WAITING;
    this.maxPlayers = options.maxPlayers || 7;

    // init table
    this.dealer = new Player({
      isDealer: true,
      name: 'Dealer'
    });
    this.deck = new Deck();
    this.players = [];
    this.waiting = [];
  }

  /**
   * @returns {Object} object representing game state
   */
  getState() {
    let mapCardsToString = function(c) { return c.toString(); };
    let self = this;
    let dealerOutput = {
      cards: self.dealer.getCards().map(mapCardsToString),
      currentState: self.dealer.getCurrentState()
    };
    let playersOutput = [];
    for (let i in self.players) {
      playersOutput.push({
        id: self.players[i].getId(),
        active: i === self.activePlayerPosition,
        cards: self.players[i].getCards().map(mapCardsToString),
        currentState: self.players[i].getCurrentState(),
        name: self.players[i].getName(),
        position: self.players[i].getPosition(),
        stats: self.players[i].getStats()
      });
    }
    return {
      activePlayerPosition: self.activePlayerPosition,
      dealer: dealerOutput,
      currentState: self.currentState,
      maxPlayers: self.maxPlayers,
      players: playersOutput,
      waiting: self.waiting
    };
  }

  /**
   * @returns {Deck}
   */
  getDeck() {
    return this.deck;
  }

  /**
   * @returns {number}
   */
  getActivePlayerPosition() {
    return this.activePlayerPosition;
  }

  /**
   * @returns {boolean}
   */
  isActing() {
    return this.currentState === GAME_STATES.ACTING;
  }

  /**
   * @param {Player} player
   * @returns {boolean} was able to join or not
   */
  join(player) {
    if (this.players.length === this.maxPlayers ||
      (this.currentState !== GAME_STATES.WAITING && this.currentState !== GAME_STATES.RESTARTING)) {
      player.wait();
      this.waiting.push(player);
      return false;
    }
    else {
      player.join(this.players.length);
      this.players.push(player);
      return true;
    }
  }

  /**
   * @param {Player} player
   */
  leave(player) {
    let goToNextPlayer = false;
    if (player.getCurrentState() === player.getPossibleStates().DECIDING) {
      player.leave();
      goToNextPlayer = true;
    }
    else {
      player.leave();
    }
    // check if there are still players left
    let stillPlaying = false;
    for (let p of this.players) {
      if (!p.hasLeft()) {
        stillPlaying = true;
        break;
      }
    }
    if (stillPlaying) {
      if (goToNextPlayer) {
        this.nextPlayer();
      }
    }
    else {
      this.reset();
    }
  }

  newGame() {

    // remove players who left
    for (let i = this.players.length - 1; i >= 0; i--) {
      if (this.players[i].getCurrentState() === this.players[i].getPossibleStates().LEFT) {
        this.players.splice(i, 1);
      }
    }
    for (let i = this.waiting.length - 1; i >= 0; i--) {
      if (this.waiting[i].getCurrentState() === this.waiting[i].getPossibleStates().LEFT) {
        this.waiting.splice(i, 1);
      }
    }

    // move players from wait queue to playing
    while (this.waiting.length > 0 && this.players.length < this.maxPlayers) {
      let newPlayer = this.waiting.shift(),
        newPosition = this.players.length;
      this.players.push(newPlayer);
      newPlayer.join(newPosition);
    }

    // still players left?
    if (this.players.length === 0) {
      return;
    }

    // start new game
    this.activePlayerPosition = -1;
    this.currentState = GAME_STATES.STARTING;
    this.dealer.newGame();
    for (let pos = 0; pos < this.players.length; pos++) {
      this.players[pos].newGame(pos);
    }
    this.deck.refresh();
    this.deal();
  }

  deal() {
    let self = this;
    let targets = [self.dealer].concat(self.players);
    // first round - invisible cards
    targets.forEach(function(target) {
      target.deal(self.deck.deal());
    });
    // second round - visible cards
    targets.forEach(function(target) {
      let card = self.deck.deal();
      card.setVisible(true);
      target.deal(card);
    });
  }

  /**
   * Resets to first state
   */
  reset() {
    this.currentState = GAME_STATES.WAITING;
  }

  /**
   * Sets state to next player
   */
  nextPlayer() {
    this.currentState = GAME_STATES.NEXT_PLAYER;
  }

  /**
   * Game runner
   *
   * @returns {string|boolean} event to broadcast
   */
  tick() {
    let self = this,
        dealerScore = 0;
    switch (self.currentState) {

      // called repeatedly as long as there are no players
      case GAME_STATES.WAITING:
        if (self.players.length > 0) {
          self.newGame(); // should change state
        }
        return false;

      // called once when starting up a new game
      case GAME_STATES.STARTING:
        self.currentState = GAME_STATES.NEXT_PLAYER;
        return GAME_STATES.STARTING;

      // called once when next player is up
      case GAME_STATES.NEXT_PLAYER:
        if (++self.activePlayerPosition >= self.players.length) {
          self.currentState = GAME_STATES.DEALER_REVEAL;
        }
        else {
          if (self.players[self.activePlayerPosition].hasLeft()) {
            self.nextPlayer();
          }
          else {
            self.players[self.activePlayerPosition].startActing();
            self.currentState = GAME_STATES.ACTING;
          }
        }
        return GAME_STATES.NEXT_PLAYER;

      // called when some player is making a decision
      case GAME_STATES.ACTING:
        return false;

      // called when the dealer is revealing his cards
      case GAME_STATES.DEALER_REVEAL:
        dealerScore = self.dealer.calculateScore();
        self.dealer.showAllCards();
        if (dealerScore < 17) {
          self.currentState = GAME_STATES.DEALING;
          setTimeout(function() {
            self.currentState = GAME_STATES.DEALER_TURN
          }, DEALING_TIME);
        }
        else {
          self.currentState = GAME_STATES.DEALING;
          setTimeout(function() {
            self.currentState = GAME_STATES.COMPARING;
          }, DEALING_TIME);
        }
        return GAME_STATES.DEALER_REVEAL;

      // called when the dealer is "dealing" (to build suspense)
      case GAME_STATES.DEALING:
        return false;

      // called when the dealer dealt a card to himself
      case GAME_STATES.DEALER_TURN:
        self.dealer.hit(self);
        dealerScore = self.dealer.calculateScore();
        if (dealerScore < 17) {
          self.currentState = GAME_STATES.DEALING;
          setTimeout(function() {
            self.currentState = GAME_STATES.DEALER_TURN
          }, DEALING_TIME);
        }
        else {
          self.currentState = GAME_STATES.DEALING;
          setTimeout(function() {
            self.currentState = GAME_STATES.COMPARING;
          }, DEALING_TIME);
        }
        return GAME_STATES.DEALER_TURN;

      // called at end of game when at least 1 player is sticking
      // compare scores with dealer
      case GAME_STATES.COMPARING:
        dealerScore = self.dealer.calculateScore();
        self.players.forEach(function(player) {
          let playerScore = player.calculateScore();
          if (dealerScore > 21) {
            if (playerScore > 21) {
              // TODO both lose or track "ties"?
              self.dealer.lose();
              player.lose();
            }
            else {
              self.dealer.lose();
              player.win();
            }
          }
          else {
            if (playerScore <= dealerScore) {
              self.dealer.win();
              player.lose();
            }
            else if (playerScore > dealerScore && playerScore <= 21) {
              self.dealer.lose();
              player.win();
            }
            else {
              // player is bust
              self.dealer.win();
              player.lose();
            }
          }
        });

        // TODO another state when transitioning from comparing to finished
        self.currentState = GAME_STATES.DEALING;
        setTimeout(function() {
          self.currentState = GAME_STATES.FINISHED
        }, DEALING_TIME);

        return GAME_STATES.COMPARING;

      // should be called once at end of every game, to restart:
      case GAME_STATES.FINISHED:
        let self = this;
        self.currentState = GAME_STATES.RESTARTING;
        setTimeout(function() {
          self.currentState = GAME_STATES.WAITING;
        }, TIME_UNTIL_NEXT_GAME);
        return GAME_STATES.FINISHED;

      // called when timeout running:
      case GAME_STATES.RESTARTING:
        return false;

    }

  }

}

export default Table;