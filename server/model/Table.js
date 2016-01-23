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
  COMPARING: 'comparing',
  FINISHED: 'finished',
  RESTARTING: 'restarting'
};

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
        active: i === self.activePlayerPosition,
        cards: self.players[i].getCards().map(mapCardsToString),
        currentState: self.players[i].getCurrentState(),
        name: self.players[i].getName()
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
   * @returns {boolean} was able or to leave or not
   */
  leave(player) {
    for (let i in this.players) {
      if (this.players[i] === player) {
        this.players.splice(i, 1);
        return true;
      }
    }
    for (let i in this.waiting) {
      if (this.waiting[i] === player) {
        this.waiting.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  newGame() {
    this.activePlayerPosition = -1;
    this.currentState = GAME_STATES.STARTING;
    this.dealer.newGame();

    // move players from wait queue to playing
    while (this.waiting.length > 0 && this.players.length < this.maxPlayers) {
      let newPlayer = this.waiting.shift(),
          newPosition = this.players.length;
      this.players.push(newPlayer);
      newPlayer.join(newPosition);
    }

    this.players.forEach(function(p) {
      p.newGame();
    });
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
    let self = this;
    switch (self.currentState) {

      // called repeatedly as long as there are no players
      case GAME_STATES.WAITING:
        if (self.players.length > 0) {
          self.newGame(); // should change state
        }
        return false;

      // called once when starting up a new game
      case GAME_STATES.STARTING:
        this.currentState = GAME_STATES.NEXT_PLAYER;
        return GAME_STATES.STARTING;

      // called once when next player is up
      case GAME_STATES.NEXT_PLAYER:
        if (++self.activePlayerPosition === self.players.length) {
          this.currentState = GAME_STATES.COMPARING;
        }
        else {
          self.players[self.activePlayerPosition].startActing();
          this.currentState = GAME_STATES.ACTING;
        }
        return GAME_STATES.NEXT_PLAYER;

      // called when some player is making a decision
      case GAME_STATES.ACTING:
        return false;

      // called at end of game when at least 1 player is sticking
      // compare scores with dealer
      case GAME_STATES.COMPARING:
        let dealerScore = self.dealer.calculateScore();
        self.dealer.showAllCards();
        while (dealerScore < 17) {
          let card = self.dealer.hit(self);
          dealerScore = self.dealer.calculateScore();
        }
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
        self.currentState = GAME_STATES.FINISHED;
        return GAME_STATES.COMPARING;

      // should be called once at end of every game, to restart:
      case GAME_STATES.FINISHED:
        let self = this;
        self.currentState = GAME_STATES.RESTARTING;
        setTimeout(function() {
          self.currentState = GAME_STATES.WAITING;
        }, 3000);
        return GAME_STATES.FINISHED;

      // called when timeout running:
      case GAME_STATES.RESTARTING:
        return false;

    }

  }

}

export default Table;