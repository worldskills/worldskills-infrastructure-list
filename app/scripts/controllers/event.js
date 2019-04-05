'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCtrl', function ($q, $scope, Events, ItemTier, WSAlert, APP_ROLES) {

    $scope.event = false;
    //$scope.loading.event = true;
    $scope.APP_ROLES = APP_ROLES;
    $scope.loadingEvent = $q.defer();
    $scope.skillAreas = {};

    $q.when($scope.appLoaded.promise).then(function(){
      //load skills
      Events.getSkillAreas($scope.event_id).then(function(res){        
        $scope.skillAreas = res;
        $scope.loadingEvent.resolve();
      },
      function(error){
        WSAlert.danger(error);
        $scope.loadingEvent.reject();
      });
      ItemTier.getTiersForEvent($scope.event_id).then(function (tiers) {
        $scope.tiers = tiers;
      }, function(error){
        WSAlert.warning(error);
        $scope.loadingEvent.reject();
      });
    });

  });
