'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCatalogueCtrl
 * @description
 * # EventCatalogueCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCatalogueCtrl', function ($scope, $q, $aside, Items, $state, WSAlert, API_IL, $timeout, uiGridConstants, $confirm, ITEM_STATUS, ITEM_STATUS_TEXT, SuppliedItem, Events, hotkeys) {

    $scope.statusValues = [
      {id: {id: ITEM_STATUS.RED, name: {text: ITEM_STATUS_TEXT.RED}}, value: ITEM_STATUS_TEXT.RED},
      {id: {id: ITEM_STATUS.YELLOW, name: {text: ITEM_STATUS_TEXT.YELLOW}}, value: ITEM_STATUS_TEXT.YELLOW},
      {id: {id: ITEM_STATUS.GREEN, name: {text: ITEM_STATUS_TEXT.GREEN}}, value: ITEM_STATUS_TEXT.GREEN},
      {id: {id: ITEM_STATUS.BLACK, name: {text: ITEM_STATUS_TEXT.BLACK}}, value: ITEM_STATUS_TEXT.BLACK},
    ];

    $scope.fullscreen = false;
    $scope.item = {};
    $scope.loading.catalogue = true;
    $scope.allowEditing = false;
    $scope.showFilters = true;
    $scope.showGrid = false;
    $scope.skills = false;
    var supplierValue = "";

    $scope.categories = {};
    $scope.filters = {
      active: false,
      skill: null,
      category: null
    };

    //prevent accidental navigation
    $scope.$on('$stateChangeStart', function( event ) {
      if(!confirm("Are you sure you want to leave this page?"))
        event.preventDefault();
    });

    $scope.toggleFilters = function(){
      $scope.showFilters = !$scope.showFilters;
    }

    //deep copy of filters in order to show currently selected in UI
    $scope.selectedFilters = {};

    $scope.toggleEditing = function(){
      $scope.allowEditing = !$scope.allowEditing;
    };

    $scope.canEdit = function(){ return $scope.allowEditing; };

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
        {field: 'description.text', name: "Description", width: '250', pinnedLeft: true, cellEditableCondition: $scope.canEdit},
        {field: 'manufacturer', width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'model', width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'size', width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'part_number', width: '160', cellEditableCondition: $scope.canEdit},        
        {field: 'supplier', name: 'supplier', width: '100'},
        {field: 'supply_type', name: 'supply_type', width: '100'},
        {field: 'unit_cost', name: 'unit_cost', width: '100'}, //double
        {field: 'unit', name: 'unit', width: '100'},
        {field: 'po_number', name: 'PO Number', width: '100'},
        {field: 'delivery', name: 'delivery', width: '180', cellFilter: 'date:"yyyy-MM-dd HH:mm:ssZ"', filter: {
          condition: uiGridConstants.filter.STARTS_WITH,
        }}, //datetime
        {field: 'category', name: 'category', width: '100'},
        {field: 'disposal_category', name: 'disposal_category', width: '100'},
        {field: 'location', name: 'location', width: '100'},
        {field: 'hs_code', name: 'hs_code', width: '100'},
        {field: 'lead_time', name: 'lead_time', width: '100'},
        {field: 'electricity_volts', name: 'electricity_volts', width: '100'},//int
        {field: 'electricity_amps', name: 'electricity_amps', width: '100'},//int
        {field: 'electricity_phase', name: 'electricity_phase', width: '100'},
        {field: 'water_supply', name: 'water_supply', width: '100'},
        {field: 'water_drainage', name: 'water_drainage', width: '100'},
        {field: 'compressed_air', name: 'compressed_air', width: '100'},
        {field: 'ventilation_fume_extraction', name: 'ventilation_fume_extraction', width: '100', type: 'boolean'},//char 1
        {field: 'gas_requirements', name: 'gas_requirements', width: '100', type: 'boolean'},//char 1
        {field: 'anchor_fixing_base_requirements', name: 'anchor_fixing_base_requirements', width: '100'},
        {field: 'extra_details', name: 'extra_details', width: '100'},//mediumtext
        {field: 'modified', name: "Modified", width: '95', type: 'date', enableCellEdit: false},
        {field: 'user_generated', width: '125', type: 'boolean', enableCellEdit: false,
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: 'true'},
              { value: 'false', label: 'false'},
            ]
          }
        },
        {field: 'linkedItems', name: "Linked", width: '95', type: 'boolean', enableCellEdit: false},
      ],
      //exporter
      enableGridMenu: true,
      enableSelectAll: true,
      exporterCsvFilename: 'myFile.csv',
      exporterPdfDefaultStyle: {fontSize: 8},
      exporterPdfTableStyle: {margin: [10, 10, 10, 10]},
      exporterPdfTableHeaderStyle: {fontSize: 9, bold: true, italics: true, color: 'red'},
      exporterPdfHeader: { text: "IL Catalogue Export", style: 'headerStyle' },
      exporterPdfFooter: function ( currentPage, pageCount ) {
        return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
      },
      exporterPdfCustomFormatter: function ( docDefinition ) {
        docDefinition.styles.headerStyle = { fontSize: 18, bold: true };
        docDefinition.styles.footerStyle = { fontSize: 8, bold: true };
        return docDefinition;
      },
      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'A4',
      exporterPdfMaxGridWidth: 640,
      exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
    };

    $scope.saveRow = function(rowEntity, updateRequested){

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
      SuppliedItem.saveItem(rowEntity, updateRequested).then(function(res){
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
        WSAlert.warning("Error refreshing item, consider refreshing the browser: " + error);
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
        alert("You need to select at least one item");
        return;
      }

      $scope.loading.catalogue = true;

      //get linked items and show them
      SuppliedItem.getLinkedItems(item).then(function (res) {
        $scope.loading.catalogue = false;

        //display linked items
        $confirm({
            title: "Linked items",
            newLinkedItem: $scope.createNewLinkedItem,
            suppliedItem: item,
            items: res.requested_items,
            editRequestedItem: $scope.editRequestedItem,
            unlinkRequestedItem: $scope.unlinkRequestedItem,
            ok: "Close",
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

    $scope.filterSkillSelected = function (item, model) {
      //clear category, as it's different set for each skill
      $scope.filters.category = null;

      Items.getCategories(item.id).then(function (res) {

        res.unshift({
          id: 'all',
          category: {
            name: {
              text: "All categories"
            }
          }
        });

        $scope.categories = res
      },
      function(error){
        WSAlert.danger(error);
      });
    };


    //used in catalogue for loading new linked items
    $scope.addLinkedItemSkillSelected = function (item, model) {
      //clear out so that category selection clears out
      $scope.newLinkedItemCategories = {};
      $scope.newLinkedItem.category = {};
      $scope.categoryId = 0;

      Items.getCategories(item.id).then(function (res) {
          $scope.newLinkedItemCategories = res
        },
        function(error){
          WSAlert.danger(error);
        });
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
          title: "Remove item(s) from catalogue?",
          items: items,
          linkedItems: linkedItems,
          ok: 'Delete'
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
          WSAlert.success("Item(s) removed!");

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
        alert("Please select at least 2 items");
        return;
      }

      if(items.length < 2){
        alert("Please select at least 2 items");
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
          title: "Combine items?",
          items: items,
          linkedItems: linkedItems,
          masterItem: false,
          selectMaster: function(masterItem){
            $scope.masterItem = masterItem;
          },
          ok: 'Combine'
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

            WSAlert.success("Items combined!");
            $scope.loading.catalogue = false;
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

    $scope.loadCatalogue = function(){
      $scope.loading.catalogue = true;

      Items.getCatalogue($scope.selectedEvent.id, $scope.filters).then(function(data){
        //init supplier api url
        $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.selectedEvent.id + '/search/?q=';

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

    $scope.loadFullCatalogue = function(){
      $scope.filters.active = false;
      $scope.loadCatalogue();
    };

    $scope.filtersActivate = function(){
      if($scope.filters.skill == null) {
        WSAlert.warning("You have to select at least skill first");
        return;
      }

      $scope.filters.active = true;
      $scope.loadCatalogue();
    }


    $q.when($scope.appLoaded.promise).then(function(){ //still needed to use existing skill list
        initCatalogue();
    });

    //edit item
    $scope.editItem = function($event){
      $event.preventDefault();
      $event.stopPropagation();

      //exit if in full screen
      if($scope.fullscreen) return;

      //selection more than one rows
      var item = $scope.getOneSelectedItem();

      if(item == void 0 || item === false){
        alert("You need to select at least one item");
        return;
      }

      //scope gets passed to editSuppliedItemCtrl
      $scope.openItemEditor(item);
    };

    $scope.getOneSelectedItem = function(){
      var item = false;

      if($scope.gridApi.selection.getSelectedRows().length > 1){
        WSAlert.warning("Please select only one row.");
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

      //TODO remove hardcoded date
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

    $scope.itemSelected = function(){
      var focus = $scope.getCurrentFocus();

      return (!focus) ? false : true;
    };

    $scope.asideState = {
      open: true,
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    function initCatalogue(){
      $scope.loading.catalogue = true;

      //set event id from state if not already set
      if(!$scope.event_id)
        $scope.event_id = $state.params.eventId;

      //copy from service, already loaded in main.js
      $scope.skills = Events.skills;
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

    $scope.asideState = {
      open: false,
    };

    $scope.editRequestedItem = function(item) {

      //copy item
      $scope.item = angular.copy(item);

      $scope.editModal = $aside.open({
        templateUrl: 'views/editRequestedItemAside.html',
        placement: 'right',
        size: 'md',
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
          title: "Are you sure?",
          ok: 'Remove item',
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
      $scope.suppliedItem = {
        originalObject: angular.copy(suppliedItem),
        force: true
      };

      //set parent to zero = none
      //needed in order to re-use addrequestedItem.js as a controller
      $scope.addParent = 0;

      //initialize description of the item for the form
      $scope.item = {
        description: suppliedItem.description
      };

      $scope.newLinkedItem = {};

      //preset filters if exists
      if($scope.filters && $scope.filters.active === true){
        //pre-set skill
        $scope.newLinkedItem.skill = $scope.filters.skill;

        //pre-set category
        if($scope.filters.category && $scope.filters.category.id != 'all')
          $scope.newLinkedItem.category = $scope.filters.category;
        else{
          $scope.addLinkedItemSkillSelected($scope.newLinkedItem.skill, false);
        }

      }//if

      $scope.newModal = $aside.open({
        templateUrl: 'views/addRequestedItemAside.html',
        placement: 'right',
        size: 'md',
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
      description: 'Edit item in full view',
      callback: $scope.editItem
    });

    hotkeys.add({
      combo: 'ctrl+l',
      description: 'Display linked items',
      callback: $scope.getLinkedItems
    });

    hotkeys.add({
      combo: 'ctrl+backspace',
      description: 'Remove selected item',
      callback: $scope.removeItem
    });

    hotkeys.add({
      combo: 'ctrl+m',
      description: 'Combine selected items',
      callback: $scope.combineItems
    });

    hotkeys.add({
      combo: 'ctrl+f',
      description: 'Fullscreen (toggle)',
      callback: $scope.toggleFullScreen
    });

    hotkeys.add({
      combo: 'ctrl+n',
      description: 'Add new row in full view',
      callback: $scope.openItemEditor
    });

    hotkeys.add({
      combo: 'ctrl+k',
      description: 'Toggle inline editing',
      callback: $scope.toggleEditing
    });

    hotkeys.add({
      combo: 'ctrl+t',
      description: 'Toggle filters dialog',
      callback: $scope.toggleFilters
    });

    $scope.supplierChanged = function(val){
      supplierValue = val;
    };

  });

