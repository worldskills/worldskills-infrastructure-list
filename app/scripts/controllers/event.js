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
    //$scope.loading.event = true;
    $scope.APP_ROLES = APP_ROLES;
    //$scope.reloadingEvent = false;

    $scope.checkNeedForReload = function(){ //wrapped in function as used in other sub-modules
      // //var alreadyReloading = true;
      //
      // if(typeof $scope.reloadingEvent.promise == 'undefined'){
      //   //alreadyReloading = false;
      //   $scope.reloadingEvent = $q.defer();
      // }
      //
      // if(
      //   typeof $scope.selectedEvent.id === 'undefined' &&
      //   typeof $scope.selectedSector.id === 'undefined' &&
      //   typeof $scope.selectedSkill.id === 'undefined'
      //   //alreadyReloading === false
      // ){
      //   $scope.loading.event = true;
      //   $scope.reload().then(function(){
      //     $scope.loading.event = false;
      //     //$scope.reloadingEvent.resolve(123);
      //   },
      //   function(error){
      //     WSAlert.danger("Could not load event - please try again!");
      //     deferred.reject("Could not load event - please try again!");
      //   });
      // }
      //
      // return $scope.reloadingEvent.promise;
    };

  });
