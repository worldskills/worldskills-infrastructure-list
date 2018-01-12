'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:EventSetsEditCtrl
 * @description
 * # EventSetsEditCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('EventSetsEditCtrl', function ($scope, $state, $timeout, ItemSets, WSAlert, $confirm, API_IL, MULTIPLIERS, MULTIPLIER_DEFAULT, $translate) {

    $scope.selectedSet = {}; //selected set details
    $scope.editDetails = false; // shows edit set details form
    $scope.filterValue = ""; //filters items in set
    $scope.searchAPI = API_IL + '/items/' + $state.params.eventId+ '/supplied_items/?search='; //search url for autocomplete
    $scope.multipliers = MULTIPLIERS;

    $scope.loading.set = true;

    ItemSets.load($state.params.setId).then(function(res){
        $scope.selectedSet = res;
        $scope.loading.set = false;
    },
    function(error){
      WSAlert.danger(error);
      $scope.loading.set = false;
    });

    $scope.updateQuantities = function(){
      $scope.loading.set = true;

      ItemSets.updateQuantities($scope.selectedSet).then(function(res){
        WSAlert.success($translate.instant('WSALERT.SUCCESS.QUANTITIES_UPDATED'));
        $scope.selectedSet = res.data;
        $scope.loading.set = false;
      },
      function(error){
        WSAlert.danger(error);
        $scope.loading.set = false;
      });
    };

    $scope.removeItem = function(item, index){
      $confirm({
        title: $translate.instant('DELETE_ITEM_FROM_SET.TITLE'),
        text: $translate.instant('DELETE_ITEM_FROM_SET.TEXT'),
      }).then(function () {
        ItemSets.removeFromSet($scope.selectedSet.id, item.id).then(function(res){
          $scope.selectedSet.items.splice(index, 1);
        },
        function(error){
          WSAlert.danger($translate.instant('JSTEX.WSALERT.DANGER.ITEM_COULD_NOT_BE_REMOVED_FROM_SET'));
        });
      });
    }


    $scope.saveDetails = function(set){
      $scope.loading.setDetails = true;

      ItemSets.saveDetails(set).then(function(res){
        $scope.editDetails = false;
        $scope.loading.setDetails = false;
      },
      function(error){
        WSAlert.warning(error);
        $scope.loading.setDetails = false;
      });
    };

    $scope.addItemSelected = function(item){
      if(typeof item === 'undefined') return false;

      $confirm({
        title: $translate.instant('ADD_ITEM_TO_THE_SET.TITLE'),
        text: $translate.instant('ADD_ITEM_TO_THE_SET.TEXT', { text: item.originalObject.description.text }),
      }).then(function(){
        //add item to set
        addToSet($scope.selectedSet, item);

        //cleanup
        $scope.$broadcast('angucomplete-alt:clearInput');
      });
    };

    $scope.deleteSet = function(set){
      $confirm({
        title: $translate.instant('ARE_YOU_SURE.TITLE'),
        text: $translate.instant('ARE_YOU_SURE.TEXT', {text: set.name})
      }).then(function(){
        deleteSet(set.id);
      })
    };

    $scope.addItemToSet = function(){
      $scope.addItem = !$scope.addItem;

      //set focus
      if($scope.addItem){
        $timeout(function(){
          $('#id_value').focus();
        });
      }
    };

    function addToSet(set, item){
      $scope.addItem = false;
      $scope.loading.addToSet = true;

      ItemSets.addToSet(set.id, item).then(function(res){
        $scope.selectedSet.items.push(res.data);
        $scope.loading.addToSet = false;
      },
      function(error){
        WSAlert.danger(error);
        $scope.loading.addToSet = false;
      });
    }

    function deleteSet(setId){
      $scope.loading.set = true;

      ItemSets.removeSet(setId).then(function(res){
        WSAlert.success($translate.instant('WSALERT.SUCCESS.SET_REMOVED_SUCCESSFULLY'));
        $state.go('event.sets', {eventId: $state.params.eventId});

        //remove from sets
        angular.forEach($scope.sets, function(val, key){
          console.log(val, key);
          if(val.id == setId)
            $scope.sets.splice(key, 1);
        });

        $scope.loading.set = false;
      },
      function(error){
        WSAlert.danger(error);
        $scope.loading.set = false;
      });
    }

});
