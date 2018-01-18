'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:addRequestedItemCtrl
 * @description
 * # addRequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('addRequestedItemCtrl', function ($scope, $uibModalInstance, MULTIPLIERS, Items, WSAlert, MULTIPLIER_DEFAULT, ITEM_STATUS, ITEM_STATUS_TEXT, ITEM_STATUS_DEFAULT) {

    $scope.item = $scope.item || {}; //can be already set if called from catalogue view
    $scope.item.multiplier = MULTIPLIER_DEFAULT;

    //ensure multipliers are set
    $scope.multipliers = $scope.multipliers || MULTIPLIERS;

    //Defining status values for status dropdown in edition form
    $scope.statusValues = [
      {id: {id: ITEM_STATUS.RED, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.RED'}}, value: ITEM_STATUS_TEXT.RED},
      {id: {id: ITEM_STATUS.YELLOW, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.YELLOW'}}, value: ITEM_STATUS_TEXT.YELLOW},
      {id: {id: ITEM_STATUS.GREEN, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.GREEN'}}, value: ITEM_STATUS_TEXT.GREEN},
      {id: {id: ITEM_STATUS.BLACK, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.BLACK'}}, value: ITEM_STATUS_TEXT.BLACK},
    ];

    $scope.item.status = ITEM_STATUS_DEFAULT;

    $scope.disableInput = false;

    $scope.$watch('suppliedItem', function (val1, val2) {
      if (typeof val1 !== 'undefined' && typeof val1.title !== 'undefined')
        $scope.disableInput = true;
    });

    $scope.supplierValue = false;

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
      }
      else if ($scope.item.selectedSupplier != void 0)
       $scope.item.supplier = $scope.item.selectedSupplier.originalObject;
      else if ($scope.supplierValue != false)
          $scope.item.supplier = $scope.supplierValue;


      //set category or parent depending on if parent exists
      if($scope.suppliedItem.force === true)
        $scope.item.category = $scope.newLinkedItem.category.id;
      else if ($scope.addParent == 0)
          $scope.item.category = $scope.categoryId;
      else
          $scope.item.parent_id = $scope.addParent.id;

      //if supplied item selected - use link together
      if($scope.suppliedItem.force === true) { //catalogue view
        $scope.item.description.lang_code = $scope.selectedLanguage;
        $scope.item.supplied_item = $scope.suppliedItem.originalObject;
      }
      else if (typeof $scope.suppliedItem.originalObject.id !== 'undefined') {
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
      Items.addItem($scope.item, $scope.event_id, true).then(function (result) {
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
      if(!$scope.suppliedItem.force) { //normal requested items view
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
      }
      else if($scope.suppliedItem.force === true){ //in catalogue view
        //return result via modal so that it can be added to the catalogue view's dialog
        $scope.newModal.close(result);
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };


    //link helper function from items
    $scope.factorNeeded = Items.factorNeeded;


    $scope.supplierChanged = function (val) {
      $scope.supplierValue = val;
    };

  });
