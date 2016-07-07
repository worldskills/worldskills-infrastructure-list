'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:editSuppliedItemCtrl
 * @description
 * # editSuppliedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('editSuppliedItemCtrl', function ($scope, SuppliedItem, $uibModalInstance, WSAlert) {

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    $scope.saveItemDetails = function(){
      $scope.loading.aside = true;

      //keep history in case saving fails
      var history = {};
      angular.extend(history, $scope.rowItem);

      //copy modified data back to rowItem for saving - rowItem contains promise for saving rows, which reflects changes in grid
      angular.extend($scope.rowItem, $scope.item);

      $scope.saveRow($scope.rowItem).then(function(res){
        $scope.loading.aside = false;
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

    $scope.addItemDetails = function(){
      $scope.loading.aside = true;

      $scope.item.event = $scope.selectedEvent;

      SuppliedItem.createItem($scope.item, $scope.selectedEvent.id).then(function(res){
        WSAlert.success("Item saved");
        $scope.loading.aside = false;
        $uibModalInstance.dismiss();
      },
      function(error){
        WSAlert.danger(error);
        $scope.loading.aside = false;
      })
    };

    // $scope.updateStatus = function(item){
    //   angular.forEach($scope.statusValues, function(val){
    //     if(item.status.id == val.id.id) item.status.name.text = val.id.name.text;
    //   });
    // };

  });
