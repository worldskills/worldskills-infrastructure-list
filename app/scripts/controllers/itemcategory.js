'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ItemCategoryCtrl
 * @description
 * # ItemCategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ItemCategoryCtrl', function ($q, $scope, $state, $confirm, $translate, $aside, Language, ItemCategory, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.data = {};
    $scope.APP_ROLES = APP_ROLES;
    $scope.loading.subCategories = true;

    $q.when($scope.appLoaded.promise).then(function () {
      //load item sub categories
      ItemCategory.getAllSubCategory($state.params.eventId).then(function (res) {
        $scope.data.subCategories = res.categories;
        $scope.loading.subCategories = false;
      },
      function (error) {
        WSAlert.danger(error);
        $scope.loading.subCategories = false;
      });
      //load item categories
      ItemCategory.getAllCategory($state.params.eventId).then(function (res) {
        $scope.data.categories = res.categories;
      },
      function (error) {
        WSAlert.danger(error);
      });
    });

    $scope.asideState = {
      open: true,
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $scope.openItemEditor = function (item, isCategory, index) {
      if (item == undefined || !item.id) {
        $scope.item = {
          name: {text: '', lang_code: Language.selectedLanguage},
        };
      } else {
        $scope.item = {};
        angular.copy(item, $scope.item);
        $scope.rowItem = item;
      }

      $scope.isCategory = isCategory;
      $scope.index = index;

      $aside.open({
        templateUrl: 'views/item-category-aside.html',
        placement: 'right',
        size: 'md',
        scope: $scope,
        backdrop: true,
        controller: 'ItemCategoryModalCtrl',
      }).result.then(postClose, postClose);
    };

    $scope.removeItemCategory = function (itemCategory, isCategory) {
      var entityCode = isCategory ? 'CATEGORY' : 'SUB_CATEGORY';

      $confirm({
        title: $translate.instant('DELETE_ITEM_'+entityCode+'.TITLE'),
        text: $translate.instant('DELETE_ITEM_'+entityCode+'.TEXT', {text: itemCategory.name.text}),
      }).then(function () {
        return ItemCategory.removeItemCategory(itemCategory);
      }).then(function (result) {
        var entities = isCategory ? $scope.data.categories : $scope.data.subCategories;
        var index = entities.indexOf(itemCategory);
        entities.splice(index, 1);
      }).catch(function (error) {
        WSAlert.danger(error);
      });
    };
  });
