'use strict';

describe('Controller: MainController', function() {

  // load the controller's module
  beforeEach(module('blackjackeryApp'));
  beforeEach(module('stateMock'));

  var scope;
  var MainController;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(
    _$httpBackend_,
    $controller,
    $rootScope,
    $state,
    Game // TODO replace with mock service
  ) {
    $httpBackend = _$httpBackend_;

    scope = $rootScope.$new();
    state = $state;
    MainController = $controller('MainController', {
      $scope: scope,
      Game: Game
    });
  }));

  it('should have hit and stick actions', function() {
    expect(MainController.hit).not.toBeUndefined();
    expect(MainController.stick).not.toBeUndefined();
  });

});
