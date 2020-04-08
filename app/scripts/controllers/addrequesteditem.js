'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:addRequestedItemCtrl
 * @description
 * # addRequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('addRequestedItemCtrl', function ($scope, $uibModalInstance, Status, $state, MULTIPLIERS, $timeout, Items, ItemCategory, WSAlert, MULTIPLIER_DEFAULT, auth, APP_ID, APP_ROLES, UNITS, $translate) {

    $scope.item = $scope.item || {}; //can be already set if called from catalogue view
    $scope.item.multiplier = MULTIPLIER_DEFAULT;
    $scope.UNITS = UNITS;
    $scope.statuses = [];
    $scope.showChangeHint = false;
    $scope.showCloneHint = false;
    $scope.splitDetails = {};

    //ensure multipliers are set
    $scope.multipliers = $scope.multipliers || MULTIPLIERS;

    $scope.disableInput = false;

    Status.getAllStatuses($state.params.eventId).then(function (result) {
      $scope.statuses = result;
    });

    $scope.$watch('suppliedItem', function (val1, val2) {
      if (typeof val1 !== 'undefined' && typeof val1.title !== 'undefined'){
        $scope.disableInput = true;
        //hide help alerts
        $scope.showCloneHint = $scope.showChangeHint = false;
      }
      if($scope.suppliedItem && $scope.suppliedItem.originalObject && $scope.suppliedItem.originalObject.id == void 0) $scope.showChangeHint = false;
    });

    $scope.selectedLanguage = $translate.use();

    $scope.supplierValue = false;

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.canEditItemStatus = hasUserRole;
    });

    ItemCategory.getAllSubCategory($scope.event_id).then(function (res) {
      $scope.subCategories = res.categories;
    },
    function (error) {
      WSAlert.danger(error);
    });

    $scope.splitItem = function(){
      //force a new objec to be created and category selection to show up
      $scope.item.split_supplied_item = true;
      //copy to split details for later use
      angular.copy($scope.suppliedItem, $scope.splitDetails);
      $scope.suppliedItem.originalObject = $scope.suppliedItem.originalObject.description.text;
      $scope.showCloneHint = true;
    }

    $scope.unSplitItem = function(){
      $scope.item.split_supplied_item = false;
      $scope.showCloneHint = false;
      //clear split details
      $scope.splitDetails = {};
      $scope.rename();
    }

    $scope.rename = function () {
      $scope.suppliedItem = {};
      $scope.disableInput = false;
      $scope.focus('id_value');
      $scope.showChangeHint = true;
    };

    $scope.focus = function(id){
      $timeout(function(){
        var field = document.getElementById(id);
        field.focus();
      }, 0);
    };

    $scope.addItem = function () {

      $scope.loading.addItem = true;

      //set supplier from autocomplete
      if ($scope.item.selectedSupplier != void 0
          && $scope.item.selectedSupplier.originalObject.id != void 0) {
        $scope.item.supplier = $scope.item.selectedSupplier.originalObject;
      }
      else if ($scope.supplierValue != false) {
          $scope.item.supplier = {
            name: $scope.supplierValue
          };
      }

      var split_supplied_item = $scope.item.split_supplied_item || false;
      delete $scope.item.split_supplied_item; //get rid of extra param

      //set list and category
      if ($scope.suppliedItem.force === true) {
        $scope.item.list_id = $scope.newLinkedItem.skill.list_id;
        $scope.item.category_id = $scope.newLinkedItem.category.id;
      } else {
        $scope.item.list_id = $scope.listId;
        $scope.item.category_id = $scope.categoryId;
      }

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
      else if(split_supplied_item){
        //get details from splitDetails object clone
        $scope.item.supplied_item = $scope.splitDetails.originalObject;
        //get description from supplied item
        $scope.item.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.suppliedItem.originalObject,
        };
      }
      else {
        //get description from supplied item
        $scope.item.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.suppliedItem.originalObject,
        };
        $scope.item.supplied_item = null;
      }//creating completely new item

      //add the requested item
      Items.addItem($scope.item, $scope.event_id, true, split_supplied_item).then(function (result) {
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
        $scope.items.push(result);

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
