'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:editSuppliedItemCtrl
 * @description
 * # editSuppliedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('editSuppliedItemCtrl', function ($scope, $timeout, SuppliedItem, uiGridConstants, $uibModalInstance, WSAlert) {

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    $scope.dateOptions = {
      startingDay: 1,
      initDate: '2017-08-01'
    };

    $scope.item.updateRequested = false;

    $scope.supplierValueAdd = false;

    $scope.saveItemDetails = function(){
      $scope.loading.aside = true;

      $scope.pickSupplier();

      //keep history in case saving fails
      var history = {};
      angular.extend(history, $scope.rowItem);

      //copy modified data back to rowItem for saving - rowItem contains promise for saving rows, which reflects changes in grid
      angular.extend($scope.rowItem, $scope.item);

      $scope.saveRow($scope.rowItem, $scope.item.updateRequested).then(function(res){
        //copying to grid already done in saveRow in eventcatalogue.js
        //  angular.extend($scope.rowItem, res);
        //$scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
          $scope.loading.aside = false;
          // JSTEXT.WSALERT.SUCCESS.ITEM_SAVED
          WSAlert.success("Item saved");
          $uibModalInstance.dismiss();
        },
        function (error){
          //rollback history for rowItem in case of failure
          angular.extend($scope.rowItem, history);

          $scope.loading.aside = false;
          //alert already shown in $scope.saveRow()
        });
    };

    $scope.removeFile = function(file, index){
      SuppliedItem.removeFile($scope.item, file).then(function(res){
        $scope.item.files.splice(index, 1);
      }, function(error){
        WSAlert.danger(error);
      });
    }

    $scope.addItemDetails = function(){
      $scope.loading.aside = true;

      $scope.pickSupplier();

      $scope.item.event = $scope.selectedEvent;

      SuppliedItem.createItem($scope.item, $scope.selectedEvent.id).then(function(res){
          //add to grid - to the top
          $scope.gridOptions.data.unshift(res);

          //notify data change
          $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);

          //select neewly created row
          //var lastRow = $scope.gridOptions.data.length - 1;

          //scroll to row and select it
          $timeout(function() {
            $scope.gridApi.cellNav.scrollToFocus($scope.gridOptions.data[0], $scope.gridOptions.columnDefs[1]);
            //$scope.gridApi.selection.selectRow($scope.gridOptions.data[lastRow]);
          });

          $scope.loading.aside = false;
          $uibModalInstance.dismiss();

        },
        function(error){
          WSAlert.danger(error);
          $scope.loading.aside = false;
        })
    };

    $scope.supplierChanged = function (val) {
      $scope.supplierValueAdd = val;
    };

    $scope.pickSupplier = function () {
      //set supplier from autocomplete
      if ($scope.item.selectedSupplier != void 0
        && $scope.item.selectedSupplier.originalObject.id != void 0) {
        $scope.item.supplier = $scope.item.selectedSupplier.originalObject.name;
      }      else if ($scope.item.selectedSupplier != void 0)
        $scope.item.supplier = $scope.item.selectedSupplier.originalObject;
      else if ($scope.supplierValueAdd != false)
        $scope.item.supplier = $scope.supplierValueAdd;

      delete $scope.item.selectedSupplier;
    };

    // $scope.updateStatus = function(item){
    //   angular.forEach($scope.statusValues, function(val){
    //     if(item.status.id == val.id.id) item.status.name.text = val.id.name.text;
    //   });
    // };

  });
