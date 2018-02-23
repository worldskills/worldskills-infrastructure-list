'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:recommendedItemAsideCtrl
 * @description
 * # recommendedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('recommendedItemAsideCtrl', function ($scope, $uibModalInstance, Items, WSAlert, MULTIPLIERS, ITEM_STATUS, ITEM_STATUS_TEXT) {

    $scope.multipliers = MULTIPLIERS;

    $scope.recommendedItem = {};

    if($scope.item && $scope.item.id) {
      $scope.recommendedItem = {
        recommended_item_id : $scope.item.id,
        description : $scope.item.description,
        quantity : $scope.item.quantity,
        multiplier : $scope.item.multiplier,
        multiply_factor : $scope.item.multiply_factor,
        potential_supplier : $scope.item.supplier,
        wrong_supplied_item : false
      };
    }

    function closeDialog(){
        $scope.editModal.close(null);
    };

    $scope.editItem = function(item, index){
      closeDialog();
    };

    $scope.factorNeeded = function (multiplierId) {
      var retval = false;

      angular.forEach($scope.multipliers, function (val) {
        if (val.id == multiplierId && val.x_number_needed === true) retval = true;
      });

      return retval;
    };

    $scope.saveItem = function (recommendedItem) {

      /*if(item.id != null) {
        recommendedItem.requestedItemId = item.id;
      } 

      recommendedItem.description = item.description;
      recommendedItem.quantity = item.quantity;
      recommendedItem.multiplier = item.multiplier;
      recommendedItem.potentialSupplier = item.supplier
      //fix category --> RequestedItemExtendedView --> RequestedItemView
      var category = angular.copy(item.category); //keep a copy for safekeeping
      item.category = item.category.id;

      //set supplier from autocomplete
      if (item.selectedSupplier != void 0
        && item.selectedSupplier.originalObject.id != void 0) {
        item.supplier = item.selectedSupplier.originalObject.name;
      }      else if (item.selectedSupplier != void 0) {
        item.supplier = item.selectedSupplier.originalObject;
      }      else if ($scope.supplierValue !== false) {
        item.supplier = $scope.supplierValue;
      }

      Items.saveItem(item, $scope.event_id, true).then(function (result) {
          $scope.activeItem = false;

          //set readable quantity as it's coming from API rather than bound to the scope model
          item.readable_quantity = result.readable_quantity;
          $scope.editModal.close(result);
        },
        function (error) {
          WSAlert.danger(error);
        });*/
    };
  });
