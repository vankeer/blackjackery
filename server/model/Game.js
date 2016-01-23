'use strict';

let Table = require('./Table');

let thisGame = {
  table: new Table({})
};

module.exports = {
  getState: thisGame.table.getState.bind(thisGame.table),
  table: thisGame.table,
  join: thisGame.table.join.bind(thisGame.table),
  leave: thisGame.table.leave.bind(thisGame.table),
  reset: thisGame.table.reset.bind(thisGame.table),
  tick: thisGame.table.tick.bind(thisGame.table)
};