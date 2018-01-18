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
    $scope.APP_ROLES = APP_ROLES;
    $scope.loadingEvent = $q.defer();

    $scope.asideState = {
      open: true,
    };

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    if(!$scope.isCategory){
      $scope.categories = $scope.$parent.data.categories;
    }

    $scope.saveItemCategory = function(index){
      $scope.loading.aside = true;

      if($scope.item.id == null){
        ItemCategory.createItem($scope.item, $state.params.eventId)
          .then(function(res){
            if(res.parent == null){
              $scope.$parent.data.categories.push(res);
            } else {
              $scope.$parent.data.subCategories.push(res);
            }
            $scope.loading.aside = false;
            $uibModalInstance.dismiss();
          })
          .catch(function(error){
            WSAlert.danger(error);
            $scope.loading.aside = false;
          });
      } else {
        ItemCategory.saveItem($scope.item, $state.params.eventId)
          .then(function(res){
            if(res.parent == null){
              $scope.$parent.data.categories[index] = res;
              var linkedSubCategories = $filter('filter')($scope.$parent.data.subCategories, function (item) {
                return item.parent.id === res.id;
              });
              for(var i=0;i<linkedSubCategories.length;i++) {
                linkedSubCategories[i].parent = res;
              }
            } else {
              $scope.$parent.data.subCategories[index] = res;
            }
            $scope.loading.aside = false;
            $uibModalInstance.dismiss();
          })
          .catch(function(error){
            WSAlert.danger(error);
            $scope.loading.aside = false;
          });
      }

    };
  });