'use strict';

angular.module('ilApp')
  .controller('MainCtrl', function (
    $q, $scope, Auth, $state, $rootScope, $http, APP_ROLES, $translate, tmhDynamicLocale, Language, auth, WSAlert, Events, User
  ) {
    $scope.selectedLanguage = Language.selectedLanguage;

    $scope.ilRoles = {};

    $scope.selectedSkill = {};
    $scope.selectedSector = {};
    $scope.loadStatus = true;

    $scope.hideFooter = false;
    $scope.date = new Date();


    $scope.skill_id, $scope.event_id;

    $scope.reloadSector = function () {
      var deferred = $q.defer();

      //load skills in sector for this event
      Events.getSkillsForSector($scope.sector_id, $scope.event_id, $scope.loadStatus).then(function (result) {
        $scope.skills = result;
        deferred.resolve();
      },
      function (error) {
        deferred.reject("Could not load skills for sector: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    $scope.reloadEvent = function () {
      var deferred = $q.defer();

      //load skills in sector for this event
      Events.getSkillsForEvent($scope.event_id, $scope.loadStatus).then(function (result) {
        $scope.skills = result;
        deferred.resolve();
      },
      function (error) {
        deferred.reject("Could not load skills for event: " + error);
      });

      return deferred.promise;

    };

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
      if(toState.name == 'eventBase.catalogue') $scope.hideFooter = true;
      else $scope.hideFooter = false;
    });

  });
