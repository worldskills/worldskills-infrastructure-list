'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RecommendationsCtrl
 * @description
 * # RecommendationsCtrl
 * Controller handling recommendations validation
 */
angular.module('ilApp')
  .controller('RecommendationsCtrl', function ($q, $scope, $state, $uibModal, $rootScope, $confirm, $translate, $aside, Items, Language, RecommendedItems, WSAlert, APP_ROLES) {
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
        if (item.deletionSuggestion) {
          // the requested item has been deleted so we remove related recommendations
          // from the model
          for(var i = $scope.recommendedItems.length - 1; i >= 0; i--) {
            var recommendedItem = $scope.recommendedItems[i];
            if (recommendedItem.requestedItem.id == item.requestedItem.id) {
              $scope.recommendedItems.splice(i, 1);
            }
          }
        }
        WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ACCEPT'));
      },
      function (error) {
        WSAlert.danger(error);
      });
    };

    $scope.reject = function (item) {
      $scope.recommendedItem = item;

      var self = this;
      var modalInstance = $uibModal.open({
        templateUrl: 'views/recommendationsRejectModal.html',
        controller: 'ModalCtrl'
      });

      modalInstance.result.then(function (modalScope) {
        $scope.recommendedItem.rejectionReason = modalScope.rejectionReason;
        RecommendedItems.rejectRecommendation($scope.recommendedItem, $state.params.eventId).then(function(result) {
          var index = $scope.recommendedItems.indexOf(item);
          $scope.recommendedItems.splice(index, 1);
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_REJECT'));
        }, function (error) {
          WSAlert.danger(error);
        });
      });
    }

  });
