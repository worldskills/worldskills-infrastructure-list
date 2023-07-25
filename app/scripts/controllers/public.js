'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, $uibModal, Events, Items, List, Category, Status, ItemTier, RecommendedSubscription, Downloader, WSAlert, UNITS, UPLOADS_URL, Auth, APP_ROLES, APP_ID, MULTIPLIER_DEFAULT, $aside, $confirm, $translate, auth, RecommendedItems) {

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
    id: false,
    category: true,
    quantity: true,
    calculated_quantity: false,
    unit: false,
    description: true,
    requested: false,
    area: true,
    supplied: false,
    manufacturer: true,
    model: true,
    size: false,
    part_number: false,
    supplier: true,
    item_subcategory: false,
    item_category: false,
    tier: false,
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
  var tiersIndexed = {};

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

  promises.push(ItemTier.getTiersForEvent($state.params.eventId).then(function (tiers) {
    $scope.tiers = tiers;
    angular.forEach($scope.tiers, function (tier) {
      tiersIndexed[tier.id] = tier;
    });
  }));

  $q.all(promises).then(function () {
    Items.getPublicItems($scope.eventId, $scope.listId)
      .then(function(result) {
        angular.forEach(result.requested_items, function (item) {
          if (typeof categoriesIndexed[item.category_id] !== 'undefined') {
            item.category = categoriesIndexed[item.category_id];
          }
          if (typeof tiersIndexed[item.tier_id] !== 'undefined') {
            item.tier = tiersIndexed[item.tier_id];
          }
        });
        $scope.items = result;
        $scope.loading = false;
      }, function(error){
        WSAlert.danger($translate.instant('wsalert.danger.no_accesss_public_view'));
        $scope.loading = false;
        $scope.error = true;
      });
  });

  function postClose() {
    $scope.asideState.open = false;
  };

  var updateColumnLength = function () {
    $scope.columnLength = 0;
    angular.forEach($scope.columns, function(value, key) {
      if (key) {
        $scope.columnLength += 1;
      }
    });
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

  $scope.simplifiedObjectComparator = function (actual, expected) {
    if (typeof actual === 'undefined' || actual === null) {
      actual = '';
    }
    if (expected === null) {
      expected = '';
    }
    if (typeof expected === 'object') {
      var expectedVal = '';
      var key;
      for (key in expected) {
        expectedVal += expected[key];
      }
      expected = expectedVal;
    }

    actual = ('' + actual).toLowerCase();
    expected = ('' + expected).toLowerCase();
    return actual.indexOf(expected) !== -1;
  };

  $scope.showRecommendations = function (requestedItemId) {
    $scope.loadingRecommendations = true;
    $scope.recommendedItems = [];
    RecommendedItems.getRecommendations($scope.eventId, $scope.listId, requestedItemId).then(function (res) {
      $scope.recommendedItems = res.recommendedItems;
      $scope.loadingRecommendations = false;
    },
    function (error) {
      WSAlert.danger(error);
    });
    RecommendedSubscription.getSubscription($scope.eventId, $scope.listId, auth.user.person_id).then(function (res) {
      $scope.subscription = res;
    });
    $scope.recommendationsModal = $uibModal.open({
      animation: false,
      size: 'lg',
      templateUrl: 'views/recommendations-modal.html',
      scope: $scope
    });
  };

  $scope.closeRecommendationsModal = function () {
    $scope.recommendationsModal.dismiss('cancel');
  };

  $scope.updateSubscription = function (subscribe) {
    $scope.subscription.subscribed = subscribe;
    RecommendedSubscription.updateSubscription($scope.eventId, $scope.listId, auth.user.person_id, $scope.subscription).then(function (res) {
      $scope.subscription = res;
    });
  };

  $scope.openSuggestModalAside = function (item) {
    $scope.item = item || {};
    $scope.asideState = {
      open: true,
    };

    $scope.recommendedItem = {
      multiplier: MULTIPLIER_DEFAULT
    };

    var requestedItemAside = $aside.open({
      templateUrl: 'views/recommendedItemAside.html',
      placement: 'right',
      size: 'lg',
      scope: $scope,
      backdrop: true,
      controller: 'recommendedItemAsideCtrl',
    });
    requestedItemAside.result.then(postClose, postClose);

    if (!$scope.item.id) {

      $scope.recommendedItem.description = {
        lang_code: $scope.selectedLanguage,
        text: '',
      };

      // create new scope with item for aside
      var scope = $scope.$new();
      scope.event.userCanCreate = scope.userCanRecommend;
      scope.event_id = $scope.eventId;
      scope.item = $scope.item;

      // open aside
      var suppliedItemAside = $aside.open({
        templateUrl: 'views/switchSuppliedItemAside.html',
        placement: 'right',
        size: 'md',
        scope: scope,
        backdrop: true,
        controller: 'switchSuppliedItemCtrl',
      });
      // update supplied item on aside close
      suppliedItemAside.result.then(function (suppliedItem) {
        $scope.recommendedItem.suppliedItem = suppliedItem;
        $scope.recommendedItem.recommendedItemSupplied = suppliedItem;
      }, function () {
        requestedItemAside.dismiss();
      });
    }
  };

  $scope.suggestDeletion = function (item) {
    $scope.recommendedItem = {
      requestedItemId : item.id,
      description : item.description,
      quantity : item.quantity,
      multiplier : item.multiplier,
      multiplyFactor : item.multiply_factor,
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
      category: {
        id: item.category_id
      }
    };

    var self = this;
    var modalInstance = $uibModal.open({
      templateUrl: 'views/suggestDeletionModal.html',
      controller: 'ModalCtrl'
    });

    modalInstance.result.then(function (modalScope) {
      $scope.recommendedItem.comment = modalScope.comment;
      RecommendedItems.suggestDeletion($scope.recommendedItem, $scope.eventId, $scope.listId).then(function(result) {
        WSAlert.success($translate.instant('wsalert.success.recommend_delete'), '', false, false);
        if (item) {
          item.deletionSuggestions++;
        }
      }, function(error) {
        WSAlert.danger(error);
      });
    });
  };
});

angular.module('ilApp').controller('PublicItemsSkillCtrl', function ($scope, $state, $q, $uibModal, Events, Items, List, Category, Status, RecommendedSubscription, Downloader, WSAlert, UNITS, UPLOADS_URL, Auth, APP_ROLES, APP_ID, $aside, $confirm, $translate, auth, RecommendedItems) {

   Events.getSkill($state.params.skillId).then(function(skill) {
     $state.go('publicItems', {eventId: $state.params.eventId, listId: skill.list_id});
   });
});
