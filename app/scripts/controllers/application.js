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

    $scope.APP_ROLES = APP_ROLES;
    $scope.auth = auth;
    $scope.redirectNeeded = false;
    $scope.loading = { init: true };

    $scope.logout = function (e) {
        auth.logout();
    };

    $scope.$on('$stateChangeStart', function () {
        WSAlert.clear();
    });

    $scope.environmentWarning = ENVIRONMENT_WARNING;
  });
