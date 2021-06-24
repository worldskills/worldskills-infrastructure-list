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
    $scope.loading.subCategories = true;

    Events.getEvent($stateParams.eventId).then( function (event) {
      $scope.event = event;
    });

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

    $scope.asideState = {
      open: true,
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $scope.sortBy = function(sortPropertyName) {
      $scope.sortReverse = ($scope.sortPropertyName === sortPropertyName) ? !$scope.sortReverse : false;
      $scope.sortPropertyName = sortPropertyName;
    };

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
      var entityCode = isCategory ? 'category' : 'sub_category';

      if(!itemCategory.used){
        $confirm({
          title: $translate.instant('delete_item_'+entityCode+'.title'),
          text: $translate.instant('delete_item_'+entityCode+'.text', {text: itemCategory.name.text}),
          ok: $translate.instant('ok'),
          cancel: $translate.instant('cancel')
        }).then(function () {
          return ItemCategory.removeItemCategory(itemCategory);
        }).then(function (result) {
          var entities = isCategory ? $scope.data.categories : $scope.data.subCategories;
          var index = entities.indexOf(itemCategory);
          entities.splice(index, 1);
          // If we delete a subcategory
          if(!isCategory){
            // Get the parent
            var parent = itemCategory.parent;
            var used = false;
            // Check if the parent is still used by another subcategory
            for(var i=0;i<entities.length;i++) {
              if(entities[i].parent.id == parent.id){
                used = true;
                break;
              }
            }
            // Reset used state to the parent if category is not used by any subcategory
            if(!used){
              for(var i=0;i<$scope.data.categories.length;i++) {
                if(parent.id === $scope.data.categories[i].id) {
                  $scope.data.categories[i].used = used;
                }
              }
            }
          }
        }).catch(function (error) {
          if(error != 'cancel') {
            WSAlert.danger(error);
          }
        });
      }
    };
  });
