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

      angular.forEach($scope.itemsSelected, function(i, k) {
        var task = $scope.saveItem(i);
        tasks.push(task);
      });

      Promise
        .all(tasks)
        .then(WSAlert.success($translate.instant('WSALERT.SUCCESS.ITEM_SAVED')));
    }

    $scope.saveItem = function(modifiedItem) {
      var extendedCategory;
      var list = modifiedItem.category.list;

      return Items.getCategories(modifiedItem.category.list.skill.id)
        .then(function(categories){
          if($scope.editForm.category.$dirty){
            var cat = categories.filter(function (cat) {
              return cat.category.id == $scope.editedItem.category.id
            });
            if(cat.length > 0){
              modifiedItem.category = cat[0];
            }
          }

          if($scope.editForm.status.$dirty){
            modifiedItem.status = $scope.editedItem.status;
          }

          if($scope.editForm.price.$dirty){
            modifiedItem.price = $scope.editedItem.price;
          }

          if($scope.editForm.supplier.$dirty){
            if ($scope.editedItem.supplier == null ) {
              modifiedItem.supplier = $scope.editForm.supplier.$modelValue;
            } else {
              modifiedItem.supplier = $scope.editedItem.supplier && $scope.editedItem.supplier.title;
            }
          }
          extendedCategory = modifiedItem.category;
          extendedCategory.list = list;
          modifiedItem.category = modifiedItem.category.id;

          return Items.saveItem(modifiedItem, $state.params.eventId);
        })
        .then(function(res){
          modifiedItem.category = extendedCategory;
          $uibModalInstance.dismiss();
        })
        .catch(function(err){
          WSAlert.danger(err);
          $uibModalInstance.dismiss();
        });
    }

  });
