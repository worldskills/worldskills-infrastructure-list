'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventSetsAddCtrl
 * @description
 * # EventSetsAddCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventSetsAddCtrl', function ($scope, $state, ItemSets, WSAlert) {

    $scope.loading.set = false;
    $scope.newSet = {};

    $scope.add = function(){
      ItemSets.addSet($scope.newSet, $state.params.eventId).then(function(res){
        $scope.sets.push(res.data);
        $state.go('event.sets.edit', {eventId: $state.params.eventId, setId: res.data.id});
        $scope.loading.set = false;
      },
      function(error){
        WSAlert.danger(error);
        $scope.loading.set = false;
      });
    };

    $scope.cancel = function(){
      $state.go("event.sets", {eventId: $state.params.eventId});
    };

  });
