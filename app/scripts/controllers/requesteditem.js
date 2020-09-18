  'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:RequestedItemCtrl
 * @description
 * # RequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('RequestedItemCtrl', function ($q, $scope, $state, $stateParams, Events, WSAlert, APP_ROLES, Items,
    ItemCategory, Category, Status, API_IL, $aside, ItemTier, Reporting, UNITS) {

    $scope.UNITS = UNITS;
    $scope.searchAPI = API_IL + '/items/' + $state.params.eventId+ '/supplied_items/?limit=100&search='; //search url for autocomplete
    $scope.loading.items = true;
    $scope.filters = {};

    $scope.current_page = 1;
    $scope.items_per_page = 50;

    // used to manage concurrent search requests
    $scope.loadPromise = null;

    $scope.resetColumns = function () {
      $scope.columns = {
        sector: true,
        list: true,
        category: false,
        quantity: true,
        calculated_quantity: false,
        unit: false,
        description: true,
        supplier_potential: true,
        area: false,
        supplied: false,
        manufacturer: false,
        model: false,
        size: false,
        part_number: false,
        supplier: false,
        electricity: false,
        water_supply: false,
        compressed_air: false,
        price: false,
        tier: false,
        extra_details: false,
        files: false,
        status: true
      };
    };
    $scope.resetColumns();
    $scope.columnLength = 1;

    var updateColumnLength = function () {
      $scope.columnLength = 0;
      angular.forEach($scope.columns, function(value, key) {
        if (key) {
          $scope.columnLength += 1;
        }
      });
    };
    updateColumnLength();

    $scope.toggleColumn = function (column) {
      $scope.columns[column] = !$scope.columns[column];
      updateColumnLength();
    };

    $scope.selectAll = function() {
      angular.forEach($scope.items, function(v, k) {
        v.selected = $scope.allSelected;
        $scope.numberItemSelected = $scope.allSelected ? $scope.items.length : 0;
      });
    };

    $scope.selectedItems = function(){
      if ($scope.items == null) {
        return [];
      }
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
      var loadPromise = Items.getItemsByEvent(
        $state.params.eventId,
        $scope.items_per_page,
        $scope.current_page,
        $scope.filters
      )
      .then(function(res) {
        if (loadPromise !== $scope.loadPromise) {
          // another load request has been sent meanwhile
          // so result of this one is cancelled
          return;
        }
        $scope.items = res.requested_items;
        $scope.items_total_count = res.total;
        $scope.loading.items = false;
      })
      .catch(function (error) {
        WSAlert.danger(error);
        $scope.loading.items = false;
      });

      $scope.loadPromise = loadPromise;
      return $scope.loadPromise;
    }

    $scope.clear = function() {
      $scope.filters = {};
      $scope.resetColumns();
      $scope.changePage(1);
    };

    $scope.filterResults = function() {
      $scope.changePage(1);
    };

    $scope.changePage($scope.current_page);

    Events.getEvent($stateParams.eventId).then( function (event) {
      $scope.event = event;
    });

    $q.when(Events.getSkillsForEvent($state.params.eventId))
      .then(function(res){
        $scope.skills = res;

        // get unique sectors from skills
        var sectors = [];
        $scope
        .skills
        .map(function(skill){
          return skill.sector;
        })
        .forEach(function(sector){
          if (sector != undefined) {
            var newSector = sectors.filter(function(sectorToTest){
              return sectorToTest.id === sector.id;
            }).length === 0;
            if(newSector){
              sectors.push(sector);
            }
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
        return Category.getAll($state.params.eventId);
      })
      .then(function(res){
        $scope.categories = res;
        //Load statuses
        return Status.getAllStatuses($state.params.eventId);
      })
      .then(function(res){
        $scope.statuses = res;
        //Load tiers
        return ItemTier.getTiersForEvent($state.params.eventId);
      })
      .then(function(res){
        $scope.tiers = res;
        $scope.tiersIndexed = {};
        angular.forEach($scope.tiers, function (tier) {
          $scope.tiersIndexed[tier.id] = tier;
        });
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
