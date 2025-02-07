'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCatalogueCtrl
 * @description
 * # EventCatalogueCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCatalogueCtrl', function ($scope, $q, $aside, Items, Category, $state, $stateParams, WSAlert, API_IL,
    $timeout, uiGridConstants, $confirm, $filter,
    SuppliedItem, Events, hotkeys, $translate, ItemCategory, i18nService, SUPPLIED_ITEM_PRIORITIES,
    Status, Auth, auth, APP_ID, APP_ROLES,
    UNITS, UPLOADS_URL
  ) {

    var supplierValue = "";
    var supplied_item_priorities = [];
    $scope.UNITS = UNITS;
    $scope.UPLOADS_URL = UPLOADS_URL;
    $scope.fullscreen = false;
    $scope.item = {};
    $scope.items = [];
    $scope.loading.catalogue = true;
    $scope.allowEditing = false;
    $scope.showFilters = true;
    $scope.showGrid = false;
    $scope.categories = {};
    $scope.filters = {
      active: false,
      list: null,
      category: null
    };
    $scope.asideState = {
      open: false,
    };

    //deep copy of filters in order to show currently selected in UI
    $scope.selectedFilters = {};
    $scope.selectedLanguage = $translate.use();

    //i18Service is provided from ui grid plugin
    i18nService.setCurrentLang($translate.use());

    //prevent accidental navigation
    $scope.$on('$stateChangeStart', function( event ) {
      if(!confirm($translate.instant('confirm.are_you_sure_you_want_to_leave_this_page')))
        event.preventDefault();
    });

    $scope.toggleFilters = function(){
      $scope.showFilters = !$scope.showFilters;
    }

    $scope.toggleEditing = function(){
      $scope.allowEditing = !$scope.allowEditing;
    };

    $scope.canEdit = function(){ return $scope.allowEditing; };

    Events.getListsForEvent($stateParams.eventId).then(function (lists) {
      $scope.lists = lists;
    });

    Status.getAllStatuses($state.params.eventId).then(function (result) {
      $scope.statuses = result;
    });

    $scope.toggleFullScreen = function(){
      var element = $('#fullScreenDiv').get(0);
      var grid = $('.catalogueGrid').get(0);

      if(!$scope.fullscreen) {
        if($(window).height() < 500)
          $(grid).height(500);
        else
          $(grid).height($(window).height());

        $(grid).width($(window).width());
      }
      else{
        if($(window).height() < 500)
          $(grid).height(500);
        else
          $(grid).height($(window).height() - 220); //400= size topbar + bottom bar
        //$(grid).height(500); //50 = size of toolbar
        $(grid).width('100%');
      }

      $scope.fullscreen = !$scope.fullscreen;
    };

    $scope.supplierChanged = function(val){
      supplierValue = val;
    };

    angular.forEach(SUPPLIED_ITEM_PRIORITIES, function (element) {
      supplied_item_priorities.push({
        value: element,
        label: $translate.instant(element)
      });
    });

    $scope.gridOptions = {
      enableSorting: true,
      enableFiltering: true,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      enableCellEdit: true,
      enableCellEditOnFocus: false,
      enableColumnResizing: true,
      disableCancelFilterButton: false,
      columnDefs: [
        {field: 'id', width: '60', enableCellEdit: false, pinnedLeft: true},
        {field: 'description.text', name: $translate.instant("th_description"), width: '250', pinnedLeft: true, cellEditableCondition: $scope.canEdit},
        {field: 'manufacturer', name: $translate.instant("th_manufacturer"), width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'model', name: $translate.instant("th_model"), width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'size', name: $translate.instant("th_size"), width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'part_number', name: $translate.instant("th_part_num"), width: '160', cellEditableCondition: $scope.canEdit},
        {
          field: 'item_category',
          name: $translate.instant('th_item_category'),
          width: '250',
          cellTemplate: "<div class='ui-grid-cell-contents' style='white-space: nowrap'><span ng-repeat='breadcrumb in row.entity.item_category.breadcrumb'>{{breadcrumb}} / </span>{{row.entity.item_category.name.text}}</div>",
          cellEditableCondition: false,
          filter: {
            condition: function(searchTerm, cellValue) {
              if (cellValue != null) {
                return $filter('filter')([cellValue], {$: searchTerm}).length > 0;
              }
              return false;
            }
          }
        },
        {field: 'supplier.name', name: $translate.instant('th_supplier'), width: '100', cellEditableCondition: false},
        {field: 'supply_type', name: $translate.instant('th_supply_type'), width: '100'},
        {field: 'unit_cost', name: $translate.instant('th_unit_cost'), width: '100'}, //double
        {field: 'unit', name: $translate.instant('th_unit'), width: '100'},
        {field: 'calculated_quantity', name: $translate.instant('th_quantity_calculated'), width: '100'},
        {field: 'po_number', name: $translate.instant('th_po_number'), width: '100'},
        {field: 'priority', name: $translate.instant('th_priority'), width: '100',
          enableCellEdit: false,
          cellTemplate: "<div class='ui-grid-cell-contents' translate ng-show='row.entity.priority'>{{row.entity.priority}}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: supplied_item_priorities
          }
        },
        {field: 'delivery', name: $translate.instant('th_delivery'), width: '180', cellFilter: 'date:"yyyy-MM-dd HH:mm:ssZ"',
          filter: {
            condition: uiGridConstants.filter.STARTS_WITH,
          }
        }, //datetime
        {field: 'disposal_category', name: $translate.instant('th_disposal_category'), width: '100'},
        {field: 'location', name: $translate.instant('th_location'), width: '100'},
        {field: 'lead_time', name: $translate.instant('th_lead_time'), width: '100'},
        {field: 'electricity', name: $translate.instant('th_electricity'), width: '100',
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.electricity + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'electricity_volts', name: $translate.instant('th_electricity_volts'), width: '100'},//int
        {field: 'electricity_amps', name: $translate.instant('th_electricity_amps'), width: '100'},//int
        {field: 'electricity_phase', name: $translate.instant('th_electricity_phase'), width: '100'},
        {field: 'water_supply', name: $translate.instant('th_water_supply'), width: '100',
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.water_supply + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'water_drainage', name: $translate.instant('th_water_drainage'), width: '100',
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.water_drainage + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'compressed_air', name: $translate.instant('th_compressed_air'), width: '100',
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.compressed_air + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'ventilation_fume_extraction', name: $translate.instant('th_ventilation_fume_extraction'), width: '100', type: 'boolean',
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.ventilation_fume_extraction + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },//char 1
        {field: 'gas_requirements', name: $translate.instant('th_gas_requirements'), width: '100', type: 'boolean'
        },//char 1
        {field: 'anchor_fixing_base_requirements', name: $translate.instant('th_anchor_fixing_base_requirements'), width: '100'},
        {field: 'extra_details', name: $translate.instant('th_extra_details'), width: '100'},//mediumtext
        {field: 'modified', name: $translate.instant("th_modified"), width: '95', type: 'date', enableCellEdit: false},
        {field: 'user_generated', name: $translate.instant("th_user_generated"), width: '125', type: 'boolean',
          enableCellEdit: false,
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.user_generated + 'Label'}}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'linkedItems', name: $translate.instant("th_linked"), width: '95', type: 'boolean',
          enableCellEdit: false,
          cellTemplate: "<div class='ui-grid-cell-contents' translate>{{row.entity.linkedItems + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
      ],
      //exporter
      enableGridMenu: true,
      enableSelectAll: true,
      exporterExcelFilename: 'IL.xlsx',
      exporterMenuCsv: false,
      exporterMenuPdf: false,
    };

    Category.getAll($state.params.eventId).then(function (res) {
      $scope.categories = res
    });

    $scope.subCategories = [];
    $scope.flattenCategories = function (categories, path) {
      angular.forEach(categories, function (category) {
        category.path = path;
        $scope.subCategories.push(category);
        if (category.children) {
          $scope.flattenCategories(category.children, category.name.text + ' / ' + path);
        }
      });
    }
    ItemCategory.getAllCategory($state.params.eventId).then(function (res) {
      $scope.flattenCategories(res.categories, '');
    },
    function (error) {
      WSAlert.danger(error);
    });

    $scope.saveRow = function(rowEntity){

      var promise = $q.defer();
      $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);

      //set supplier from autocomplete

      //TODO check this
      // if ($scope.item.selectedSupplier != void 0 && $scope.item.selectedSupplier.originalObject.id != void 0)
      //   $scope.item.supplier = $scope.item.selectedSupplier.originalObject.name;
      // else if ($scope.item.selectedSupplier != void 0)
      //   $scope.item.supplier = $scope.item.selectedSupplier.originalObject;
      // else if (supplierValue !== "")
      //   $scope.item.supplier = supplierValue;
      //
      // delete $scope.item.selectedSupplier;
      // console.log($scope.item.supplier);

      $scope.loading.catalogue = true;
      //actually save row
      rowEntity.description.lang_code = $translate.use();
      SuppliedItem.saveItem(rowEntity).then(function(res){
          //copy back data from request's response
          angular.extend(rowEntity, res);
          $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
          $scope.loading.catalogue = false;
          promise.resolve();
      },
      function(error){
        WSAlert.danger(error);
        promise.reject();
        $scope.loading.catalogue = false;
      });

      $scope.gridApi.selection.clearSelectedRows();

      return promise.promise;
    };

    $scope.saveRows = function(rowEntities){

      var promise = $q.defer();
      var promises = [];

      // we need to save the first row first in order to create
      // the new supplier if needed
      // (else several request attempt to do that and fail)
      var firstRow = rowEntities[0];

      var firstRowPromise = SuppliedItem.saveItem(firstRow);
      promises.push(firstRowPromise);

      firstRowPromise.then(function(){

          //go through fields and update them
          angular.forEach(rowEntities, function(rowEntity, index){

            // the first row is already saved
            if (index == 0) {
              return;
            }

            $scope.loading.catalogue = true;

            //actually save row
            $scope.gridApi.rowEdit.setSavePromise(rowEntities[index], promise.promise);

            promises.push(SuppliedItem.saveItem(rowEntities[index]));
          });

          //go through promises
          $q.all(promises).then(function(res){
              for(var i = 0 ; i < rowEntities.length ; i++){
                //copy back data from request's response
                angular.extend(rowEntities[i], res[i]);
              }

              $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
              $scope.loading.catalogue = false;
              promise.resolve();
            },
            function(error){
              WSAlert.danger(error);
              promise.reject();
              $scope.loading.catalogue = false;
            });
        });


        $scope.gridApi.selection.clearSelectedRows();

      return promise.promise;
    };

    $scope.refreshRow = function(rowEntity){
      var promise = $q.defer();

      $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
      $scope.loading.catalogue = true;

      //actually refresh row
      SuppliedItem.getItem(rowEntity).then(function(res){
        //copy back data from request's response
        angular.extend(rowEntity, res);
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
        $scope.loading.catalogue = false;
        promise.resolve();
      },
      function(error){
        WSAlert.warning($translate.instant('wsalert.warning.error_refreshing_item', {error: error}));
        promise.reject();
        $scope.loading.catalogue = false;
      });

      return promise.promise;
    };

    $scope.getLinkedItems = function($event){
      $event.preventDefault();
      $event.stopPropagation();

      if($scope.fullscreen) return;

      var item = $scope.getOneSelectedItem();

      if(item == void 0 || item === false){
        alert($translate.instant('alert.you_need_to_select_at_least_one_item'));
        return;
      }

      $scope.loading.catalogue = true;

      //get linked items and show them
      SuppliedItem.getLinkedItems(item).then(function (res) {
        $scope.loading.catalogue = false;

        //display linked items
        $confirm({
            title: $translate.instant('linked_items.title'),
            newLinkedItem: $scope.createNewLinkedItem,
            suppliedItem: item,
            items: res.requested_items,
            editRequestedItem: $scope.editRequestedItem,
            unlinkRequestedItem: $scope.unlinkRequestedItem,
            event: $scope.event,
            ok: $translate.instant("linked_items.ok"),
          },
          {
            templateUrl: 'views/display-linked-items-confirm.html',
            size: 'lg'
          }).then(function(error){
          //update linked item in case any changes were made via editRequestedItem or unlinkRequestedItem
            $scope.refreshRow(item);
        });
        },
        function(error){
          WSAlert.danger(error);
          $scope.loading.catalogue = false;
        });
    };

    $scope.getSelectedItems = function(){
      var items = $scope.gridApi.selection.getSelectedRows() || [];
      if(items === false || items.length === 0){
          var focus = $scope.getCurrentFocus();
          if(!focus) return false;

          items.push(focus.row.entity);
      }

      return (items.length > 0) ? items : false;
    };

    //used in catalogue for loading new linked items
    $scope.addLinkedItemListSelected = function (item, model) {
      //clear out so that category selection clears out
      $scope.newLinkedItem.category = {};
      $scope.categoryId = 0;
    };

    $scope.removeItem = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      if($scope.fullscreen) return;

      var items = $scope.getSelectedItems();
      if(items === false) return;

      var linkedItems = false;
      var deleteQueue = [];

      //check if any of the items in array contain any linked items
      angular.forEach(items, function(val){
        if(val.linkedItems === true) linkedItems = true;
        else{
          //add to remove queue if no linked items
          deleteQueue.push(val);
        }
      });
      $confirm({
          title: $translate.instant('remove_item_s_from_catalogue.title'),
          items: items,
          linkedItems: linkedItems,
          ok: $translate.instant('remove_item_s_from_catalogue.ok')
      },
      {
        templateUrl: 'views/remove-item-confirm.html'
      }).then(function () {
        if(deleteQueue.length < 1) return;
        $scope.loading.catalogue = true;

        //create actual delete queue
        var queue = [];
        angular.forEach(deleteQueue, function(val){
          queue.push(SuppliedItem.removeItem(val));
        });

        $q.all(queue).then(function(){
          //remove items from grid
          angular.forEach(deleteQueue, function(val){
            var i = $scope.gridOptions.data.indexOf(val);
            $scope.gridOptions.data.splice(i, 1);
          });

          $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);

          WSAlert.success($translate.instant('wsalert.success.item_s_removed'));

          $scope.loading.catalogue = false;
        },
        function(error) {
          WSAlert.danger(error);
          $scope.loading.catalogue = false;
        });
      });
    };

    $scope.combineItems = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      if($scope.fullscreen) return;

      var items = $scope.getSelectedItems();
      if(items == void 0 || items === false){
        alert($translate.instant('alert.please_select_at_least_2_ITEMS'));
        return;
      }

      if(items.length < 2){
        alert($translate.instant('alert.please_select_at_least_2_ITEMS'));
        return;
      }

      var linkedItems = false;
      // var updateQueue = [];
      var updatedItems = [];
      $scope.masterItem = {};

      //check if any of the items in array contain any linked items
      angular.forEach(items, function(val){
        if(val.linkedItems === true) linkedItems = true;
        updatedItems.push(val);
      });

      $confirm({
          title: $translate.instant("jstext_combine_items.title"),
          items: items,
          linkedItems: linkedItems,
          masterItem: false,
          selectMaster: function(masterItem){
            $scope.masterItem = masterItem;
          },
          ok: $translate.instant("jstext_combine_items.ok")
        },
        {
          templateUrl: 'views/combine-items-confirm.html'
        }).then(function () {

        $scope.loading.catalogue = true;

        SuppliedItem.combineItems(items, $scope.masterItem).then(function(res){

            //remove everything except one marked as master item
            angular.forEach(updatedItems, function(val){
              if(val.id != $scope.masterItem.id) {
                var i = $scope.gridOptions.data.indexOf(val);
                $scope.gridOptions.data.splice(i, 1);
              }
            });
            WSAlert.success($translate.instant("wsalert.success.items_combined"));
            $scope.loading.catalogue = false;
            $scope.gridApi.selection.clearSelectedRows();
        },
        function(error){
          WSAlert.danger(error);
          $scope.loading.catalogue = false;
        });
      });
    };

    $scope.getCurrentFocus = function(){
      if(typeof $scope.gridApi === 'undefined') return false;

      var rowCol = $scope.gridApi.cellNav.getFocusedCell();
      if(rowCol !== null){
        return rowCol;
      }
    };

    //register api
    $scope.gridOptions.onRegisterApi = function(gridApi){
      $scope.gridApi = gridApi;
      $scope.gridApi.core.handleWindowResize();

      gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
    };

    $scope.catalogueLoaded = false;

    $scope.loadCatalogue = function() {
      $scope.loading.catalogue = true;

      Items.getCatalogue($stateParams.eventId, $scope.filters).then(function(data) {
        //init supplier api url
        $scope.searchSupplierAPI = API_IL + '/suppliers/' + $stateParams.eventId + '/search/?q=';

        $scope.gridOptions.data = data.supplied_items;

        $scope.catalogueLoaded = true;
        $scope.loading.catalogue = false;
        $scope.showFilters = false;
        $scope.showGrid = true;
        angular.copy($scope.filters, $scope.selectedFilters);

        $timeout(function(){
          var grid = $('.catalogueGrid').get(0);
          $(grid).height($(window).height() - 220); //400= size topbar + bottom bar
        }, 100);
      },
      function(error){
        WSAlert.danger(error);
        $scope.catalogueLoaded = false;
        $scope.loading.catalogue = false;
      });
    };

    $scope.loadFullCatalogue = function() {
      $scope.filters.active = false;
      $scope.loadCatalogue();
    };

    $scope.filtersActivate = function(){
      if($scope.filters.list == null) {
        WSAlert.warning($translate.instant("wsalert.warning.you_have_to_select_at_least_skill_first"));
        return;
      }

      $scope.filters.active = true;
      $scope.loadCatalogue();
    }

    initCatalogue();

    //edit item
    $scope.editItems = function($event){
      $event.preventDefault();
      $event.stopPropagation();

      //exit if in full screen
      if($scope.fullscreen) return;

      var items = $scope.getSelectedItems();

      if(items.length > 1){
        //edit multiple
        $scope.openItemEditorMultiple(items);
      }
      else if (items.length === 1){
        //scope gets passed to editSuppliedItemCtrl
        $scope.openItemEditor(items[0]);
      }
      else{
        alert($translate.instant("alert.you_need_to_select_at_least_one_item"));
      }
    };

    $scope.getOneSelectedItem = function(){
      var item = false;

      if($scope.gridApi.selection.getSelectedRows().length > 1){
        WSAlert.warning($translate.instant("wsalert.warning.please_select_only_one_row"));
        item = false;
      }
      else if ($scope.gridApi.selection.getSelectedRows().length == 1){
        item = $scope.gridApi.selection.getSelectedRows()[0];
      }
      else {
        var focus = $scope.getCurrentFocus();
        if(!focus) return;
        var item = focus.row.entity;
      }

      return item;
    };

    $scope.openItemEditor  = function(item){
      if(item == void 0 || !item.id) {
        $scope.item = {};
      }
      else {
        $scope.item = {};
        angular.copy(item, $scope.item);
        $scope.rowItem = item;
      }

      //fix date object
      $scope.item.delivery = ($scope.item.delivery == null) ? new Date("2017-08-01") : new Date($scope.item.delivery);

      $aside.open({
        templateUrl: 'views/editsupplieditemaside.html',
        placement: 'right',
        size: 'md',
        scope: $scope,
        backdrop: true,
        controller: 'editSuppliedItemCtrl',
      }).result.then(postClose, postClose);

    };

    $scope.openItemEditorMultiple  = function(items){
      if(items == void 0 || items.length < 2) {
        alert($translate.instant("alert.you_need_to_select_at_least_one_item"));
        return;
      }
      else {
        $scope.items = items;
        //use first item as a base for comparison
        angular.copy(items[0], $scope.item);
        $scope.rowItems = items;
      }

      //fix date objects
      angular.forEach($scope.items, function(val, key){
        $scope.items[key].delivery = ($scope.items[key].delivery == null) ? new Date("2017-08-01") : new Date($scope.items[key].delivery);
      });

      $aside.open({
        templateUrl: 'views/editsupplieditemasideMultiple.html',
        placement: 'right',
        size: 'md',
        scope: $scope,
        backdrop: true,
        controller: 'editSuppliedItemMultipleCtrl',
      }).result.then(postClose, postClose);

    };

    $scope.itemSelected = function(){
      var focus = $scope.getCurrentFocus();

      return (!focus) ? false : true;
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    function initCatalogue() {
      $scope.loading.catalogue = true;

      //set event id from state if not already set
      if(!$scope.event_id)
        $scope.event_id = $stateParams.eventId;

      Events.getEvent($scope.event_id).then( function (event) {
        $scope.event = event;
      });

      //copy from service, already loaded in main.js
      $scope.loading.catalogue = false;

      //debug only
      // $scope.filters = {
      //   active: true,
      //   skill: {
      //     id: 483
      //   }
      // };
      // $scope.loadCatalogue();
    };

    $scope.editRequestedItem = function(item, itemIndex) {

      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
        $scope.canEditItemStatus = hasUserRole;
      });

      //copy item
      $scope.item = angular.copy(item);
      $scope.itemIndex = itemIndex;

      $scope.editModal = $aside.open({
        templateUrl: 'views/editRequestedItemAside.html',
        placement: 'right',
        size: 'lg',
        scope: $scope,
        backdrop: true,
        controller: 'editRequestedItemAsideCtrl'
      });

      $scope.editModal.result.then(function(res){
        if(res && res.id === item.id){
          //copy returned item back to the view
          item.updated = true;
          angular.extend(item, res);
          $scope.item = null;
        }
        //res === null if close called because of `cancel`
      });
    };

    $scope.unlinkRequestedItem = function(item, linkedItemsRef, index){
      $confirm({
          title: $translate.instant("are_you_sure.title"),
          ok: $translate.instant("are_you_sure.ok"),
          item: item
        },
        {
          templateUrl: 'views/unlink-requested-item-confirm.html'
        }).then(function(){
          Items.removeItem(item, $scope.event_id, true).then(function(res){
            linkedItemsRef.splice(index, 1);
          },
          function(error){
            WSAlert.warning(error);
          });
      })
    };

    $scope.createNewLinkedItem = function(suppliedItem, linkedItemsRef){

      //copy item
      $scope.suppliedItem = angular.copy(suppliedItem);
      $scope.suppliedItem.force = true;

      //initialize description of the item for the form
      $scope.item = {
        description: suppliedItem.description
      };

      $scope.newLinkedItem = {};

      //preset filters if exists
      if($scope.filters && $scope.filters.active === true){
        //pre-set list
        $scope.newLinkedItem.list = $scope.filters.list;

        //pre-set category
        if($scope.filters.category)
          $scope.newLinkedItem.category = $scope.filters.category;
        else{
          $scope.addLinkedItemListSelected($scope.newLinkedItem.list, false);
        }

      }//if

      $scope.newModal = $aside.open({
        templateUrl: 'views/addRequestedItemAside.html',
        placement: 'right',
        size: 'lg',
        scope: $scope,
        backdrop: true,
        controller: 'addRequestedItemCtrl'
      });

      $scope.newModal.result.then(function(res){
        res.new = true;

        linkedItemsRef.push(res);
      });

    };

    //used when called from catalogue view:showLinkedItems:add
    // $scope.addLinkedItemCategorySelected = function(cat, model){
    //   $scope.categoryId = cat.id;
    // };

    //map hotkeys
    hotkeys.add({
      combo: 'ctrl+o',
      description: $translate.instant("hotkeys.edit_item_in_full_view"),
      callback: $scope.editItems
    });

    hotkeys.add({
      combo: 'ctrl+l',
      description: $translate.instant("hotkeys.display_linked_items"),
      callback: $scope.getLinkedItems
    });

    hotkeys.add({
      combo: 'ctrl+backspace',
      description: $translate.instant("hotkeys.remove_selected_item"),
      callback: $scope.removeItem
    });

    hotkeys.add({
      combo: 'ctrl+m',
      description: $translate.instant("hotkeys.combine_selected_items"),
      callback: $scope.combineItems
    });

    hotkeys.add({
      combo: 'ctrl+f',
      description: $translate.instant("hotkeys.fullscreen_toggle"),
      callback: $scope.toggleFullScreen
    });

    hotkeys.add({
      combo: 'ctrl+n',
      description: $translate.instant("hotkeys.add_new_row_in_full_view"),
      callback: $scope.openItemEditor
    });

    hotkeys.add({
      combo: 'ctrl+k',
      description: $translate.instant("hotkeys.toggle_inline_editing"),
      callback: $scope.toggleEditing
    });

    hotkeys.add({
      combo: 'ctrl+t',
      description: $translate.instant("hotkeys.toggle_filters_dialog"),
      callback: $scope.toggleFilters
    });

  });
