(function () {
  'use strict';

  angular.module('ilApp').controller('switchSuppliedItemCtrl', function ($scope, $translate, $uibModalInstance, WSAlert, ItemCategory, SuppliedItem) {

    $scope.selectedLanguage = $translate.use();
    $scope.searchActive = false;

    $scope.categoryStack = [];

    //load item categories
    ItemCategory.getAllCategory($scope.event_id).then(function (res) {
      $scope.categories = res.categories;
    },
    function (error) {
      WSAlert.danger(error);
    });

    $scope.selectParentCategory = function (category, index) {
      while ($scope.categoryStack.length > index) {
        $scope.categoryStack.pop();
      }
      $scope.selectedCategory = category;
      $scope.updateCategories();
    };

    $scope.selectCategory = function (category) {
      if ($scope.selectedCategory) {
        $scope.categoryStack.push($scope.selectedCategory);
      }
      $scope.selectedCategory = category;
      $scope.updateCategories();
    };

    $scope.updateCategories = function () {
      $scope.searchResults = null;
      $scope.searchTerm = null;
      $scope.searchActive = false;
      if ($scope.selectedCategory !== null) {
        SuppliedItem.getItems($scope.event_id, $scope.searchTerm, $scope.selectedCategory.id).then(function (result) {
          $scope.searchResults = result;
        });
      }
    };

    $scope.search = function () {
      if ($scope.searchTerm) {
        $scope.searchActive = true;
        $scope.selectedCategory = null;
        $scope.selectedSubCategory = null;
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
