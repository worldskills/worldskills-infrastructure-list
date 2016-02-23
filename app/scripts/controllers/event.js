'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCtrl
 * @description
 * # EventCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCtrl', function ($scope, Events) {

    if(typeof $scope.selectedEvent.id === 'undefined'){
      //reinit on reload
      $scope.reloadEvent().then(function(res){
        //done
      });
    }

  });
