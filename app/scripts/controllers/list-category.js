'use strict';

angular.module('ilApp')
  .controller('ListCategoryCtrl', function ($scope, $state, $q, $aside, $timeout, MULTIPLIERS, Items, SuppliedItem, $confirm, WSAlert, API_IL, Auth, auth, APP_ID, APP_ROLES, UNITS, UPLOADS_URL, $translate, Status) {

    $scope.UNITS = UNITS;
    $scope.UPLOADS_URL = UPLOADS_URL;
    $scope.categoryId = $state.params.categoryId;
    $scope.selectedCategory = $scope.categories[$scope.categoryId];
    $scope.loading.init = true;
    $scope.loading.more = false;

    $scope.orderProperty = null;//"item_order";
    $scope.reverse = false;
    $scope.allowReordering = true;

    $scope.deleteMode = false;

    $scope.multipliers = MULTIPLIERS;
    $scope.tmp_item = {};
    $scope.items = {};
    $scope.activeItem = false;
    $scope.suppliedItem = {};
    $scope.searchAPI = false;
    $scope.searchSupplierAPI = false;
    $scope.limit = 900;
    $scope.offset = 0;
    $scope.canceler = false;
    $scope.total = 0;
    $scope.supplierValue = false;
    $scope.statusEditionItemId = -1; // starting at -1 as no item should be considered in edition mode on page start

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.canEditItemStatus = hasUserRole;
    });

    $scope.editRequestedItem = function(item) {

      $scope.supplierValue = false;

      //copy item
      $scope.item = angular.copy(item);

      $scope.editModal = $aside.open({
        templateUrl: 'views/editRequestedItemAside.html',
        placement: 'right',
        size: 'lg',
        scope: $scope,
        backdrop: true,
        controller: 'editRequestedItemAsideCtrl'
      });

      $scope.editModal.result.then(function(res){
        if(res && res.id === item.id){
          //copy returned item back to the view
          item.updated = true;
          angular.extend(item, res);
          $scope.item = null;
        }
        //res === null if close called because of `cancel`
      });
    };

    $scope.asideState = {
      open: false,
    };

    $scope.editItem = function (item, itemIndex) {

      if ($scope.activeItem == item.id) $scope.activeItem = false;
      else {
        $scope.activeItem = item.id;
      }

      $scope.supplierValue = false;
    };

    $scope.editItemStatus = function (item)
    {
      $scope.statusEditionItemId = item.id;
    }

    $scope.saveStatus = function (item, itemIndex)
    {
      $scope.saveItem(item, itemIndex);
      $scope.statusEditionItemId = -1;
      WSAlert.success($translate.instant('WSALERT.SUCCESS.ITEM_SAVED'));
    }

    $scope.saveItem = function (item, itemIndex) {

      //set supplier from autocomplete
      if (item.selectedSupplier != void 0
            && item.selectedSupplier.originalObject.id != void 0) {
        item.supplier = item.selectedSupplier.originalObject;
      }
      else if ($scope.supplierValue !== false) {
        item.supplier = {
          name: $scope.supplierValue
        }
      }

      item.description.lang_code = $translate.use(); // Ensure lang_code are the same as the user

      Items.saveItem(item, $scope.event_id).then(function (result) {
        $scope.activeItem = false;

        if(result.category_id != $scope.categoryId){
          //category changed, remove from list
          $scope.items.splice(itemIndex, 1);
        }

        //set readable quantity as it's coming from API rather than bound to the scope model
        item.readable_quantity = result.readable_quantity;
      },

        function (error) {
          WSAlert.danger(error);
        });
    };

    $scope.removeItem = function (item, itemIndex) {

      //confirm and remove children too
      $confirm({
        title: 'Delete item',
        text: 'Are you sure?',
      }).then(function () {
        Items.removeItem(item, $scope.event_id).then(function (result) {
          //remove from list
          $scope.items.splice(itemIndex, 1);
        }),

            function (error) {
              WSAlert.danger(error);
            };
      });

    };

    $scope.addItem = function () {
      //item, itemIndex

      $scope.asideState = {
        open: true,
      };

      function postClose() {
        $scope.asideState.open = false;
      }

      $aside.open({
        templateUrl: 'views/addRequestedItemAside.html',
        placement: 'right',
        size: 'lg',
        scope: $scope,
        backdrop: true,
        controller: 'addRequestedItemCtrl',
      }).result.then(postClose, postClose);
    };

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_SUPPLIED_ITEMS], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.canEditSuppliedItem = hasUserRole;
    });

    $scope.initCategory = function () {
      $scope.offset = 0;

      var deferred = $q.defer();

      if ($scope.canceler.promise) $scope.canceler.resolve();
      $scope.canceler = $q.defer();

      //check that skill_id and event_id have finished loading
      $q.when($scope.initializing.promise).then(function () {

        //reinitialize category var
        angular.forEach($scope.categories, function (val, key) {
          if (val.id == $scope.categoryId) $scope.selectedCategory = val.category;
        });

        //init search url
        $scope.searchAPI = API_IL + '/items/' + $scope.event_id + '/supplied_items/?limit=100&search=';
        $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.event_id + '/search?q=';

        //get items
        Items.getItems($scope.categoryId, $scope.listId, $scope.event_id, $scope.limit, $scope.offset, $scope.filterValue, $scope.canceler).then(function (result) {
          $scope.items = result.requested_items;
          angular.forEach($scope.items, function (item) {
            auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_REQUESTED_ITEMS_ALWAYS], $scope.event.entity_id).then(function (hasUserRole) {
              if (hasUserRole) {
                item.canEdit = true;
              } else {
                item.canEdit = item.status.allow_editing;
              }
            });
          });
          $scope.total = result.total;
          $scope.additionRecommendationsCount = result.additionRecommendationsCount;
          $scope.loading.init = false;
          deferred.resolve();
        },

            function (error) {  //or fail
              WSAlert.danger(error);
              deferred.reject();
            });
      });

      return deferred.promise;

    };

    Status.getAllStatuses($state.params.eventId).then(function (result) {
      $scope.statuses = result;
    });

    $scope.filter = function () {
      if ($scope.searchAPI = false) return;
      //$scope.loading.init = true;
      $scope.initCategory();
    };

    $scope.clearSearchTerms = function () {
      $scope.filterValue = '';
      $scope.loading.init = true;
      $scope.initCategory();
    };

    $scope.isLoading = function () {
      return $scope.loading.init || $scope.loading.more || (Items.data != 'undefined' && typeof Items.data == 'promise');
    };

    $scope.supplierChanged = function (val) {
      $scope.supplierValue = val;
    };

    $scope.initCategory();

    //link helper function from items
    $scope.factorNeeded = Items.factorNeeded;

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.canEditItemStatus = hasUserRole;
    });

    $scope.sortBy = function(sort){
      $scope.allowReordering = false;
      $scope.reverse = ($scope.orderProperty === sort) ? !$scope.reverse : false;
      $scope.orderProperty = sort;
    };

    // edit supplied item
    $scope.editSuppliedItem = function(item) {

      var scope = $scope.$new();
      scope.rowItem = item.supplied_item;
      scope.rowItem.event = {id: $scope.event_id};

      $scope.saveRow = function (rowEntity, updateRequested){

        var promise = $q.defer();

        rowEntity.description.lang_code = $translate.use();

        SuppliedItem.saveItem(rowEntity, updateRequested).then(function(res){
          // copy back data from request's response
          angular.extend(rowEntity, res);
          promise.resolve();
        }, function(error){
          WSAlert.danger(error);
          promise.reject();
        });

        return promise.promise;
      };

      // load full supplied item
      SuppliedItem.getItem(scope.rowItem).then(function(res) {
        scope.item = angular.copy(res);

        $aside.open({
          templateUrl: 'views/editsupplieditemaside.html',
          placement: 'right',
          size: 'md',
          scope: scope,
          backdrop: true,
          controller: 'editSuppliedItemCtrl',
        });
      });

    };

    $scope.switchSuppliedItem = function(item) {

      // create new scope with item for aside
      var scope = $scope.$new();
      scope.item = item;

      // open aside
      var aside = $aside.open({
        templateUrl: 'views/switchSuppliedItemAside.html',
        placement: 'right',
        size: 'md',
        scope: scope,
        backdrop: true,
        controller: 'switchSuppliedItemCtrl',
      });

      // update supplied item on aside close
      aside.result.then(function (suppliedItem) {

        item.supplied_item = suppliedItem;

        Items.saveItemSuppliedItem(item, $scope.event_id).then(function (result) {
          // supplied item updated
        }, function (error) {
          WSAlert.danger(error);
        });

      });

    };

    // split supplied item
    $scope.splitSuppliedItem = function(item) {

      $confirm({
        title: 'Split Supplied Item',
        text: 'Create a copy of the supplied item and link it to the requested item?',
      }).then(function () {

        SuppliedItem.cloneItem(item.supplied_item, $scope.event_id).then(function (res) {

          item.supplied_item = res;

          Items.saveItemSuppliedItem(item, $scope.event_id).then(function (result) {
            // supplied item updated
          }, function (error) {
            WSAlert.danger(error);
          });

        }, function (error) {
          WSAlert.danger(error);
        });
      });

    };

  })
.directive('requestedItem', function (UNITS) {
  return {
    restrict: 'EA',
    scope: { item: '=item', UNITS: UNITS },
    replace: true,
    templateUrl: 'views/item_render.html',
  };
});
