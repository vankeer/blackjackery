'use strict';

class Card {

  constructor(options) {
    this.suit = options.suit;
    this.value = options.value;
    this.visible = options.visible || false;
  }

  getValue() {
    return this.value;
  }

  isVisible() {
    return this.visible;
  }

  setVisible(v) {
    this.visible = v;
  }

  getValue(aceAsEleven = false) {
    switch (this.value) {
      case 'A':
        return aceAsEleven ? 11 : 1;
      case 'J': case 'Q': case 'K':
        return 10;
      default:
        return parseInt(this.value);
    }
  }

  suitString() {
    switch (this.suit) {
      case 's':
        return '&spades;';
      case 'h':
        return '&hearts;';
      case 'd':
        return '&diams;';
      case 'c':
        return '&clubs;';
      default:
        return '';
    }
  }

  valueString() {
    return this.value;
  }

  toString() {
    if (this.visible) {
      return this.valueString() + this.suitString();
    }
    else {
      return '?';
    }
  }

}

export default Card;