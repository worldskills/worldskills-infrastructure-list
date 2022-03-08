'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RecommendationsCtrl
 * @description
 * # RecommendationsCtrl
 * Controller handling recommendations validation
 */
angular.module('ilApp')
  .controller('RecommendationsCtrl', function ($q, $scope, $state, $stateParams, $location, $uibModal, $rootScope, $confirm, $translate, $aside, auth, ItemTier, RecommendedItems, Events, WSAlert, APP_ID, APP_ROLES, UPLOADS_URL) {

    $scope.event = false;
    $scope.data = {};
    $scope.UPLOADS_URL = UPLOADS_URL;
    $scope.split = false;
    $scope.loading.recommendations = true;

    $scope.listId = $state.params.list || '';

    Events.getEvent($stateParams.eventId).then( function (event) {
      $scope.event = event;
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_SUPPLIED_ITEMS], $scope.event.entity_id).then(function (hasUserRole) {
          $scope.userCanAcceptReject = hasUserRole;
      });
    });

    Events.getListsForEvent($stateParams.eventId).then(function (lists) {
      $scope.lists = lists;
    });

    ItemTier.getTiersForEvent($stateParams.eventId).then(function (tiers) {
      $scope.tiers = tiers;
    });

    $scope.updateListId = function () {
      $location.search('list', $scope.listId);
      $scope.refreshRecommendations();
    };

    $scope.refreshRecommendations = function(){
      //Load recommendations
      $scope.loading.recommendations = true;
      RecommendedItems.getRecommendations($state.params.eventId, $scope.listId).then(function (res) {
        $scope.recommendedItems = res.recommendedItems;
        $scope.loading.recommendations = false;
      },
      function (error) {
        WSAlert.danger(error);
      });
    };

    $scope.refreshRecommendations();

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
      WSAlert.clear();
      var inst = $confirm({
          title: $translate.instant("jstext_review_items.title"),
          item: item,
          split: $scope.split,
          tiers: $scope.tiers,
          userCanAcceptReject: $scope.userCanAcceptReject,
          UPLOADS_URL: $scope.UPLOADS_URL,
          modifyRecommendation: function(itemRef){
            openSuggestModalAside(item, itemRef);
          },
          acceptRecommendation: $scope.accept,
          rejectRecommendation: $scope.reject,
          close: $translate.instant("jstext_review_items.close"),
          accept: $translate.instant("jstext_review_items.accept"),
          reject: $translate.instant("jstext_review_items.reject")
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
            if (recommendedItem.requestedItem && recommendedItem.requestedItem.id == item.requestedItem.id) {
              $scope.recommendedItems.splice(i, 1);
            }
          }
        }
        confirmInstance.ok();
        WSAlert.success($translate.instant('wsalert.success.recommend_accept'), '', true, false);
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
          WSAlert.success($translate.instant('wsalert.success.recommend_reject'), '', true, false);
        }, function (error) {
          WSAlert.danger(error);
        });
      });
    }

  });
