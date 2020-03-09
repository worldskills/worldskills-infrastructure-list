'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventSetsCtrl
 * @description
 * # EventSetsCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventSetsCtrl', function ($q, $scope, $state, $stateParams, ItemSets, WSAlert) {
    //permission checks done on server side

    $scope.event_id = $stateParams.eventId;
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
    if(typeof $stateParams.eventId !== 'undefined')
      loadSets($stateParams.eventId);

    $scope.addNewSet = function(){
      $state.go("eventBase.sets.add", {eventId: $scope.event_id});
    };


  });
