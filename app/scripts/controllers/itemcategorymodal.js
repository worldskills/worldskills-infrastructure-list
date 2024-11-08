'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ItemCategoryCtrl
 * @description
 * # ItemCategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ItemCategoryModalCtrl', function ($q, $scope, $state, $confirm, $translate,uiGridConstants, $uibModalInstance, $filter, $aside, ItemCategory, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.data = {};

    $scope.asideState = {
      open: true,
    };

    var previousParentId = $scope.item.parent_id;

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };


    $scope.categories = $scope.$parent.data.categories;
    $scope.categoriesFlat = [];
    // flatten categories
    function flattenCategories(categories, path) {
      angular.forEach(categories, function (category) {
        category.path = path;
        $scope.categoriesFlat.push(category);
        if (category.children) {
          flattenCategories(category.children, category.name.text + ' / ' + path);
        }
      });
    }
    flattenCategories($scope.categories, '');

    $scope.saveItemCategory = function (index) {
      $scope.loading.aside = true;
      $scope.item.name.lang_code = $translate.use();

      if ($scope.item.id == null) {
        ItemCategory.createItem($scope.item, $state.params.eventId)
          .then(function (res) {
            if (res.parent_id == null) {
              $scope.$parent.data.categories.push(res);
            } else {
              // child item, reload page to refresh tree
              $state.reload();
            }
            $scope.loading.aside = false;
            $uibModalInstance.dismiss();
          })
          .catch(function (error) {
            WSAlert.danger(error);
            $scope.loading.aside = false;
          });
      } else {
        ItemCategory.saveItem($scope.item, $state.params.eventId)
          .then(function (res) {
            if (previousParentId !== $scope.item.parent_id) {
              // parent changed, reload page to refresh tree
              $state.reload();
            }
            $scope.loading.aside = false;
            $uibModalInstance.dismiss();
          })
          .catch(function (error) {
            WSAlert.danger(error);
            $scope.loading.aside = false;
          });
      }

    };
  });
