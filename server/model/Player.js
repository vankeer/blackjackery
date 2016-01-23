'use strict';

// DEPENDENCIES

let faker = require('faker');

// CONSTANTS

const PLAYER_STATES = {
  WAITING_TO_PLAY: 'Waiting to play',
  WAITING_TO_ACT: 'Waiting to act',
  DECIDING: 'Deciding',
  STICK: 'Stick',
  BUST: 'Bust',
  WIN: 'Wins',
  LOSE: 'Loses'
};

class Player {

  /**
   * @param {Object} options
   * @param {string} [options.currentState]
   * @param {boolean} [options.isDealer = false]
   * @param {string} [options.name]
   * @param {number} [options.position = -1]
   */
  constructor(options) {
    this.cards = [];
    this.currentState = options.currentState || PLAYER_STATES.WAITING_TO_PLAY;
    this.isDealer = options.isDealer || false;
    this.name = options.name || faker.name.firstName();
    this.position = options.position || -1;

    this.stats = {
      wins: 0,
      losses: 0
    };
  }

  /**
   * @returns {Array} cards
   */
  getCards() {
    return this.cards;
  }

  /**
   * @returns {string} currentState
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * @returns {string} name
   */
  getName() {
    return this.name;
  }

  /**
   * @returns {number} position
   */
  getPosition() {
    return this.position;
  }

  /**
   * @returns {Object} PLAYER_STATES
   */
  getPossibleStates() {
    return PLAYER_STATES;
  }

  /**
   * @returns {{wins: number, losses: number}} stats
   */
  getStats() {
    return this.stats;
  }

  /**
   * @param {number} position
   */
  join(position) {
    this.currentState = PLAYER_STATES.WAITING_TO_ACT;
    this.position = position;
  }

  /**
   * Sets currentState to "waiting to play".
   */
  wait() {
    this.currentState = PLAYER_STATES.WAITING_TO_PLAY;
  }

  newGame() {
    this.cards.length = 0;
    this.currentState = PLAYER_STATES.WAITING_TO_ACT;
  }

  /**
   * Deals one card to the Player's cards.
   *
   * @param {Card} card
   */
  deal(card) {
    this.cards.push(card);
  }

  /**
   * @param {Table} table
   * @returns {boolean} can do an action on the given Table
   *
   * TODO fix Table dependency
   */
  canAct(table) {
    return table && table.isActing() && table.getActivePlayerPosition() === this.position;
  }

  showAllCards() {
    this.getCards().forEach(function(card) {
      card.setVisible(true);
    });
  }

  startActing() {
    this.showAllCards();
    this.currentState = PLAYER_STATES.DECIDING;
  }

  /**
   * Hit action on the given Table:
   * deals 1 card from the Deck
   *
   * @param {Table} table
   * @returns {Card} the new Card
   */
  hit(table) {
    if (this.canAct(table) || this.isDealer) {
      let card = table.getDeck().deal();
      card.setVisible(true);
      this.cards.push(card);
      if (this.calculateScore() > 21) {
        this.bust(table);
      }
      return card;
    }
  }

  /**
   * Stick action on the given Table:
   * no more further actions
   *
   * @param {Table} table
   * @returns {boolean} true if the action happened, else false
   */
  stick(table) {
    if (this.canAct(table)) {
      this.currentState = PLAYER_STATES.STICK;
      table.nextPlayer();
      return true;
    }
  }

  /**
   * @returns {number} the score of Player's hand
   */
  calculateScore() {
    let total = 0, hasAce = false;
    for (let c of this.cards) {
      if (c.valueString() === 'A') {
        hasAce = true;
      }
      total += c.getValue();
    }
    if (hasAce && total < 12) {
      total += 10;
    }
    return total;
  }

  /**
   * Player bust on the given Table (score > 21)
   *
   * @param {Table} table
   */
  bust(table) {
    this.currentState = PLAYER_STATES.BUST;
    table.nextPlayer();
  }

  /**
   * Player loses, adjust score and state
   */
  lose() {
    this.currentState = PLAYER_STATES.LOSE;
    this.stats.losses++;
  }

  /**
   * Player wins, adjust score and state
   */
  win() {
    this.currentState = PLAYER_STATES.WIN;
    this.stats.wins++;
  }

}

export default Player;