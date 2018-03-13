'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:recommendedItemAsideCtrl
 * @description
 * # recommendedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('recommendedItemAsideCtrl', function ($scope, $uibModalInstance, Items, WSAlert, MULTIPLIERS, ITEM_STATUS, ITEM_STATUS_TEXT, API_IL, RecommendedItems, $translate, auth) {

    $scope.multipliers = MULTIPLIERS;

    $scope.selectedLanguage = $translate.use();

    $scope.recommendedItem = {};
    $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.event_id + '/search?q=';
    $scope.searchAPI = API_IL + '/items/' + $scope.event_id + '/supplied_items/?search=';
    
    if($scope.item && $scope.item.id) {
      $scope.recommendedItem = {
        requestedItemId : $scope.item.id,
        description : $scope.item.description,
        quantity : $scope.item.quantity,
        multiplier : $scope.item.multiplier,
        multiplyFactor : $scope.item.multiply_factor,
        potentialSupplier : {
          name: $scope.item.supplier
        },
        price: $scope.item.price,
        wrongSuppliedItem : false,
        comment: "",
        deletionSuggestion: false,
        rejected: false,
        person: {
          id: auth.user.id
        }
      };
    }

    $scope.supplierValue = false;
    
    $scope.supplierChanged = function (val) {
      if(val == "") {
        $scope.supplierValue = false;
      } else {
        $scope.supplierValue = val;
      }
    };

    function closeDialog(){
        $scope.editModal.close(null);
    };

    $scope.editItem = function(item, index){
      closeDialog();
    };

    $scope.factorNeeded = function (multiplierId) {
      var retval = false;

      angular.forEach($scope.multipliers, function (val) {
        if (val.id == multiplierId && val.x_number_needed === true) retval = true;
      });

      return retval;
    };

    $scope.saveItem = function () {



      //Set recommended item name from autocomplete
      if($scope.recommendedItem.description.originalObject &&
        $scope.recommendedItem.description.originalObject.description) {
        $scope.recommendedItem.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.recommendedItem.description.originalObject.description.text
        }
      } else if ($scope.recommendedItem.description.originalObject) {
        $scope.recommendedItem.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.recommendedItem.description.originalObject
        }
      }

      //Set potential supplier from autocomplete
      if ($scope.recommendedItem.potentialSupplier != void 0
        && $scope.recommendedItem.potentialSupplier.originalObject != void 0
        && $scope.recommendedItem.potentialSupplier.originalObject.id != void 0) {
        $scope.recommendedItem.potentialSupplier = $scope.recommendedItem.potentialSupplier.originalObject.name;
      }
      else if ($scope.recommendedItem.potentialSupplier != void 0
        && $scope.recommendedItem.potentialSupplier.originalObject != void 0) {
          $scope.recommendedItem.potentialSupplier = $scope.recommendedItem.potentialSupplier.originalObject;

        }
      else if ($scope.supplierValue != false) {
        $scope.recommendedItem.potentialSupplier = $scope.supplierValue;
      }
      else if ($scope.recommendedItem.potentialSupplier.name) {
        $scope.recommendedItem.potentialSupplier = $scope.recommendedItem.potentialSupplier.name;
      }


      if($scope.recommendedItem.requestedItemId) {

        console.log($scope.recommendedItem);

        RecommendedItems.suggestOnItem($scope.recommendedItem, $scope.event_id, $scope.skillId).then(function(result) {
          $uibModalInstance.dismiss();
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_EDIT'));
        }, function(error) {
          WSAlert.danger(error);
        });
      } else {    
        RecommendedItems.suggestNew($scope.recommendedItem, $scope.event_id, $scope.skillId).then(function(result) {
          $uibModalInstance.dismiss();
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ADD'));
        }, function(error) {
          WSAlert.danger(error);
        });
      }
    };
  });
