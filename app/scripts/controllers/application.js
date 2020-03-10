'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ApplicationCtrl
 * @description
 * # ApplicationCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ApplicationCtrl', function ($q, Auth, User, $scope, APP_ROLES, $state, auth, WSAlert, ENVIRONMENT_WARNING, $translate) {

    var activePositionsDeferred = $q.defer();

    $scope.APP_ROLES = APP_ROLES;
    $scope.auth = auth;
    $scope.activePositions = activePositionsDeferred.promise;
    $scope.redirectNeeded = false;
    $scope.loading = { init: true };

    $scope.logout = function (e) {
        auth.logout();
    };

    $scope.hasRole = function (role){
      return Auth.hasRole(role);
    }

    //go though and see which ones the user has in positions
    $q.when(auth.user.$promise).then(function () {
      User.getActivePositions().then(function (positions) {
        activePositionsDeferred.resolve(positions);
      });
    });

    $scope.$on('$stateChangeStart', function () {
        WSAlert.clear();
    });

    $scope.environmentWarning = ENVIRONMENT_WARNING;
  });
