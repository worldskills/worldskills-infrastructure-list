'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventOverviewCtrl
 * @description
 * # EventOverviewCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventOverviewCtrl', function ($scope) {
    $scope.checkNeedForReload();
  });
