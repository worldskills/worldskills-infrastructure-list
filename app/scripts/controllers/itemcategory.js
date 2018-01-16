'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ItemCategoryCtrl
 * @description
 * # ItemCategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ItemCategoryCtrl', function ($q, $scope, $state, $confirm, $translate, ItemCategory, WSAlert, APP_ROLES) {

    $scope.event = false;
    $scope.data = {};
    $scope.APP_ROLES = APP_ROLES;
    $scope.loadingEvent = $q.defer();

    $q.when($scope.appLoaded.promise).then(function(){
      //load item sub categories
      ItemCategory.getAllSubCategory($state.params.eventId).then(function(res){
        $scope.data.subCategories = res.categories;
        $scope.loadingEvent.resolve();
      },
      function(error){
        WSAlert.danger(error);
        $scope.loadingEvent.reject();
      });
      //load item categories
      ItemCategory.getAllCategory($state.params.eventId).then(function(res){
        $scope.data.categories = res.categories;
        $scope.loadingEvent.resolve();
      },
      function(error){
        WSAlert.danger(error);
        $scope.loadingEvent.reject();
      });
    });

    $scope.removeItemCategory = function (itemCategory, isCategory) {
      var title;
      var text;
      if(isCategory){
        title = $translate.instant('DELETE_ITEM_CATEGORY.TITLE');
        text = $translate.instant('DELETE_ITEM_CATEGORY.TEXT', {text: itemCategory.name.text});
      } else {
        title = $translate.instant('DELETE_ITEM_SUB_CATEGORY.TITLE');
        text = $translate.instant('DELETE_ITEM_SUB_CATEGORY.TEXT', {text: itemCategory.name.text});
      }
      $confirm({
        title: title,
        text: text,
      }).then(function () {
        return ItemCategory.removeItemCategory(itemCategory);
      }).then(function (result) {
        var data = isCategory ? $scope.data.categories : $scope.data.subCategories;
        var index = data.indexOf(itemCategory);
        data.splice(index, 1);
      }).catch(function (error) {
        WSAlert.danger(error);
      });
    };
  });
