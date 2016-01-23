'use strict';

let Card = require('./Card');

const suits = ['s', 'h', 'd', 'c'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class Deck {

  constructor() {
    this.cards = [];
    this.refresh();
  }

  getCards() {
    return this.cards;
  }

  init() {
    let self = this;
    self.cards.length = 0;
    suits.forEach(function(suit) {
      values.forEach(function(value) {
        self.cards.push(new Card({suit: suit, value: value}));
      });
    });
  }

  /**
   * Shuffles Deck using Fisher-Yates algorithm
   * credit to: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
   */
  shuffle() {
    let currentIndex = this.cards.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }

  deal() {
    return this.cards.shift();
  }

  refresh() {
    this.init();
    this.shuffle();
  }

}

export default Deck;