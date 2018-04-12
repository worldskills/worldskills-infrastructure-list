  'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RequestedItemCtrl
 * @description
 * # RequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('RequestedItemCtrl', function ($q, $scope, $state, Events, WSAlert, APP_ROLES, Items, ITEM_STATUS,
    ItemCategory, Category, Status, API_IL, $aside, Reporting, UNITS) {

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.UNITS = UNITS;
    $scope.searchAPI = API_IL + '/items/' + $state.params.eventId+ '/supplied_items/?limit=100&search='; //search url for autocomplete
    $scope.loading.items = true;
    $scope.filters = {};

    $scope.current_page = 1;
    $scope.items_per_page = 50;

    $scope.selectAll = function() {
      angular.forEach($scope.items, function(v, k) {
        v.selected = $scope.allSelected;
        $scope.numberItemSelected = $scope.allSelected ? $scope.items.length : 0;
      });
    };

    $scope.selectedItems = function(){
      return $scope.items.filter(function(item){ return item.selected; });
    }

    $scope.selectedItemsCount = function(){
      return $scope.selectedItems().length;
    }

    $scope.toggleItem = function(item) {
      item.selected = !item.selected;
      if($scope.selectedItemsCount() < 1){
        $scope.allSelected = false;
      }
      if($scope.selectedItemsCount() == $scope.items_per_page){
        $scope.allSelected = true;
      }
    };
    $scope.asideState = {
      open: true,
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $scope.openMultipleItemEditor = function(){
      $aside.open({
        templateUrl: 'views/requested-items-aside.html',
        placement: 'right',
        size: 'md',
        scope: $scope,
        backdrop: true,
        controller: 'RequestedItemModalCtrl',
      }).result.then(postClose, postClose);
    };
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

    $scope.downloadCsv = function() {
      $scope.loading.download = true;
      Reporting.exportRequestedForEvent($state.params.eventId, $scope.filters, false)
      .then(function(){
        $scope.loading.download = false;
      })
      .catch(function (error) {
        WSAlert.danger(error);
        $scope.loading.download = false;
      });
    };

    $scope.loadData = function(){
      $scope.loading.items = true;
      return Items.getItemsByEvent(
        $state.params.eventId,
        $scope.items_per_page,
        $scope.current_page,
        $scope.filters
      )
      .then(function(res) {
        $scope.items = res.requested_items;
        $scope.items_total_count = res.total;
        $scope.loading.items = false;
      })
      .catch(function (error) {
        WSAlert.danger(error);
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
      .then(function(res){
        $scope.sectors = res;
        //Load skills and sectors
        return Events.getSkillsForEvent($state.params.eventId);
      })
      .then(function(res){
        $scope.skills = res;

        // get unique sectors from skills
        var sectors = [];
        $scope
        .skills
        .map(function(skill){return skill.sector;})
        .forEach(function(sector){
          var newSector = sectors.filter(function(sectorToTest){
            return sectorToTest.id === sector.id;
          }).length === 0;
          if(newSector){
            sectors.push(sector);
          }
        })

        $scope.sectors = sectors;

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
        return Items.getItemsByEvent(
          $state.params.eventId,
          $scope.items_per_page,
          $scope.current_page,
          $scope.filters
        );
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
          return item.sector && item.sector.name.text;
      }
  });
