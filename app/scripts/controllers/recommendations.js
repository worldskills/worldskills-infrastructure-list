'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RecommendationsCtrl
 * @description
 * # RecommendationsCtrl
 * Controller handling recommendations validation
 */
angular.module('ilApp')
  .controller('RecommendationsCtrl', function ($q, $scope, $state, $uibModal, $rootScope, $confirm, $translate, $aside, Items, Language, RecommendedItems, WSAlert, APP_ROLES, UPLOADS_URL) {
    $scope.event = false;
    $scope.data = {};
    $scope.APP_ROLES = APP_ROLES;
    $scope.UPLOADS_URL = UPLOADS_URL;
    $scope.split = false;

    $q.when($scope.appLoaded.promise).then(function () {
      $scope.refreshRecommendations();
    });

    $scope.refreshRecommendations = function(){
      //Load recommendations
      RecommendedItems.getRecommendations($state.params.eventId).then(function (res) {
        $scope.recommendedItems = res.recommendedItems;
      },
      function (error) {
        WSAlert.danger(error);
      });
    };

    $scope.review = function(item){
      $scope.openRecommendationReviewModal(item);
    };

    function openSuggestModalAside(item, itemRef) {
      $scope.reviewItem = item;

      $scope.asideState = {
        open: true,
      };

      $scope.reviewMode = true;

      $aside.open({
        templateUrl: 'views/recommendedItemAside.html',
        placement: 'right',
        size: 'lg',
        scope: $scope,
        backdrop: true,
        controller: 'recommendedItemAsideCtrl',
      }).result.then(function(res){
        //copy back to the view and scope
        angular.copy(res, itemRef);
        angular.copy(res, $scope.reviewItem);
      }, postClose);
    };

    function postClose() {
      $scope.asideState.open = false;
    };


    $scope.openRecommendationReviewModal = function(item){
      var inst = $confirm({
          title: $translate.instant("JSTEXT_REVIEW_ITEMS.TITLE"),
          item: item,
          split: $scope.split,
          modifyRecommendation: function(itemRef){
            openSuggestModalAside(item, itemRef);
          },
          acceptRecommendation: $scope.accept,
          rejectRecommendation: $scope.reject,
          close: $translate.instant("JSTEXT_REVIEW_ITEMS.CLOSE"),
          accept: $translate.instant("JSTEXT_REVIEW_ITEMS.ACCEPT"),
          reject: $translate.instant("JSTEXT_REVIEW_ITEMS.REJECT")
        },
        {
          templateUrl: 'views/recommendationReviewConfirm.html',
          size: 'lg'
        }).then(function (action) {
          //refresh recommendations
          $scope.refreshRecommendations();
      });
    };

    function postClose() {
      $scope.asideState.open = false;
    };

    $scope.accept = function(item, confirmInstance, split) {
      RecommendedItems.acceptRecommendation(item, $state.params.eventId, split).then(function(res) {
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
        confirmInstance.ok();
        WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ACCEPT'), '', false, false);
      },
      function (error) {
        WSAlert.danger(error);
      });
    };

    $scope.reject = function (item, confirmInstance) {
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
          //close confirm dialog
          $scope.recommendedItems.splice(index, 1);
          confirmInstance.ok();
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_REJECT'), '', false, false);
        }, function (error) {
          WSAlert.danger(error);
        });
      });
    }

  });
