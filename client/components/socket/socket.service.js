/* global io */
'use strict';

angular.module('blackjackeryApp')
  .factory('Socket', function($log, Game, socketFactory) {

    var ioSocket = io('', {
      path: '/socket.io-client'
    });

    var socket = socketFactory({ ioSocket });

    socket.on('joining', function (data) {
      $log.info('Joined game');
      Game.setMsg('Welcome to the game!');
      Game.setCurrentPlayer(data.currentPlayer);
      Game.refresh(data.gameState);
    });

    socket.on('waiting', function (data) {
      $log.info('Waiting for next game');
      Game.setMsg('Waiting for next game...');
      Game.setCurrentPlayer(data.currentPlayer);
      Game.refresh(data.gameState);
    });

    socket.on('starting', function(data) {
      $log.info('Game starting');
      Game.setMsg('New game is starting!');
      Game.refresh(data.gameState);
    });

    socket.on('turn', function(data) {
      $log.info('Next player');
      if (data.gameState.activePlayerPosition === Game.getCurrentPlayer().position) {
        Game.setMsg('You are up! Please choose an action.');
      }
      else {
        Game.setMsg('Next player...');
      }
      Game.refresh(data.gameState);
    });

    socket.on('hit', function(data) {
      $log.info('Hit');
      Game.setMsg('Player hits');
      Game.refresh(data.gameState);
    });

    socket.on('stick', function(data) {
      $log.info('Stick');
      Game.setMsg('Player sticks');
      Game.refresh(data.gameState);
    });

    socket.on('comparing', function(data) {
      $log.info('Comparing');
      Game.setMsg('Comparing scores...');
      Game.refresh(data.gameState);
    });

    socket.on('finished', function(data) {
      $log.info('Game finished');
      Game.setMsg('Game finished! A new game will start in 5 seconds.');
      Game.refresh(data.gameState);
    });

    socket.on('disconnected', function(data) {
      $log.info('Player disconnected');
      Game.refresh(data.gameState);
    });

    return {
      socket,

      hit() {
        $log.info('Emitting action: hit');
        socket.emit('hit');
      },

      stick() {
        $log.info('Emitting action: stick');
        socket.emit('stick');
      }
    };
  });
