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

  $scope.filter = {category_id: '', status: {id: ''}};
  $scope.columns = {
    category: true,
    quantity: true,
    description: true,
    supplier_potential: false,
    area: true,
    supplied: true,
    manufacturer: true,
    model: true,
    size: false,
    part_number: false,
    supplier: false,
    extra_details: false,
    files: false,
    status: true,
    modified: false,
    actions: true,
  };
  $scope.columnLength = 0;
  $scope.sort = null;
  $scope.reverse = false;

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

  promises.push(Events.getSkillAreas($scope.eventId).then(function(res){
    $scope.skillAreas = res;
  }));

  Status.getAllStatuses($state.params.eventId).then(function (result) {
    $scope.statuses = result;
  });

  $q.all(promises).then(function () {
    Items.getPublicItems($scope.eventId, $scope.listId)
      .then(function(result) {
        angular.forEach(result, function (item) {
          if (typeof categoriesIndexed[item.category_id] !== 'undefined') {
            item.category = categoriesIndexed[item.category_id];
          }
        });
        $scope.items = result;
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

  var updateColumnLength = function () {
    $scope.columnLength = Object.values($scope.columns).reduce(function (accumulator, currentValue) {
      return accumulator + currentValue
    }, 0);
  };
  updateColumnLength();

  $scope.toggleColumn = function (column) {
    $scope.columns[column] = !$scope.columns[column];
    updateColumnLength();
  };

  $scope.downloadFile = function(file){
    Downloader.handleDownload(data, status, headers, filename);
  };

  $scope.sortBy = function (sort) {
    $scope.reverse = ($scope.sort === sort) ? !$scope.reverse : false;
    $scope.sort = sort;
  };

  $scope.openSuggestModalAside = function (item) {
    $scope.item = item || {};
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
