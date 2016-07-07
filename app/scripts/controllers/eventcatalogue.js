'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventCatalogueCtrl
 * @description
 * # EventCatalogueCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventCatalogueCtrl', function ($scope, $q, $aside, Items, WSAlert, API_IL, uiGridConstants, $confirm, ITEM_STATUS, ITEM_STATUS_TEXT, SuppliedItem, hotkeys) {

    $scope.statusValues = [
      {id: {id: ITEM_STATUS.RED, name: {text: ITEM_STATUS_TEXT.RED}}, value: ITEM_STATUS_TEXT.RED},
      {id: {id: ITEM_STATUS.YELLOW, name: {text: ITEM_STATUS_TEXT.YELLOW}}, value: ITEM_STATUS_TEXT.YELLOW},
      {id: {id: ITEM_STATUS.GREEN, name: {text: ITEM_STATUS_TEXT.GREEN}}, value: ITEM_STATUS_TEXT.GREEN}
    ];


    $scope.fullscreen = false;
    $scope.item = {};
    $scope.loading.catalogue = false;
    $scope.allowEditing = false;

    $scope.toggleEditing = function(){
      $scope.allowEditing = !$scope.allowEditing;
    };

    $scope.canEdit = function(){ return $scope.allowEditing; };

    $scope.toggleFullScreen = function(){
      var element = $('#fullScreenDiv').get(0);
      var grid = $('.catalogueGrid').get(0);

      if(!$scope.fullscreen) {
        $(grid).height($(window).height());
        $(grid).width($(window).width());
      }
      else{
        $(grid).height(640); //50 = size of toolbar
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
        {field: 'make', width: '160', cellEditableCondition: $scope.canEdit},
        {field: 'model', width: '160', cellEditableCondition: $scope.canEdit},
        //status field
        {field: 'status.name.text', name: "Status", width: '120',
          cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex){
            if(grid.getCellValue(row, col) === ITEM_STATUS_TEXT.RED){ return 'statusRed'; }
            else if(grid.getCellValue(row, col) === ITEM_STATUS_TEXT.YELLOW){ return 'statusYellow'; }
            else if(grid.getCellValue(row, col) === ITEM_STATUS_TEXT.GREEN){ return 'statusGreen'; }
          },
          editableCellTemplate: 'ui-grid/dropdownEditor',
          editModelField: 'status',
          editDropdownOptionsArray: $scope.statusValues,
          type: 'object',
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              {value: ITEM_STATUS_TEXT.RED, label: ITEM_STATUS_TEXT.RED},
              {value: ITEM_STATUS_TEXT.YELLOW, label: ITEM_STATUS_TEXT.YELLOW},
              {value: ITEM_STATUS_TEXT.GREEN, label: ITEM_STATUS_TEXT.GREEN}
            ]
          }, cellEditableCondition: $scope.canEdit
        },
        //user generated field
        {field: 'user_generated', width: '125', type: 'boolean', enableCellEdit: false,
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [
              { value: 'true', label: 'true'},
              { value: 'false', label: 'false'},
            ]
          }
        },
        {field: 'linkedItems', name: "Linked", width: '95', type: 'boolean', enableCellEdit: false}
      ]
    };

    $scope.saveRow = function(rowEntity){
      var promise = $q.defer();
      $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);

      $scope.loading.catalogue = true;
      //actually save row
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

      return promise.promise;
    };

    $scope.getLinkedItems = function($event){
      $event.preventDefault();
      $event.stopPropagation();

      if($scope.fullscreen) return;

      var focus = $scope.getCurrentFocus();
      if(!focus) return;
      var item = focus.row.entity;

      $scope.loading.catalogue = true;

      //get linked items and show them
      SuppliedItem.getLinkedItems(item).then(function (res) {
        $scope.loading.catalogue = false;

        //display linked items
        $confirm({
            title: "Linked items",
            items: res.requested_items,
            ok: "Close",
          },
          {
            templateUrl: 'views/display-linked-items-confirm.html',
            size: 'lg'
          });

        },
        function(error){
          WSAlert.danger(error);
          $scope.loading.catalogue = false;
        });
    };


    $scope.removeItem = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      if($scope.fullscreen) return;

      var focus = $scope.getCurrentFocus();
      if(!focus) return;
      var item = focus.row.entity;

      $confirm({
          title: "Remove item from catalogue?",
          item: item
      },
      {
        templateUrl: 'views/remove-item-confirm.html'
      }).then(function () {
        SuppliedItem.removeItem(item).then(function(res){
          //remove item from grid
          var i = $scope.gridOptions.data.indexOf(item);
          $scope.gridOptions.data.splice(i, 1);
          $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);

          //register datachange listener to highlight rows
          // $scope.gridApi.grid.registerDataChangeCallback(function(data)
          // {
          //   $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
          // }, [uiGridConstants.dataChange.ROW]);

          WSAlert.success("Item removed!");
        },
        function(error) {
          WSAlert.danger(error);
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

      gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
    };

    $scope.catalogueLoaded = false;

    $scope.loadCatalogue = function(){

      Items.getCatalogue($scope.selectedEvent.id).then(function(data){
        //init supplier api url
        $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.selectedEvent.id + '/search?q=';

        $scope.gridOptions.data = data.supplied_items;
        $scope.catalogueLoaded = true;
      },
      function(error){
        WSAlert.danger(error);
        $scope.catalogueLoaded = false;
      });
    };


    $q.when($scope.appLoaded.promise).then(function(res){
      $scope.loadCatalogue();
    },
    function(error){
      WSAlert.danger(error);
    });

    //edit item
    $scope.editItem = function($event){
      $event.preventDefault();
      $event.stopPropagation();

      if($scope.fullscreen) return;

      var focus = $scope.getCurrentFocus();
      if(!focus) return;
      var item = focus.row.entity;

      //scope gets passed to editSuppliedItemCtrl
      $scope.openItemEditor(item);
    };

    $scope.openItemEditor = function(item){
      if(item == void 0 || !item.id) {
        $scope.item = {
          status: $scope.statusValues[0].id //default to Requested / RED
        };
      }
      else {
        angular.copy(item, $scope.item);
        $scope.rowItem = item;
      }

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
      combo: 'ctrl+f',
      description: 'Fullscreen (toggle)',
      callback: $scope.toggleFullScreen
    });

    hotkeys.add({
      combo: 'ctrl+n',
      description: 'Add new row in full view',
      callback: $scope.openItemEditor
    });

    // hotkeys.add({
    //   combo: 'ctrl+d',
    //   description: 'Add new row at the end of the grid',
    //   callback: $scope.editItem
    // });

  });
