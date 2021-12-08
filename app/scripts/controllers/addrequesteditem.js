'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:addRequestedItemCtrl
 * @description
 * # addRequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('addRequestedItemCtrl', function ($scope, $uibModalInstance, Status, $state, $q, $aside, MULTIPLIERS, $timeout, Items, WSAlert, MULTIPLIER_DEFAULT, auth, APP_ID, APP_ROLES, UNITS, $translate) {

    var createSuppliedItem = false;

    $scope.item = $scope.item || {}; //can be already set if called from catalogue view
    $scope.item.multiplier = MULTIPLIER_DEFAULT;
    $scope.UNITS = UNITS;
    $scope.statuses = [];
    $scope.splitDetails = {};

    //ensure multipliers are set
    $scope.multipliers = $scope.multipliers || MULTIPLIERS;

    $scope.disableInput = false;

    Status.getAllStatuses($state.params.eventId).then(function (result) {
      $scope.statuses = result;
    });

    $scope.selectedLanguage = $translate.use();

    $scope.supplierValue = false;

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.canEditItemStatus = hasUserRole;
    });

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
        $scope.item.list_id = $scope.newLinkedItem.list.id;
        $scope.item.category_id = $scope.newLinkedItem.category.id;
      } else {
        $scope.item.list_id = $scope.listId;
        $scope.item.category_id = $scope.categoryId;
      }

      //if supplied item selected - use link together
      if($scope.suppliedItem.force === true) { //catalogue view
        $scope.item.description.lang_code = $scope.selectedLanguage;
        $scope.item.supplied_item = $scope.suppliedItem;
      }
      else {
        //get description from supplied item
        $scope.item.description = {
          lang_code: $scope.selectedLanguage,
          text: '',
        };
        
        if (!$scope.item.supplied_item.id) {
          createSuppliedItem = true;
        }
        //$scope.item.supplied_item = null;
      }//creating completely new item

      //add the requested item
      Items.addItem($scope.item, $scope.event_id, true, split_supplied_item, createSuppliedItem).then(function (result) {
        auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_REQUESTED_ITEMS_ALWAYS], $scope.event.entity_id).then(function (hasUserRole) {
          if (hasUserRole) {
            result.canEdit = true;
          } else {
            result.canEdit = result.status.allow_editing;
          }
        });
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

    // edit supplied item
    $scope.editSuppliedItem = function() {

      var scope = $scope.$new();
      scope.suppliedItemAsideAdd = false;
      scope.suppliedItemAsideFiles = false;
      scope.rowItem = angular.copy($scope.item.supplied_item);
      scope.item = angular.copy(scope.rowItem);

      $scope.saveRow = function (rowEntity){
        rowEntity.description.lang_code = $translate.use();
        $scope.item.supplied_item = rowEntity;
        return $q.resolve();
      };

      $aside.open({
        templateUrl: 'views/editsupplieditemaside.html',
        placement: 'right',
        size: 'md',
        scope: scope,
        backdrop: true,
        controller: 'editSuppliedItemCtrl',
      });

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
