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

    $scope.checkNeedForReload = function(){ //wrapped in function as used in other sub-modules

      var deferred = $q.defer();

      if(
        typeof $scope.selectedEvent.id === 'undefined' &&
        typeof $scope.selectedSector.id === 'undefined' &&
        typeof $scope.selectedSkill.id === 'undefined'
      ){
        $scope.loading.event = true;
        $scope.reload().then(function(){
          $scope.loading.event = false;
          deferred.resolve();
        },
        function(error){
          WSAlert.danger("Could not load event - please try again!");
          deferred.reject("Could not load event - please try again!");
        });
      }
      else deferred.resolve();

      return deferred.promise;
    };

    $scope.checkNeedForReload();
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
