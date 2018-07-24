'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:recommendationReviewAsideCtrl
 * @description
 * # recommendedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('recommendationReviewAsideCtrl', function ($scope, $state, $uibModalInstance, WSAlert, RecommendedItems, SuppliedItem, $translate, auth) {

    //set event id from state if not already set
    if(!$scope.event_id){
      $scope.event_id = $state.params.eventId;
    }

    $scope.selectedLanguage = $translate.use();

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  });
