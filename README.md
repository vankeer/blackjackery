# Blackjackery #

A simplified multiplayer blackjack webgame written in ES6 using AngularJS and Express. 

Made as an exercise in rapid prototyping, WebSockets, and using the (M)EAN stack to create a functional MVP in hours.

## Demo

[Click here for a demo](https://blackjackery.herokuapp.com/)

## Installation and Use

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.2.0.

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)

### Developing

 1. Run `npm install` to install server dependencies.
 2. Run `bower install` to install front-end dependencies.
 3. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

### Build & development

Run `grunt build` for building and `grunt serve` for preview.

### Testing

Running `npm test` will run the unit tests with karma.

## Features

 - 1 table
 - 1 dealer with 1 standard deck
 - up to 7 players
	 - if the table is full, new players are put in a wait queue
 - a new game is started as soon as there is at least 1 player connected
 - losses and wins are counted (no betting)
 - players can either hit or stick (no splitting)

## Wireframe

![First wireframe](https://cloud.githubusercontent.com/assets/4358650/12532369/b7806fa6-c212-11e5-8335-3010ef8ba5f3.png)

## Game flow

![Game flow](https://cloud.githubusercontent.com/assets/4358650/12532366/b7573bfe-c212-11e5-84f4-8f3310841ae7.png)

## Player state

![Player state](https://cloud.githubusercontent.com/assets/4358650/12532368/b77e2c82-c212-11e5-8e5e-64f3e9089a50.png)

## Implementation

I've opted to use a Yeoman generator to quickly scaffold a MEAN app: [generator-angular-fullstack](https://github.com/angular-fullstack/generator-angular-fullstack)

Client-side is a simple Angular app and consists of just 1 view with a controller, a service for tracking the game state, and a service for the socket connections.

Server-side is an Express app. The game state is kept in memory with the Game module and is expressed using a simple model:

![Class diagram](https://cloud.githubusercontent.com/assets/4358650/12532367/b76f70fc-c212-11e5-968c-be6f502e435a.png)

For every new client connected, there is a player.socket.js handler that deals with joining and other actions.

The dealer.socket.js handler checks the game state every X ms and changes the game & player states accordingly (see above).

## Backlog

High prio

 - Timer for actions (otherwise players can join and block the game)
 - Show value of current hand
 - Show player and dealer scores
 - Show system messages

Medium

- Better UI (flash changes to model)
- Show people in wait queue

Low prio

- Option to split cards
- Betting
- Multiple tables
- Card animations
- Store games and scores in a MongoDB database