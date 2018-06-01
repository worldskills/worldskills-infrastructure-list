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
    WSAlert,
    Auth,
    APP_ROLES,
    API_IL,
    Items
  ) {

    $scope.APP_ROLES = APP_ROLES;

    $scope.canEditItemStatus = Auth.hasRole(APP_ROLES.ADMIN) || Auth.hasRole(APP_ROLES.EDIT_ITEM_STATUS);

    $scope.asideState = {
      open: true,
    };

    $scope.searchSupplierAPI = API_IL + '/suppliers/'+ $state.params.eventId + "/search?q=";

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
    $scope.editedItem.supplier = $scope.itemsSelected[0].supplier;
    $scope.editedItem.price = $scope.itemsSelected[0].price;
    $scope.editedItem.category = $scope.itemsSelected[0].category.category;

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
      if($scope.editedItem.category && $scope.editedItem.category.id !== v.category.category.id)
      {
        $scope.editedItem.category = null;
        $scope.multipleCategory = true;
      }
      if($scope.editedItem.supplier !== v.supplier)
      {
        $scope.editedItem.supplier = null;
        $scope.multipleSupplier = true;
      }
    });

    $scope.supplierChanged = function (val) {
      $scope.editedItem.supplier = val;
    };

    $scope.saveItems = function(){
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

            var task = $scope.saveItem(rowEntity, false);
            tasks.push(task);
          });
          return $q.all(tasks);
        })
        .then(function() {
          WSAlert.success($translate.instant('WSALERT.SUCCESS.ITEM_SAVED'));
        })
        .finally($uibModalInstance.dismiss);
    }

    $scope.saveItem = function(modifiedItem) {
      var extendedCategory;
      var list = modifiedItem.category.list;

      return Items.getCategories(modifiedItem.category.list.skill.id)
      .then(function(categories) {

          if($scope.editForm.category.$dirty) {
            var cat = categories.filter(function (cat) {
              return cat.category.id == $scope.editedItem.category.id
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

          if($scope.editForm.supplier.$dirty) {
            if ($scope.editedItem.supplier != void 0) {
              modifiedItem.supplier = $scope.editedItem.supplier.originalObject;
            } else {
              modifiedItem.supplier = {
                name : $scope.editForm.supplier.$modelValue
              }
            }
          }

          extendedCategory = modifiedItem.category;
          extendedCategory.list = list;
          modifiedItem.category = modifiedItem.category.id;

          return Items.saveItem(modifiedItem, $state.params.eventId);
        })
        .then(function(res) {
          modifiedItem.category = extendedCategory;
        })
        .catch(function(err) {
          var message = $translate.instant(
            'WSALERT.DANGER.ITEM_COULD_NOT_BE_SAVED',
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
