'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventSetsCtrl
 * @description
 * # EventSetsCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventSetsCtrl', function ($scope, $state, ItemSets, WSAlert) {
    //permission checks done on server side

    $scope.sets = ItemSets.list;

    function loadSets(eventId){
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


    if(typeof $scope.selectedEvent.id === 'undefined'){
      //reinit on reload
      $scope.event.then(function(res){
        loadSets($scope.selectedEvent.id);
      })
    }
    else loadSets($scope.selectedEvent.id);

    $scope.addNewSet = function(){
      $state.go("event.sets.add", {eventId: $scope.selectedEvent.id});
    };


  });
