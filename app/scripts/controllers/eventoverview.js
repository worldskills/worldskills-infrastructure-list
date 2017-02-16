'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventOverviewCtrl
 * @description
 * # EventOverviewCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventOverviewCtrl', function ($scope, ITEM_STATUS_TEXT, ITEM_STATUS, WSAlert, Reporting) {

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.ITEM_STATUS_TEXT = ITEM_STATUS_TEXT;
    $scope.loading.requested = $scope.loading.catalogue = false;

    //calculate total items in a skill
    $scope.totalCount = function(summaries){
      var c = 0;

      angular.forEach(summaries, function(val){
        c += val.count;
      });

      return c;
    };

    $scope.exportAllRequested = function(e){
      e.preventDefault();
      $scope.loading.requested = true;
      Reporting.exportRequestedForEvent($scope.event_id).then(function(){
        $scope.loading.requested = false;
      }, function(error){ WSALert.danger(error); $scope.loading.requested = false; });
    };

    $scope.exportAllCatalogue = function(e){
      e.preventDefault();
      alert("Not yet implemented")
    }


  });
