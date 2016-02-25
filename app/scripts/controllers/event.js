'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCtrl', function ($q, $scope, Events, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.loading.event = true;
    $scope.APP_ROLES = APP_ROLES;

    if(
      typeof $scope.selectedEvent.id === 'undefined' &&
      typeof $scope.selectedSector.id === 'undefined' &&
      typeof $scope.selectedSkill.id === 'undefined'
    ){
      $scope.loading.event = true;
      $scope.reload().then(function(){
        $scope.loading.event = false;
      },
      function(error){
        WSAlert.danger("Could not load event - please try again!");
      });
    }
    // if(typeof $scope.selectedEvent.id === 'undefined'){
    //   //reinit on reload
    //   $scope.event = $scope.reloadEvent().then(function(res){
    //     //done loading
    //     $scope.loading.event = false;
    //   },
    //   function(error){
    //     $scope.event.reject(error);
    //     WSAlert.danger(error);
    //     $scope.loading.event = false;
    //   });
    // }
    // else{
    //    $scope.event = $scope.selectedEvent;
    //    $scope.loading.event = false;
    // }

  });
