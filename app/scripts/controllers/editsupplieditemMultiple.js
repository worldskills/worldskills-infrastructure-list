'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:editSuppliedItemMultipleCtrl
 * @description
 * # editSuppliedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('editSuppliedItemMultipleCtrl', function ($scope, $timeout, SuppliedItem, uiGridConstants, $uibModalInstance, WSAlert, $translate, SUPPLIED_ITEM_PRIORITIES) {

    $scope.priorities = SUPPLIED_ITEM_PRIORITIES;
    const UI_GRID_ITEM_KEY = "$$hashKey";
    const EXCLUDED_FIELDS = [UI_GRID_ITEM_KEY, 'id', 'linkedItems', 'multiple_linked_items', 'user_generated', 'description', 'event', 'files'];

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };


    $scope.dateOptions = {
      startingDay: 1,
      initDate: '2017-08-01' //TODO configure from event
    };

    if ($scope.items == undefined || $scope.items.length < 2) {
      alert($translate.instant("alert.you_need_to_select_at_least_one_item"));
      return;
    }

    $scope.init = function(){
      //go through selected items

      //don't update the description
      delete $scope.item['description'];
      delete $scope.item['files'];

      angular.forEach($scope.items, function(val, key){
        //go through all the fields and find where values are the same between every field
        angular.forEach(val, function(itemVal, itemKey){

          //fix delivery date field
          if(itemKey === 'delivery')
            $scope.item[itemKey] = ($scope.item[itemKey] != void 0 && $scope.item[itemKey] !== '')
            ? new Date($scope.item[itemKey])
            : "";

          if(EXCLUDED_FIELDS.indexOf(itemKey) === -1){
            if(itemVal === "" || itemVal === null
            || (typeof $scope.item[itemKey] === 'object' && JSON.stringify($scope.item[itemKey]) !== JSON.stringify(itemVal)) //object comparison, a bit dirty but works nicely
            || (typeof $scope.item[itemKey] !== 'object' && $scope.item[itemKey] !== itemVal)
          ){
              delete $scope.item[itemKey];
            }
          }
        });
      });

    }

    $scope.supplierValueAdd = false;

    $scope.saveItemDetailsMultiple = function(){
      $scope.loading.aside = true;

      $scope.pickSupplier();

      //keep history in case saving fails
      var history = {};
      angular.extend(history, $scope.rowItems);

      //copy modified data back to rowItems for saving - rowItems contains promises for saving rows, which reflects changes in grid
      angular.forEach($scope.rowItems, function(itemVal, itemKey){
        //go through fields
        angular.forEach(itemVal, function(fieldVal, fieldKey){
          if($scope.item[fieldKey] !== null && $scope.item[fieldKey] !== '' && EXCLUDED_FIELDS.indexOf(fieldKey) === -1)
          if($scope.item[fieldKey] !== null && EXCLUDED_FIELDS.indexOf(fieldKey) === -1)
            $scope.items[itemKey][fieldKey] = $scope.item[fieldKey];
        });
      });


      angular.extend($scope.rowItems, $scope.items);

      $scope.saveRows($scope.rowItems, false).then(function(res){
        //copying to grid already done in saveRow in eventcatalogue.js
        //  angular.extend($scope.rowItem, res);
        //$scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
          $scope.loading.aside = false;
          WSAlert.success($translate.instant('wsalert.success.item_saved'));
          $uibModalInstance.dismiss();
        },
        function (error){
          //rollback history for rowItem in case of failure
          angular.extend($scope.rowItems, history);

          $scope.loading.aside = false;
          //alert already shown in $scope.saveRow()
        });
    };


    $scope.supplierChanged = function (val) {
      $scope.supplierValueAdd = val;
    };

    $scope.pickSupplier = function () {
      //set supplier from autocomplete
      if ($scope.item.selectedSupplier != void 0
        && $scope.item.selectedSupplier.originalObject.id != void 0) {
        $scope.item.supplier = $scope.item.selectedSupplier.originalObject;
      } if ($scope.supplierValueAdd != false) {
        $scope.item.supplier = {
          name: $scope.supplierValueAdd
        };
      }

      delete $scope.item.selectedSupplier;
    };

    $scope.init();


  });
