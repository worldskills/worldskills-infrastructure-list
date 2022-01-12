'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RequestedItemModalCtrl
 * @description
 * # RequestedItemModalCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('RequestedItemModalCtrl', function (
    $q,
    $scope,
    $state,
    $confirm,
    $translate,
    uiGridConstants,
    $uibModalInstance,
    $filter,
    $aside,
    ItemCategory,
    Category,
    WSAlert,
    Auth,
    auth,
    APP_ID,
    APP_ROLES,
    API_IL,
    Items
  ) {

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.canEditItemStatus = hasUserRole;
    });

    $scope.asideState = {
      open: true,
    };

    $scope.searchSupplierAPI = API_IL + '/suppliers/'+ $state.params.eventId + "/search?q=";

    $scope.isSubmitting = false;

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    $scope.itemsSelected = $scope.items.filter(function (item) {
      return item.selected;
    });

    //Edition is available only if at least 1 item is selected
    //We can consider the first element of the array as a reference
    $scope.editedItem = {};
    $scope.editedItem.status = $scope.itemsSelected[0].status;
    $scope.editedItem.price = $scope.itemsSelected[0].price;
    $scope.editedItem.category = $scope.itemsSelected[0].category;
    $scope.editedItem.tier = $scope.itemsSelected[0].tier_id;

    //Detect in multiple edition if one field has multiple values
    //If so field are set to null and boolean set to true to indicate that it has multiple values
    angular.forEach($scope.itemsSelected, function(v, k) {
      if($scope.editedItem.status && $scope.editedItem.status.id !== v.status.id)
      {
        $scope.editedItem.status = null;
        $scope.multipleStatus = true;
      }
      if($scope.editedItem.price !== v.price)
      {
        $scope.editedItem.price = null;
        $scope.multiplePrice = true;
      }
      if($scope.editedItem.category && $scope.editedItem.category.id !== v.category.id)
      {
        $scope.editedItem.category = null;
        $scope.multipleCategory = true;
      }
      if($scope.editedItem.tier !== v.tier_id)
      {
        $scope.editedItem.tier = null;
        $scope.multipleTier = true;
      }
    });

    $scope.saveItems = function(){
      if($scope.isSubmitting === true){
        return;
      }

      $scope.isSubmitting = true;
      var tasks = [];

      // we need to save the first row first in order to create
      // the new supplier if needed
      // (else several request attempt to do that and fail)
      var firstRow = $scope.itemsSelected[0];

      $scope
        .saveItem(firstRow)
        .then(function() {
          //go through fields and update them
          angular.forEach($scope.itemsSelected, function(rowEntity, index) {

            // the first row is already saved
            if (index == 0) {
              return;
            }

            var task = $scope.saveItem(rowEntity);
            tasks.push(task);
          });
          return $q.all(tasks);
        })
        .then(function() {
          WSAlert.success($translate.instant('wsalert.success.item_saved'));
        })
        .finally($uibModalInstance.dismiss);
    }

    $scope.saveItem = function(modifiedItem) {
      var extendedCategory;
      var list = modifiedItem.list;

      return Category.getAll($state.params.eventId)
      .then(function(categories) {

          if($scope.editForm.category.$dirty) {
            var cat = categories.filter(function (cat) {
              return cat.id == $scope.editedItem.category.id
            });
            if(cat.length > 0){
              modifiedItem.category = cat[0];
            }
          }

          if($scope.editForm.status.$dirty) {
            modifiedItem.status = $scope.editedItem.status;
          }

          if($scope.editForm.price.$dirty) {
            modifiedItem.price = $scope.editedItem.price;
          }

          extendedCategory = modifiedItem.category;
          extendedCategory.list = list;
          modifiedItem.category_id = modifiedItem.category.id;
          modifiedItem.tier_id = $scope.editedItem.tier;

          return Items.saveItem(modifiedItem, $state.params.eventId);
        })
        .then(function(res) {
          modifiedItem.category = extendedCategory;
        })
        .catch(function(err) {
          var message = $translate.instant(
            'wsalert.danger.item_could_not_be_saved',
            {itemName: modifiedItem.description.text, error: err}
          );
          WSAlert.danger(message);
          throw err;
        });
    }

    $scope.isFormValid = function() {
      var isCategorValid =
        $scope.editForm.category.$modelValue ||
        !$scope.editForm.category.$dirty;

      return isCategorValid;
    }
  });
