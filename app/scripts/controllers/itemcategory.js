'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ItemCategoryCtrl
 * @description
 * # ItemCategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ItemCategoryCtrl', function ($q, $scope, $state, $stateParams, $confirm, $translate, $aside, Events, Language, ItemCategory, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.data = {};

    Events.getEvent($stateParams.eventId).then( function (event) {
      $scope.event = event;
    });

    //load item categories
    ItemCategory.getAllCategory($state.params.eventId).then(function (res) {
      $scope.data.categories = res.categories;
    },
    function (error) {
      WSAlert.danger(error);
    });

    $scope.asideState = {
      open: true,
    };

    $scope.showItem = function (item, collapsed) {
      if ($scope.searchCategory && $scope.searchCategory.length > 0) {
        if (item.name.text.toLowerCase().indexOf($scope.searchCategory.toLowerCase()) > -1) {
          return true;
        }
        // check children
        var found = false;
        angular.forEach(item.children, function(subItem) {
          if (subItem.name.text.toLowerCase().indexOf($scope.searchCategory.toLowerCase()) > -1) {
            found = true;
          }
        });
        return found;
      } else {
        if (collapsed) {
          return false;
        }
      }
      return true;
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $scope.sortBy = function(sortPropertyName) {
      $scope.sortReverse = ($scope.sortPropertyName === sortPropertyName) ? !$scope.sortReverse : false;
      $scope.sortPropertyName = sortPropertyName;
    };

    $scope.openItemEditor = function (item, parent, index) {
      if (item == undefined || !item.id) {
        $scope.item = {
          name: {text: '', lang_code: Language.selectedLanguage},
        };
        if (parent) {
          $scope.item.parent_id = parent.id;
          $scope.parent = parent;
        }
      } else {
        $scope.item = item;
        $scope.parent = parent;
      }

      $scope.index = index;

      $aside.open({
        templateUrl: 'views/item-category-aside.html',
        placement: 'right',
        size: 'md',
        scope: $scope,
        backdrop: 'static',
        controller: 'ItemCategoryModalCtrl',
      }).result.then(postClose, postClose);
    };

    $scope.removeItemCategory = function (itemCategory, parent) {

      if(!itemCategory.used){
        $confirm({
          title: $translate.instant('delete_item_category.title'),
          text: $translate.instant('delete_item_category.text', {text: itemCategory.name.text}),
          ok: $translate.instant('ok'),
          cancel: $translate.instant('cancel')
        }).then(function () {
          return ItemCategory.removeItemCategory(itemCategory);
        }).then(function (result) {
          var entities = parent ? parent.children : $scope.data.categories;
          var index = entities.indexOf(itemCategory);
          entities.splice(index, 1);
          // If we delete a subcategory
          if (parent && parent.children.length === 0) {
            parent.used = false;
          }
        }).catch(function (error) {
          if(error != 'cancel') {
            WSAlert.danger(error);
          }
        });
      }
    };
  });
