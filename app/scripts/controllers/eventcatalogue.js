'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCatalogueCtrl
 * @description
 * # EventCatalogueCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCatalogueCtrl', function ($scope, $q, $aside, Items, $state, WSAlert, API_IL,
    $timeout, uiGridConstants, $confirm, ITEM_STATUS_TEXT,
    SuppliedItem, Events, hotkeys, $translate, ItemCategory, i18nService, SUPPLIED_ITEM_PRIORITIES,
    UNITS
  ) {

    var supplierValue = "";
    var supplied_item_priorities = [];
    $scope.UNITS = UNITS;
    $scope.fullscreen = false;
    $scope.item = {};
    $scope.loading.catalogue = true;
    $scope.allowEditing = false;
    $scope.showFilters = true;
    $scope.showGrid = false;
    $scope.skills = false;
    $scope.categories = {};
    $scope.filters = {
      active: false,
      skill: null,
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
      if(!confirm($translate.instant('CONFIRM.ARE_YOU_SURE_YOU_WANT_TO_LEAVE_THIS_PAGE')))
        event.preventDefault();
    });

    $scope.toggleFilters = function(){
      $scope.showFilters = !$scope.showFilters;
    }

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
        {field: 'description.text', name: $translate.instant("TH_DESCRIPTION"), width: '250', pinnedLeft: true, cellEditableCondition: $scope.canEdit},
        {field: 'manufacturer', name: $translate.instant("TH_MANUFACTURER"), width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'model', name: $translate.instant("TH_MODEL"), width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'size', name: $translate.instant("TH_SIZE"), width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'part_number', name: $translate.instant("TH_PART_NUM"), width: '160', cellEditableCondition: $scope.canEdit},
        {
          field: 'item_category.name.text',
          name: $translate.instant('TH_ITEM_SUBCATEGORY'),
          width: '160',
          cellEditableCondition: false,
        },
        {
          field: 'item_category.parent.name.text',
          name: $translate.instant('TH_ITEM_CATEGORY'),
          width: '160',
          cellEditableCondition: false
        },
        {field: 'supplier', name: $translate.instant('TH_SUPPLIER'), width: '100'},
        {field: 'supply_type', name: $translate.instant('TH_SUPPLY_TYPE'), width: '100'},
        {field: 'unit_cost', name: $translate.instant('TH_UNIT_COST'), width: '100'}, //double
        {field: 'unit', name: $translate.instant('TH_UNIT'), width: '100'},
        {field: 'po_number', name: $translate.instant('TH_PO_NUMBER'), width: '100'},
        {field: 'priority', name: $translate.instant('TH_PRIORITY'), width: '100',
          enableCellEdit: false,
          cellTemplate: "<div translate ng-show='row.entity.priority'>{{row.entity.priority}}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: supplied_item_priorities
          }
        },
        {field: 'delivery', name: $translate.instant('TH_DELIVERY'), width: '180', cellFilter: 'date:"yyyy-MM-dd HH:mm:ssZ"',
          filter: {
            condition: uiGridConstants.filter.STARTS_WITH,
          }
        }, //datetime
        {field: 'disposal_category', name: $translate.instant('TH_DISPOSAL_CATEGORY'), width: '100'},
        {field: 'location', name: $translate.instant('TH_LOCATION'), width: '100'},
        {field: 'lead_time', name: $translate.instant('TH_LEAD_TIME'), width: '100'},
        {field: 'electricity_volts', name: $translate.instant('TH_ELECTRICITY_VOLTS'), width: '100'},//int
        {field: 'electricity_amps', name: $translate.instant('TH_ELECTRICITY_AMPS'), width: '100'},//int
        {field: 'electricity_phase', name: $translate.instant('TH_ELECTRICITY_PHASE'), width: '100'},
        {field: 'water_supply', name: $translate.instant('TH_WATER_SUPPLY'), width: '100', cellTemplate: "<div translate>{{row.entity.water_supply}}</div>"},
        {field: 'water_drainage', name: $translate.instant('TH_WATER_DRAINAGE'), width: '100', cellTemplate: "<div translate>{{row.entity.water_drainage}}</div>"},
        {field: 'compressed_air', name: $translate.instant('TH_COMPRESSED_AIR'), width: '100',
          cellTemplate: "<div translate>{{row.entity.compressed_air + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'ventilation_fume_extraction', name: $translate.instant('TH_VENTILATION_FUME_EXTRACTION'), width: '100', type: 'boolean',
          cellTemplate: "<div translate>{{row.entity.ventilation_fume_extraction + 'Label' }}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },//char 1
        {field: 'gas_requirements', name: $translate.instant('TH_GAS_REQUIREMENTS'), width: '100', type: 'boolean'
        },//char 1
        {field: 'anchor_fixing_base_requirements', name: $translate.instant('TH_ANCHOR_FIXING_BASE_REQUIREMENTS'), width: '100'},
        {field: 'extra_details', name: $translate.instant('TH_EXTRA_DETAILS'), width: '100'},//mediumtext
        {field: 'modified', name: $translate.instant("TH_MODIFIED"), width: '95', type: 'date', enableCellEdit: false},
        {field: 'user_generated', name: $translate.instant("TH_USER_GENERATED"), width: '125', type: 'boolean',
          enableCellEdit: false,
          cellTemplate: "<div translate>{{row.entity.user_generated + 'Label'}}</div>",
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: $translate.instant('trueLabel')},
              { value: 'false', label: $translate.instant('falseLabel')},
            ]
          }
        },
        {field: 'linkedItems', name: $translate.instant("TH_LINKED"), width: '95', type: 'boolean',
          enableCellEdit: false,
          cellTemplate: "<div translate>{{row.entity.linkedItems + 'Label' }}</div>",
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

    ItemCategory.getAllSubCategory($state.params.eventId)
      .then(function(res){
        $scope.subCategories = res.categories;
      }).catch(function(error){
        WSAlert.danger(error);
      });

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
      rowEntity.description.lang_code = $translate.use();
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
        WSAlert.warning($translate.instant('WSALERT.WARNING.ERROR_REFRESHING_ITEM', {error: error}));
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
        alert($translate.instant('ALERT.YOU_NEED_TO_SELECT_AT_LEAST_ONE_ITEM'));
        return;
      }

      $scope.loading.catalogue = true;

      //get linked items and show them
      SuppliedItem.getLinkedItems(item).then(function (res) {
        $scope.loading.catalogue = false;

        //display linked items
        $confirm({
            title: $translate.instant('LINKED_ITEMS.TITLE'),
            newLinkedItem: $scope.createNewLinkedItem,
            suppliedItem: item,
            items: res.requested_items,
            editRequestedItem: $scope.editRequestedItem,
            unlinkRequestedItem: $scope.unlinkRequestedItem,
            ok: $translate.instant("LINKED_ITEMS.OK"),
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
              text: $translate.instant('TEXT.ALL_CATEGORIES')
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
          title: $translate.instant('REMOVE_ITEM_S_FROM_CATALOGUE.TITLE'),
          items: items,
          linkedItems: linkedItems,
          ok: $translate.instant('REMOVE_ITEM_S_FROM_CATALOGUE.OK')
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

          WSAlert.success($translate.instant('WSALERT.SUCCESS.ITEM_S_REMOVED'));

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
        alert($translate.instant('ALERT.PLEASE_SELECT_AT_LEAST_2_ITEMS'));
        return;
      }

      if(items.length < 2){
        alert($translate.instant('ALERT.PLEASE_SELECT_AT_LEAST_2_ITEMS'));
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
          title: $translate.instant("JSTEXT_COMBINE_ITEMS.TITLE"),
          items: items,
          linkedItems: linkedItems,
          masterItem: false,
          selectMaster: function(masterItem){
            $scope.masterItem = masterItem;
          },
          ok: $translate.instant("JSTEXT_COMBINE_ITEMS.OK")
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
            WSAlert.success($translate.instant("WSALERT.SUCCESS.ITEMS_COMBINED"));
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

    $scope.loadCatalogue = function() {
      $scope.loading.catalogue = true;

      Items.getCatalogue($scope.selectedEvent.id, $scope.filters).then(function(data) {
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

    $scope.loadFullCatalogue = function() {
      $scope.filters.active = false;
      $scope.loadCatalogue();
    };

    $scope.filtersActivate = function(){
      if($scope.filters.skill == null) {
        WSAlert.warning($translate.instant("WSALERT.WARNING.YOU_HAVE_TO_SELECT_AT_LEAST_SKILL_FIRST"));
        return;
      }

      $scope.filters.active = true;
      $scope.loadCatalogue();
    }

    $q.when($scope.appLoaded.promise).then(function() { //still needed to use existing skill list
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
        alert($translate.instant("ALERT.YOU_NEED_TO_SELECT_AT_LEAST_ONE_ITEM"));
        return;
      }

      //scope gets passed to editSuppliedItemCtrl
      $scope.openItemEditor(item);
    };

    $scope.getOneSelectedItem = function(){
      var item = false;

      if($scope.gridApi.selection.getSelectedRows().length > 1){
        WSAlert.warning($translate.instant("WSALERT.WARNING.PLEASE_SELECT_ONLY_ONE_ROW"));
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

    function postClose() {
      $scope.asideState.open = false;
    }

    function initCatalogue() {
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

    $scope.editRequestedItem = function(item) {

      //copy item
      $scope.item = angular.copy(item);

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
          title: $translate.instant("ARE_YOU_SURE.TITLE"),
          ok: $translate.instant("ARE_YOU_SURE.OK"),
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
      description: $translate.instant("HOTKEYS.EDIT_ITEM_IN_FULL_VIEW"),
      callback: $scope.editItem
    });

    hotkeys.add({
      combo: 'ctrl+l',
      description: $translate.instant("HOTKEYS.DISPLAY_LINKED_ITEMS"),
      callback: $scope.getLinkedItems
    });

    hotkeys.add({
      combo: 'ctrl+backspace',
      description: $translate.instant("HOTKEYS.REMOVE_SELECTED_ITEM"),
      callback: $scope.removeItem
    });

    hotkeys.add({
      combo: 'ctrl+m',
      description: $translate.instant("HOTKEYS.COMBINE_SELECTED_ITEMS"),
      callback: $scope.combineItems
    });

    hotkeys.add({
      combo: 'ctrl+f',
      description: $translate.instant("HOTKEYS.FULLSCREEN_TOGGLE"),
      callback: $scope.toggleFullScreen
    });

    hotkeys.add({
      combo: 'ctrl+n',
      description: $translate.instant("HOTKEYS.ADD_NEW_ROW_IN_FULL_VIEW"),
      callback: $scope.openItemEditor
    });

    hotkeys.add({
      combo: 'ctrl+k',
      description: $translate.instant("HOTKEYS.TOGGLE_INLINE_EDITING"),
      callback: $scope.toggleEditing
    });

    hotkeys.add({
      combo: 'ctrl+t',
      description: $translate.instant("HOTKEYS.TOGGLE_FILTERS_DIALOG"),
      callback: $scope.toggleFilters
    });

  });
