'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, $uibModal, Events, Items, List, Category, Status, Downloader, WSAlert, UNITS, UPLOADS_URL, Auth, APP_ROLES, APP_ID, $aside, $confirm, $translate, auth, RecommendedItems) {

  $scope.eventId = $state.params.eventId;
  $scope.listId = $state.params.listId;
  $scope.UPLOADS_URL = UPLOADS_URL;
  $scope.UNITS = UNITS;
  $scope.participantNumbers = {};
  $scope.skillManagement = {};

  $scope.loading = true;
  $scope.error = false;

  var promises = [];
  var categoriesIndexed = {};

  promises.push(Events.getEvent($scope.eventId).then(function (event) {
    $scope.event = event;
    Auth.setUserEventPermissions($scope.event);
  }));

  $scope.list = List.get({id: $scope.listId});

  promises.push($scope.list.$promise
    .then(function(result){
        Auth.setUserListPermissions($scope.list);
        auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.RECOMMEND], $scope.list.entity_id).then(function (hasUserRole) {
            $scope.userCanRecommend = hasUserRole;
        });
        auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.list.entity_id).then(function (hasUserRole) {
          $scope.canEditItemStatus = hasUserRole;
        });
        if ($scope.list.skill) {
          Events.getParticipantCounts($scope.list.skill.id)
            .then(function (res) {
              $scope.participantNumbers = res;
            });
          Events.getSkillManagement($scope.list.skill.id)
            .then(function(res){
              $scope.skillManagement = res.data.person_positions;
            })
        }
    })
  );

  promises.push(Category.getAll($scope.eventId)
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

  Status.getAllStatuses($state.params.eventId).then(function (result) {
    $scope.statuses = result;
  });

  $q.all(promises).then(function () {
    Items.getPublicItems($scope.eventId, $scope.listId)
      .then(function(result) {
        angular.forEach(result, function (item) {
          if (typeof categoriesIndexed[item.category_id] !== 'undefined') {
            categoriesIndexed[item.category_id].items.push(item);
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

  $scope.openSuggestModalAside = function (categoryId, item) {
    $scope.item = item || {};
    $scope.item.category = {
      id : categoryId
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
      categoryId : item.category_id
    };

    var self = this;
    var modalInstance = $uibModal.open({
      templateUrl: 'views/suggestDeletionModal.html',
      controller: 'ModalCtrl'
    });

    modalInstance.result.then(function (modalScope) {
      $scope.recommendedItem.comment = modalScope.comment;
      RecommendedItems.suggestDeletion($scope.recommendedItem, $scope.eventId, $scope.listId).then(function(result) {
        WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_DELETE'));
      }, function(error) {
        WSAlert.danger(error);
      });
    });
  };
});
