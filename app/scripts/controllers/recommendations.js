'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RecommendationsCtrl
 * @description
 * # RecommendationsCtrl
 * Controller handling recommendations validation
 */
angular.module('ilApp')
  .controller('RecommendationsCtrl', function ($q, $scope, $state, $confirm, $translate, $aside, Language, RecommendedItems, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.data = {};
    $scope.APP_ROLES = APP_ROLES;

    $q.when($scope.appLoaded.promise).then(function () {
      //Load recommendations
      RecommendedItems.getRecommendations($state.params.eventId).then(function (res) {
        console.log(res);
        $scope.recommendedItems = res.recommendedItems;
      },
      function (error) {
        WSAlert.danger(error);
        //$scope.loading.subCategories = false;
      });
    });

  
  });
