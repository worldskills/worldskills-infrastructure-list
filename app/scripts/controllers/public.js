'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, $uibModal, Events, Items, Downloader, ITEM_STATUS, ITEM_STATUS_TEXT, WSAlert, UPLOADS_URL, Auth, APP_ROLES, $aside, $confirm, $translate, auth, RecommendedItems) {

  $scope.eventId = $state.params.eventId;
  $scope.skillId = $state.params.skillId;
  $scope.UPLOADS_URL = UPLOADS_URL;
  $scope.participantNumbers = {};
  $scope.skillManagement = {};

  $scope.ITEM_STATUS = ITEM_STATUS;
  $scope.ITEM_STATUS_TEXT = ITEM_STATUS_TEXT;

  $scope.loading = true;

  var promises = [];
  var categoriesIndexed = {};

  promises.push(Events.getSkill($scope.skillId)
    .then(function(result){
        $scope.skill = result;
    })
  );

  promises.push(Items.getCategories($scope.skillId)
    .then(function(result){
        $scope.categories = result;
        angular.forEach($scope.categories, function (category) {
            category.items = [];
            categoriesIndexed[category.id] = category;
        });
    })
  );

  promises.push(Events.getSkillManagement($state.params.skillId)
    .then(function(res){
      $scope.skillManagement = res.data.person_positions;
    })
  );

  promises.push(Events.getParticipantCounts($scope.skillId)
    .then(function (res) {
      $scope.participantNumbers = res;
    })
  );


  $q.all(promises).then(function () {
    Items.getPublicItems($scope.eventId, $scope.skillId)
      .then(function(result) {
        angular.forEach(result, function (item) {
          if (typeof categoriesIndexed[item.category] !== 'undefined') {
            categoriesIndexed[item.category].items.push(item);
            angular.forEach(item.child_items, function (child) {
              categoriesIndexed[item.category].items.push(child);
            });
          }
        });
        $scope.loading = false;
      });
  });

  function postClose() {
    $scope.asideState.open = false;
  };

  $scope.downloadFile = function(file){
    Downloader.handleDownload(data, status, headers, filename);
  };

  $scope.canRecommend = function() {
      return Auth.hasRole(APP_ROLES.ADMIN) || Auth.hasRole(APP_ROLES.RECOMMEND);
  };


  $scope.openSuggestModalAside = function (listCategoryId, item) {
    $scope.item = item || {};
    $scope.item.listCategory = {
      id : listCategoryId
    };
    $scope.asideState = {
      open: true,
    };

    $aside.open({
      templateUrl: 'views/recommendedItemAside.html',
      placement: 'right',
      size: 'lg',
      scope: $scope,
      backdrop: true,
      controller: 'recommendedItemAsideCtrl',
    }).result.then(postClose, postClose);
  };

  $scope.suggestDeletion = function (item) {
    $scope.recommendedItem = {
      requestedItemId : item.id,
      description : item.description,
      quantity : item.quantity,
      multiplier : item.multiplier,
      multiplyFactor : item.multiply_factor,
      potentialSupplier :item.supplier,
      price: item.price,
      wrongSuppliedItem : false,
      comment: null,
      deletionSuggestion: true,
      rejected: false,
      person: {
        id: auth.user.id
      },
      listCategoryId : item.category
    };

    var self = this;
    var modalInstance = $uibModal.open({
      templateUrl: 'views/suggestDeletionModal.html',
      controller: 'ModalCtrl'
    });

    modalInstance.result.then(function (modalScope) {
      $scope.recommendedItem.comment = modalScope.comment;
      RecommendedItems.suggestDeletion($scope.recommendedItem, $scope.eventId, $scope.skillId).then(function(result) {
        WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_DELETE'));
      }, function(error) {
        WSAlert.danger(error);
      });
    });
  };
});
