'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ApplicationCtrl
 * @description
 * # ApplicationCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ApplicationCtrl', function ($q, Auth, User, $scope, $state, auth, WSAlert) {

    $scope.auth = auth;
    $scope.activePositions = $q.defer();
    $scope.activePosition = $q.defer();
    $scope.redirectNeeded = false;

    $scope.logout = function (e) {
        auth.logout();
    };

    //go though and see which ones the user has in positions
    $q.when(auth.user.$promise).then(function() {
      User.getActivePositions().then(function(res){
        $scope.activePositions.resolve(res);
        $scope.activePositions = res;
      },
      function(error){
        $scope.activePositions.reject("Could not get active positions for user: " + error);
      });
    });

    $scope.$on('$stateChangeStart', function () {
        WSAlert.clear();
    });

    $scope.setActivePosition = function(position, $event){
      if($event !== undefined) $event.preventDefault();

      //save in session storage to be read later if needed on refresh
      sessionStorage.setItem('active_position_id', position.id);

      //resolve if still a promise
      if($scope.activePosition.promise)
        $scope.activePosition.resolve(position);

      //tell main.js handler to reload on change
      $scope.redirectNeeded = true;

      $scope.activePosition = position;
    };

  });
