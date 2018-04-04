'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RecommendationsCtrl
 * @description
 * # RecommendationsCtrl
 * Controller handling recommendations validation
 */
angular.module('ilApp')
  .controller('RecommendationsCtrl', function ($q, $scope, $state, $confirm, $translate, $aside, Items, Language, RecommendedItems, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.data = {};
    $scope.APP_ROLES = APP_ROLES;

    $q.when($scope.appLoaded.promise).then(function () {
      //Load recommendations
      RecommendedItems.getRecommendations($state.params.eventId).then(function (res) {
        $scope.recommendedItems = res.recommendedItems;
      },
      function (error) {
        WSAlert.danger(error);
        //$scope.loading.subCategories = false;
      });
    });

    $scope.accept = function(item) {

      if (!item.deletionSuggestion && !item.requestedItem) {
        RecommendedItems.acceptRecommendation(item, $state.params.eventId).then(function(res) {
          $scope.recommendedItems = res.recommendedItems;
        },
        function (error) {
          WSAlert.danger(error);
        });
      //   //else if ($scope.addParent == 0) {
      //     item.category = $scope.categoryId;
      //   Items.addItem(item, item.skill.event.id, true).then(function (result) {
      //     console.log(result);
      //   });
      //   console.log('add');
      }
      // Items.saveItem(item, item.skill.event.id, true).then(function (result) {
      //   console.log(result);
      // },
      // function (error) {
      //   WSAlert.danger(error);
      // });
    };

  });
