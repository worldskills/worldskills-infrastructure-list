'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ApplicationCtrl
 * @description
 * # ApplicationCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ApplicationCtrl', function ($q, Auth, $scope, $state, auth, WSAlert) {

    $scope.auth = auth;
    
    $scope.logout = function (e) {
        auth.logout();
    };

    $scope.$on('$stateChangeStart', function () {
        WSAlert.clear();
    });        

  });
