'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventOverviewCtrl
 * @description
 * # EventOverviewCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventOverviewCtrl', function ($scope, WSAlert, Reporting) {

    $scope.loading.requested = $scope.loading.catalogue = false;

    $scope.exportAllRequested = function(e){
      e.preventDefault();
      $scope.loading.requested = true;
      Reporting.exportRequestedForEvent($scope.event_id).then(function(){
        $scope.loading.requested = false;
      }, function(error){ WSAlert.danger(error); $scope.loading.requested = false; });
    };

    $scope.exportAllCatalogue = function(e){
      e.preventDefault();
      $scope.loading.catalogue = true;
      Reporting.exportCatalogueForEvent($scope.event_id).then(function(){
        $scope.loading.catalogue = false;
      }, function(error){ WSAlert.danger(error); $scope.loading.catalogue = false; });
    }


  });
