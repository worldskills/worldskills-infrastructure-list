  'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RequestedItemCtrl
 * @description
 * # RequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('RequestedItemCtrl', function ($q, $scope, $state, Events, WSAlert, APP_ROLES, Items, ITEM_STATUS, ItemCategory, Category, Status, API_IL) {

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.searchAPI = API_IL + '/items/' + $state.params.eventId+ '/supplied_items/?search='; //search url for autocomplete
    $scope.loading.items = true;
    $scope.filters = {};

    $scope.current_page = 1;
    $scope.items_per_page = 5;

    $scope.changePage = function(page)
    {
      $scope.loading.items = true;

      $scope.current_page = page;
      $scope.loadData();
    };

    $scope.changeFilters = function(){
      $scope.current_page = 1;
      $scope.loadData();
    };

    $scope.loadData = function(){
      $scope.loading.items = true;
      return Items.getItemsByEvent($state.params.eventId, $scope.items_per_page, $scope.current_page, $scope.filters)
      .then(function(res) {
        $scope.items = res.requested_items;
        $scope.items_total_count = res.total;
        $scope.loading.items = false;
      })
      .catch(function (error) {
        if(error.code == "2200-700"){
          $scope.items = {};
        } else {
          WSAlert.danger(error);
        }
        $scope.loading.items = false;
      });
    }

    $scope.clear = function() {
      $scope.filters = {};
      $scope.changePage(1);
    };

    $scope.filterResults = function() {
      $scope.changePage(1);
    };

    $scope.changePage($scope.current_page);

    $q.when($scope.appLoaded.promise)
      .then(function(){
        //Load skills and sectors
        return Events.getSkillsForEvent($state.params.eventId);
      })
      .then(function(res){
        $scope.skills = res;
        //Load item category
        return ItemCategory.getAllCategory($state.params.eventId);
      })
      .then(function(res){
        $scope.itemCategories = res.categories;
        //Load item subcategory
        return ItemCategory.getAllSubCategory($state.params.eventId);
      })
      .then(function (res) {
        $scope.subcategories = res.categories;
        //Load requested items
        return Items.getItemsByEvent($state.params.eventId, $scope.items_per_page, $scope.current_page, $scope.filters);
      })
      .then(function(res){
        $scope.items = res.requested_items;
        $scope.items_total_count = res.total;
        //Load categories
        return Category.getAll();
      })
      .then(function(res){
        $scope.categories = res;
        //Load statuses
        return Status.getAllStatuses();
      })
      .then(function(res){
        $scope.statuses = res;
        $scope.loading.items = false;
      })
      .catch(function (error) {
          WSAlert.danger(error);
          $scope.loading.items = false;
      });

      $scope.groupBySector = function(item){
          return item.sector.name.text;
      }
  });
