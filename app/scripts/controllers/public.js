'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, $uibModal, Events, Items, Status, Downloader, WSAlert, UNITS, UPLOADS_URL, Auth, APP_ROLES, APP_ID, $aside, $confirm, $translate, auth, RecommendedItems) {

  $scope.eventId = $state.params.eventId;
  $scope.skillId = $state.params.skillId;
  $scope.UPLOADS_URL = UPLOADS_URL;
  $scope.UNITS = UNITS;
  $scope.participantNumbers = {};
  $scope.skillManagement = {};

  $scope.loading = true;
  $scope.error = false;

  var promises = [];
  var categoriesIndexed = {};


  promises.push(Events.getSkill($scope.skillId)
    .then(function(result){
        $scope.skill = result;
        $scope.activePositions.then(function (activePositions) {
          Auth.setUserSkillPermissions(activePositions, $scope.skill);
        });
        auth.hasUserRole(APP_ID, ['Admin', 'RECOMMEND'], $scope.skill.entity).then(function (hasUserRole) {
            $scope.userCanRecommend = hasUserRole;
        });
    })
  );

  promises.push(Items.getCategories($scope.skillId)
    .then(function(result){
        $scope.categories = result;
        angular.forEach($scope.categories, function (category) {
            category.items = [];
            category.sort = null;
            category.reverse = false;
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

  Status.getAllStatuses($state.params.eventId).then(function (result) {
    $scope.statuses = result;
  });

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
      }, function(error){
        WSAlert.danger($translate.instant('WSALERT.DANGER.NO_ACCESSS_PUBLIC_VIEW'));
        $scope.loading = false;
        $scope.error = true;
      });
  });

  function postClose() {
    $scope.asideState.open = false;
  };

  $scope.downloadFile = function(file){
    Downloader.handleDownload(data, status, headers, filename);
  };

  $scope.sortBy = function (category, sort) {
    category.reverse = (category.sort === sort) ? !category.reverse : false;
    category.sort = sort;
  };

  $scope.canRecommendSupplied = function(){
    return Auth.hasRole(APP_ROLES.ADMIN) || (
      Auth.hasRole(APP_ROLES.RECOMMEND_SUPPLIED)
      && recommendedItem.requestedItemId
      && item.status.secret !== true
      && item.status.show_in_public_view
    );
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
      additional_quantity: item.additional_quantity,
      unit: item.unit,
      price: item.price,
      wrongSuppliedItem : false,
      comment: null,
      deletionSuggestion: true,
      rejected: false,
      person: {
        id: auth.user.person_id
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
