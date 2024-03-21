(function () {
  'use strict';

  angular.module('ilApp').controller('switchSuppliedItemCtrl', function ($scope, $translate, $uibModalInstance, ItemCategory, SuppliedItem) {

    $scope.selectedLanguage = $translate.use();
    $scope.searchActive = false;

    //load item sub categories
    ItemCategory.getAllSubCategory($scope.event_id).then(function (res) {
      $scope.subCategories = res.categories;
    },
    function (error) {
      WSAlert.danger(error);
    });
    //load item categories
    ItemCategory.getAllCategory($scope.event_id).then(function (res) {
      $scope.categories = res.categories;
    },
    function (error) {
      WSAlert.danger(error);
    });

    $scope.selectCategory = function (category) {
      $scope.selectedCategory = category;
      $scope.selectedSubCategory = null;
      $scope.searchResults = null;
      $scope.searchTerm = null;
      $scope.searchActive = false;
    };
    $scope.selectSubCategory = function (subCategory) {
      $scope.selectedSubCategory = subCategory;
      $scope.searchResults = null;
      $scope.searchTerm = null;
      $scope.searchActive = false;
      SuppliedItem.getItems($scope.event_id, $scope.searchTerm, $scope.selectedSubCategory.id).then(function (result) {
        $scope.searchResults = result;
      });
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
