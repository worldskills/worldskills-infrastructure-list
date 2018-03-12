(function () {
  'use strict';

  angular.module('ilApp').controller('switchSuppliedItemCtrl', function ($scope, $http, $uibModalInstance, SuppliedItem) {

    $scope.search = function () {
      if ($scope.searchTerm) {
        SuppliedItem.getItems($scope.event_id, $scope.searchTerm).then(function (result) {
          $scope.searchResults = result;
        });
      }
    };

    $scope.selectSuppliedItem = function (suppliedItem) {
      $uibModalInstance.close(suppliedItem);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  });

})();
