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
      Game.setCurrentPlayer(data.currentPlayer);
      Game.refresh(data.gameState);
    });

    socket.on('waiting', function (data) {
      $log.info('Waiting for next game');
      Game.setCurrentPlayer(data.currentPlayer);
      Game.refresh(data.gameState);
    });

    socket.on('starting', function(data) {
      $log.info('Game starting');
      Game.refresh(data.gameState);
    });

    socket.on('turn', function(data) {
      $log.info('Next player');
      Game.refresh(data.gameState);
    });

    socket.on('hit', function(data) {
      $log.info('Hit');
      Game.refresh(data.gameState);
    });

    socket.on('stick', function(data) {
      $log.info('Stick');
      Game.refresh(data.gameState);
    });

    socket.on('comparing', function(data) {
      $log.info('Comparing');
      Game.refresh(data.gameState);
    });

    socket.on('bust', function(data) {
      $log.info('All players bust');
      Game.refresh(data.gameState);
    });

    socket.on('finished', function(data) {
      $log.info('Game finished');
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
