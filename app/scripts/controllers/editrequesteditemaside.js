'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:editRequestedItemAsideCtrl
 * @description
 * # editRequestedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('editRequestedItemAsideCtrl', function ($scope, $uibModalInstance, Items, WSAlert, $translate, MULTIPLIERS, UNITS) {

    $scope.multipliers = MULTIPLIERS;
    $scope.UNITS = UNITS;

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

    $scope.saveItem = function (item, itemIndex) {

      var extended = false;

      //fix category --> RequestedItemExtendedView --> RequestedItemView
      if (typeof item.category == 'object') {
        extended = true;
      }

      //set supplier from autocomplete
      if (item.selectedSupplier != void 0
        && item.selectedSupplier.originalObject.id != void 0) {
        item.supplier = item.selectedSupplier.originalObject;
      } else if ($scope.supplierValue !== false) {
        item.supplier =  {
          name: $scope.supplierValue
        };
      }

      Items.saveItem(item, $scope.event_id, extended).then(function (result) {
          $scope.activeItem = false;

          if (typeof itemIndex !== 'undefined' && $scope.items && ((typeof result.category !== 'undefined' && result.category != $scope.categoryId) || (typeof result.category_id !== 'undefined' && result.category_id != $scope.categoryId))) {
            //category changed, remove from list
            $scope.items.splice(itemIndex, 1);
          }

          //set readable quantity as it's coming from API rather than bound to the scope model
          item.readable_quantity = result.readable_quantity;
          $scope.editModal.close(result);
        },
        function (error) {
          WSAlert.danger(error);
        });
    };
  });
