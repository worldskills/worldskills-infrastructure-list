'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCtrl', function ($q, $scope, Events, WSAlert) {

    $scope.event = false;
    $scope.loading.event = true;

    if(typeof $scope.selectedEvent.id === 'undefined'){
      //reinit on reload
      $scope.event = $scope.reloadEvent().then(function(res){
        //done loading
        $scope.loading.event = false;
      },
      function(error){
        $scope.event.reject(error);
        WSAlert.danger(error);
        $scope.loading.event = false;
      });
    }
    else{
       $scope.event = $scope.selectedEvent;
       $scope.loading.event = false;
    }

  });
