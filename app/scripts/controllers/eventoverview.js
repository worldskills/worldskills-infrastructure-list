'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventOverviewCtrl
 * @description
 * # EventOverviewCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventOverviewCtrl', function ($scope, ITEM_STATUS_TEXT, ITEM_STATUS) {

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.ITEM_STATUS_TEXT = ITEM_STATUS_TEXT;

    //calculate total items in a skill
    $scope.totalCount = function(summaries){
      var c = 0;

      angular.forEach(summaries, function(val){
        c += val.count;
      });

      return c;
    };

  });
