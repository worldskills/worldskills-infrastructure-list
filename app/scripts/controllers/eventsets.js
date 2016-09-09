'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventSetsCtrl
 * @description
 * # EventSetsCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventSetsCtrl', function ($q, $scope, $state, ItemSets, WSAlert) {
    //permission checks done on server side

    $scope.sets = ItemSets.list;

    function loadSets(eventId){
      $scope.loading.sets = true;
      ItemSets.init(eventId).then(function(result){
        //sets loaded
        $scope.sets = result;
        $scope.loading.sets = false;
      },
      function(error){
        $scope.loading.sets = false;
        WSAlert.danger(error);
      });
    }

    //Important: this does not work with WS_SECTOR_MANAGER or WS_MANAGER as they don't have event level access
    //if there is a need to enable this in the future, this must be changed
    if(typeof $scope.selectedEvent.id !== 'undefined')
      loadSets($scope.selectedEvent.id);
    else{
      $q.when($scope.appLoaded.promise).then(function(){
        loadSets($scope.selectedEvent.id);
      },
      function(error){
        WSAlert.danger(error);
      });
    }

    $scope.addNewSet = function(){
      $state.go("event.sets.add", {eventId: $scope.selectedEvent.id});
    };


  });
