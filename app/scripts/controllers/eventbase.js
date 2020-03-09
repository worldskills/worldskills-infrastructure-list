'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventBaseCtrl', function ($q, $scope, $stateParams, Events, ItemTier, WSAlert, APP_ROLES) {

    $scope.appLoaded = $q.defer();

    $scope.event = false;
    //$scope.loading.event = true;
    $scope.APP_ROLES = APP_ROLES;
    $scope.loadingEvent = $q.defer();
    $scope.skillAreas = {};

    //load skills
    Events.getSkillAreas($stateParams.eventId).then(function(res){
      $scope.skillAreas = res;
      $scope.loadingEvent.resolve();
    },
    function(error){
      WSAlert.danger(error);
      $scope.loadingEvent.reject();
    });
    ItemTier.getTiersForEvent($stateParams.eventId).then(function (tiers) {
      $scope.tiers = tiers;
    }, function(error){
      WSAlert.warning(error);
      $scope.loadingEvent.reject();
    });

    Events.getEvent($stateParams.eventId).then( function (event) {
      $scope.event = event;
    });
    Events.getSkillsForEvent($stateParams.eventId, $scope.loadStatus).then(function (result) {
      $scope.skills = result;
      $scope.appLoaded.resolve();
    });

  });
