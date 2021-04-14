(function () {
  'use strict';

  angular.module('ilApp').controller('switchSuppliedItemCtrl', function ($scope, $translate, $uibModalInstance, SuppliedItem) {

    $scope.selectedLanguage = $translate.use();

    $scope.search = function () {
      if ($scope.searchTerm) {
        SuppliedItem.getItems($scope.event_id, $scope.searchTerm).then(function (result) {
          $scope.searchResults = result;
        });
      }
    };

    $scope.createNewSuppliedItem = function () {
      var suppliedItem = {};
      suppliedItem.description = {
        lang_code: $scope.selectedLanguage,
        text: $scope.searchTerm,
      };
      suppliedItem.event = $scope.event;

      $uibModalInstance.close(suppliedItem);
    };

    $scope.selectSuppliedItem = function (suppliedItem) {
      $uibModalInstance.close(suppliedItem);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  });

})();
