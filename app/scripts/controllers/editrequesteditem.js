'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:editRequestedItemCtrl
 * @description
 * # editRequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('editRequestedItemCtrl', function ($scope, $modalInstance) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

  });
