'use strict';

angular.module('ilApp')
  .controller('MainCtrl', function (
    $q, $scope, Auth, $state, $rootScope, $http, APP_ROLES, $translate, tmhDynamicLocale, Language, auth, WSAlert, Events, User
  ) {
    $scope.selectedLanguage = Language.selectedLanguage;

    $scope.hideFooter = false;
    $scope.date = new Date();

    $scope.skill_id, $scope.event_id;

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
      if(toState.name == 'eventBase.catalogue') $scope.hideFooter = true;
      else $scope.hideFooter = false;
    });

  });
