'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:addRequestedItemCtrl
 * @description
 * # addRequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('addRequestedItemCtrl', function ($scope, $uibModalInstance, Items, WSAlert, MULTIPLIER_DEFAULT) {

    $scope.item = {
      multiplier: MULTIPLIER_DEFAULT,
    };

    $scope.disableInput = false;

    $scope.$watch('suppliedItem', function (val1, val2) {
      if (typeof val1 !== 'undefined' && typeof val1.title !== 'undefined')
        $scope.disableInput = true;
    });

    $scope.supplierValueAdd = false;

    $scope.rename = function () {
      $scope.suppliedItem = {};
      $scope.disableInput = false;
    };

    $scope.addItem = function () {

      $scope.loading.addItem = true;

      //set supplier from autocomplete
      if ($scope.item.selectedSupplier != void 0
          && $scope.item.selectedSupplier.originalObject.id != void 0) {
        $scope.item.supplier = $scope.item.selectedSupplier.originalObject.name;
      }      else if ($scope.item.selectedSupplier != void 0)
       $scope.item.supplier = $scope.item.selectedSupplier.originalObject;
      else if ($scope.supplierValueAdd != false)
          $scope.item.supplier = $scope.supplierValueAdd;

      //set category or parent depending on if parent exists
      if ($scope.addParent == 0)
          $scope.item.category = $scope.categoryId;
      else
          $scope.item.parent_id = $scope.addParent.id;

      //if supplied item selected - use link together
      if (typeof $scope.suppliedItem.originalObject.id !== 'undefined') {
        //get description from supplied item
        $scope.item.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.suppliedItem.originalObject.description.text,
        };

        //copy supplied item from selected object
        $scope.item.supplied_item = $scope.suppliedItem.originalObject;

      }//if supplied item selected
      else {
        //get description from supplied item
        $scope.item.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.suppliedItem.originalObject,
        };
        $scope.item.supplied_item = null;
      }//creating completely new item

      //add the requested item
      Items.addItem($scope.item, $scope.event_id).then(function (result) {
        $scope.pushItem(result);
      },

        function (error) {
          WSAlert.danger(error);
          $uibModalInstance.dismiss();
          $scope.loading.addItem = false;
        });
    };

    $scope.pushItem = function (result) {
      //Push the new item into the items tree
      if ($scope.addParent == 0)
          $scope.items.push(result);
      else {
        //add under the correct parent
        angular.forEach($scope.items, function (val, key) {
          if (val.id == $scope.addParent.id)
              $scope.items[key].child_items.push(result);
        });
      }

      //clear and dismiss the form
      $scope.addForm.$setPristine();
      $uibModalInstance.dismiss();
      $scope.loading.addItem = false;
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    $scope.supplierChangedAdd = function (val) {
      $scope.supplierValueAdd = val;
    };

  });
