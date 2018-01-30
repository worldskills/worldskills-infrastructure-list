'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillcategoryCtrl
 * @description
 * # SkillcategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillCategoryCtrl', function ($scope, $state, $q, $aside, $timeout, MULTIPLIERS, Items, $confirm, WSAlert, ITEM_STATUS, API_IL, ITEM_STATUS_TEXT, Auth, APP_ROLES) {

    $scope.categoryId = $state.params.categoryId;
    $scope.selectedCategory = $scope.categories[$scope.categoryId];
    $scope.loading = {
      initial: true,
      more: false,
    };

    $scope.orderProperty = null;//"item_order";
    $scope.reverse = false;
    $scope.allowReordering = true;


    $scope.deleteMode = false;

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.multipliers = MULTIPLIERS;
    $scope.tmp_item = {};
    $scope.items = {};
    $scope.activeItem = false;
    $scope.suppliedItem = {};
    $scope.searchAPI = false;
    $scope.searchSupplierAPI = false;
    $scope.searchSetAPI = API_IL + '/sets/event/' + $state.params.eventId + "/?search="; //search url for autocomplete
    $scope.limit = 25;
    $scope.offset = 0;
    $scope.canceler = false;
    $scope.total = 0;
    $scope.supplierValue = false;
    $scope.standardSetSelector = false;

     //Defining status values for status dropdown in edition form
     $scope.statusValues = [
      {id: {id: ITEM_STATUS.RED, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.RED'}}, value: ITEM_STATUS_TEXT.RED},
      {id: {id: ITEM_STATUS.YELLOW, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.YELLOW'}}, value: ITEM_STATUS_TEXT.YELLOW},
      {id: {id: ITEM_STATUS.GREEN, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.GREEN'}}, value: ITEM_STATUS_TEXT.GREEN},
      {id: {id: ITEM_STATUS.BLACK, name: {text: 'CONSTANT.ITEM_STATUS_TEXT.BLACK'}}, value: ITEM_STATUS_TEXT.BLACK},
    ];

    $scope.moveItem = function (itemId, parentId, position) {
      //console.log("item %d, parent %d, position %d", itemId, parentId, position);
      Items.moveItem($scope.event_id, $scope.skill_id, itemId, parentId, position).then(function (result) {
        //console.log("Item moved!");
      },

        function (error) {
          $scope.initCategory();
          $confirm({
            title: 'Error',
            text: 'We were unable to move the item, we are now reloading the items, please try again.',
            ok: "Ok, I'll try again",
          },
            {
              template: '<div class="modal-header"><h3 class="modal-title">{{data.title}}</h3></div>' +
                 '<div class="modal-body">{{data.text}}</div>' +
                 '<div class="modal-footer">' +
                 '<button class="btn btn-primary" ng-click="ok()">{{data.ok}}</button>' +
                 '</div>',
            });
        });
    };

    $scope.treeOptions = {
      accept: function (sourceNodeScope, destNodesScope, destIndex) {
        //manually check max-depth the default does not work with accept
        if($scope.allowReordering === false) return false;
        if (destNodesScope.depth() > 0 && sourceNodeScope.childNodesCount() > 0) return false; //check if the item has children - if so, don't accept - return false;
        if (destNodesScope.depth() > 1) return false; //don't accept if depth > 1
        return (typeof $scope.filterValue == 'undefined' || $scope.filterValue == '') ? true : false;
      },

      dropped: function (event) {

        //find out id of the item in question
        var itemId = event.source.nodeScope.$modelValue.id;
        var position = event.dest.index;
        var parentId = 0;

        //find out if depth changed, and which way
        //from level 0 to level 1
        if (event.source.nodesScope.depth() < event.dest.nodesScope.depth()) {
          var parentId = event.dest.nodesScope.$parent.$modelValue.id;
        }

        //from level 1 to level 0
        else if (event.source.nodesScope.depth() > event.dest.nodesScope.depth()) {
          //parent id already zero, no need to do anything
        }

        //no depth change, just reorder
        else {
          //see if the item has a parent
          if (event.source.nodesScope.depth() != 0) {
            var parentId = event.dest.nodesScope.$parent.$modelValue.id;
          }
        }

        $scope.moveItem(itemId, parentId, position);
      },
    };

    $scope.asideState = {
      open: false,
    };

    $scope.editItem = function (item, itemIndex) {
      //defining canEditItemStatus here because roles is undefined at start for an unknown reason
      $scope.canEditItemStatus = Auth.hasRole(APP_ROLES.ADMIN) || Auth.hasRole(APP_ROLES.EDIT_ITEM_STATUS);

      if ($scope.activeItem == item.id) $scope.activeItem = false;
      else {
        $scope.activeItem = item.id;
      }
    };

    $scope.saveItem = function (item, itemIndex) {

      //set supplier from autocomplete
      if (item.selectedSupplier != void 0
            && item.selectedSupplier.originalObject.id != void 0) {
        item.supplier = item.selectedSupplier.originalObject.name;
      }
      else if (item.selectedSupplier != void 0) {
        item.supplier = item.selectedSupplier.originalObject;
      }
      else if ($scope.supplierValue !== false) {
        item.supplier = $scope.supplierValue;
      }

      Items.saveItem(item, $scope.event_id).then(function (result) {
        $scope.activeItem = false;

        if(result.category != $scope.categoryId){
          //category changed, remove from list
          $scope.items.splice(itemIndex, 1);
        }

        //set readable quantity as it's coming from API rather than bound to the scope model
        item.readable_quantity = result.readable_quantity;
      },

        function (error) {
          WSAlert.danger(error);
        });
    };

    $scope.removeItem = function (item, itemScope) {

      //confirm and remove children too
      $confirm({
        title: 'Delete item',
        text: 'Are you sure, this will also remove any potential child-items?',
      }).then(function () {
        Items.removeItem(item, $scope.event_id).then(function (result) {
          //remove from scope
          itemScope.remove();
        }),

            function (error) {
              WSAlert.danger(error);
            };
      });

    };

    $scope.addItem = function (parent) {
      //item, itemIndex

      $scope.addParent = parent || 0;
      var parent = parent || 0;

      $scope.asideState = {
        open: true,
      };

      function postClose() {
        $scope.asideState.open = false;
      }

      $aside.open({
        templateUrl: 'views/addRequestedItemAside.html',
        placement: 'right',
        size: 'lg',
        scope: $scope,
        backdrop: true,
        controller: 'addRequestedItemCtrl',
      }).result.then(postClose, postClose);
    };

    $scope.newSubItem = function (item) {
      $scope.addItem(item);
    };

    $scope.initCategory = function () {
      $scope.offset = 0;

      var deferred = $q.defer();

      if ($scope.canceler.promise) $scope.canceler.resolve();
      $scope.canceler = $q.defer();

      //check that skill_id and event_id have finished loading
      $q.when($scope.initializing.promise).then(function () {

        //reinitialize category var
        angular.forEach($scope.categories, function (val, key) {
          if (val.id == $scope.categoryId) $scope.selectedCategory = val.category;
        });

        //init search url
        $scope.searchAPI = API_IL + '/items/' + $scope.event_id + '/supplied_items/?search=';
        $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.event_id + '/search?q=';

        //get items
        Items.getItems($scope.categoryId, $scope.skill_id, $scope.event_id, $scope.limit, $scope.offset, $scope.filterValue, $scope.canceler).then(function (result) {
          //TODO this can happen server side, just make sure all level 0 items have a child_items array, even if it's empty
          angular.forEach(result.requested_items, function (val, key) {
            if (typeof val.child_items == 'undefined')
                result.requested_items[key].child_items = [];
          });

          $scope.items = result.requested_items;
          $scope.total = result.total;
          $scope.loading.initial = false;
          deferred.resolve();
        },

            function (error) {  //or fail
              WSAlert.danger(error);
              deferred.reject();
            });
      });

      return deferred.promise;

    };

    $scope.filter = function () {
      if ($scope.searchAPI = false) return;
      //$scope.loading.initial = true;
      $scope.initCategory();
    };

    $scope.clearSearchTerms = function () {
      $scope.filterValue = '';
      $scope.loading.initial = true;
      $scope.initCategory();
    };

    $scope.isLoading = function () {
      return $scope.loading.initial || $scope.loading.more || (Items.data != 'undefined' && typeof Items.data == 'promise');
    };

    $scope.more = function () {
      //stop if already loading
      if ($scope.isLoading())
          return;

      // all loaded already

      if ($scope.limit >= $scope.total || $scope.offset >= $scope.total) { return; }

      //canceler
      if ($scope.canceler.promise){ $scope.canceler.resolve();}
      $scope.canceler = $q.defer();

      $scope.offset += $scope.limit;
      $scope.loading.more = true;

      Items.getItems($scope.categoryId, $scope.skill_id, $scope.event_id, $scope.limit, $scope.offset, '', $scope.canceler).then(function (result) {
        //TODO this can happen server side, just make sure all level 0 items have a child_items array, even if it's empty
        angular.forEach(result.requested_items, function (val, key) {
          if (typeof val.child_items == 'undefined')
              val.child_items = [];

          $scope.items.push(val);
        });

        $scope.total = result.total;
        $scope.loading.more = false;
      },
        function (error) {
          WSAlert.danger(error);
          $scope.loading.more = false;
        });
    };

    $scope.supplierChanged = function (val) {
      $scope.supplierValue = val;
    };

    $scope.initCategory();

    // $scope.visible = function(item){

    //     var retval = false;

    //     var matcher = RegExp($scope.filterValue, 'i');

    //     //see if item has child items that match the query
    //     if(typeof item.child_items != 'undefined'){
    //         angular.forEach(item.child_items, function(val, key){
    //             if(!retval){
    //                 retval = !($scope.filterValue && $scope.filterValue.length > 0 && !val.description.text.match(matcher));

    //                 //id value search
    //                 if(retval == false){
    //                     retval = (val.id == $scope.filterValue);
    //                 }
    //             }
    //         });
    //     }

    //     //if my children don't match, or I didn't have any, see if I'm a match myself
    //     if(retval == false){
    //         retval = !($scope.filterValue && $scope.filterValue.length > 0 && !item.description.text.match(matcher));

    //         //id value search
    //         if(retval == false){
    //             retval = (item.id == $scope.filterValue);
    //         }
    //     }

    //     return retval;
    // };

    //link helper function from items
    $scope.factorNeeded = Items.factorNeeded;

    $scope.canEdit = function (statusId) {
      //TODO check if User level == organizer, then allow after all
      return (statusId == ITEM_STATUS.RED) ? true : false;
    };

    $scope.addStandardSet = function(){
      $('#id_value').val('');
      $scope.standardSetSelector = !$scope.standardSetSelector;

      //set focus
      if($scope.standardSetSelector){
        $timeout(function(){
          $('#id_value').focus();
        });
      }
    };


    $scope.addSelectedSet = function(set){
      if(typeof set === 'undefined' || typeof set.originalObject === 'undefined' || typeof set.originalObject.id === 'undefined') return false;

      $confirm({
        title: "Add standard set to the list?",
        itemset: set
      },
    {
      templateUrl: 'views/add-set-confirm.html'
    }).then(function(){
        $scope.loading.initial = true;

        //add the set to the list
        Items.addSet(set.originalObject.id, $scope.categoryId, $scope.event_id, $scope.skill_id).then(function(res){
          $scope.standardSetSelector = false;
          $scope.loading.initial = false;
          $scope.items = res;
        },
        function(error){
          WSAlert.warning(error);
          $scope.loading.initial = false;
        });
      });
    };

    $scope.toggleReordering = function(){
      $scope.allowReordering = !$scope.allowReordering;
    };

    $scope.clearSorting = function(e){
      $scope.orderProperty = null;//"item_order";
      $scope.reverse = false;
      $scope.allowReordering = true;
    };

    $scope.sortBy = function(sort){
      $scope.allowReordering = false;
      $scope.reverse = ($scope.orderProperty === sort) ? !$scope.reverse : false;
      $scope.orderProperty = sort;
    };


  })
.directive('requestedItem', function () {
  return {
    restrict: 'EA',
    scope: { item: '=item' },
    replace: true,
    templateUrl: 'views/item_render.html',
  };
});
