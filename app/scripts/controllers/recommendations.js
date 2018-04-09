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
      });
    });

    $scope.accept = function(item) {
        RecommendedItems.acceptRecommendation(item, $state.params.eventId).then(function(res) {
          var index = $scope.recommendedItems.indexOf(item);
          $scope.recommendedItems.splice(index, 1);
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ACCEPT'));
        },
        function (error) {
          WSAlert.danger(error);
        });
    };

    $scope.reject = function (item) {
      $scope.recommendedItem = item

      $confirm({
        recommendedItem: $scope.recommendedItem
      },
      {
        templateUrl: 'views/recommendationsRejectModal.html'
      }).then(function() {
        $scope.recommendedItem.rejectionReason = $('#comment').val();
        RecommendedItems.rejectRecommendation($scope.recommendedItem, $state.params.eventId, $scope.skillId).then(function(result) {
          var index = $scope.recommendedItems.indexOf(item);
          $scope.recommendedItems.splice(index, 1);
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_REJECT'));
        }, function(error) {
          WSAlert.danger(error);
        });
      });
    }

  });
