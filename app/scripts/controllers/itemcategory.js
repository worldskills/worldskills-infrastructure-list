'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ItemCategoryCtrl
 * @description
 * # ItemCategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('ItemCategoryCtrl', function ($q, $scope, $state, ItemCategory, WSAlert, APP_ROLES) {

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

  });
