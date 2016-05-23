'use strict';

angular.module('ilApp')
  .controller('HomeCtrl', function (
    $q, $scope, Auth, $state, $rootScope, APP_ROLES, $translate, Language, auth, WSAlert, Events, User
  ) {
    $scope.APP_ROLES = APP_ROLES;
    $scope.selectedLanguage = Language.selectedLanguage;

    $q.when($scope.activePositions.promise).then(function (positions) {
      //if only one active position, select it
      if($scope.activePositions.length == 1) {
        $scope.loadActivePosition($scope.activePositions[0]);
      }//if
    },
    function(error){
      WSAlert.danger(error);
    });
  });
