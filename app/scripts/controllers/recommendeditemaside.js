'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:recommendedItemAsideCtrl
 * @description
 * # recommendedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('recommendedItemAsideCtrl', function ($scope, $state, $uibModalInstance, Items, WSAlert, MULTIPLIERS, MULTIPLIER_DEFAULT, API_IL, RecommendedItems, $translate, auth) {

    //set event id from state if not already set
    if(!$scope.event_id){
      $scope.event_id = $state.params.eventId;
    }

    $scope.multipliers = MULTIPLIERS;

    $scope.selectedLanguage = $translate.use();

    $scope.recommendedItem = {
      multiplier: MULTIPLIER_DEFAULT
    };
    $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.event_id + '/search?q=';
    $scope.searchAPI = API_IL + '/items/' + $scope.event_id + '/supplied_items/?search=';

    if($scope.item && $scope.item.id) {
      $scope.recommendedItem = {
        requestedItemId : $scope.item.id,
        description : $scope.item.description,
        quantity : $scope.item.quantity,
        additional_quantity: $scope.item.additional_quantity,
        unit: $scope.item.unit,
        multiplier : $scope.item.multiplier,
        listCategory : {
          id: $scope.item.category
        },
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
          id: auth.user.person_id
        },
        listCategoryId: $scope.item.category
      };
    }

    $scope.supplierValue = null;

    $scope.supplierChanged = function (val) {
      if(val == "") {
        $scope.supplierValue = null;
      } else {
        $scope.supplierValue = val;
      }
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
      //First case : description set by clicking a suggestion from catalogue
      if($scope.recommendedItem.description.originalObject &&
        $scope.recommendedItem.description.originalObject.description) {
        $scope.recommendedItem.suppliedItem = $scope.recommendedItem.description.originalObject;
        $scope.recommendedItem.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.recommendedItem.description.originalObject.description.text
        }
      //Second case : description only set from written text in field
      } else if ($scope.recommendedItem.description.originalObject) {
        $scope.recommendedItem.description = {
          lang_code: $scope.selectedLanguage,
          text: $scope.recommendedItem.description.originalObject
        }
      }

      //Set potential supplier from autocomplete
      //First case : supplier chosen by clicking a suggestion
      if ($scope.recommendedItem.potentialSupplier != void 0
        && $scope.recommendedItem.potentialSupplier.originalObject != void 0) {
          $scope.recommendedItem.potentialSupplier = $scope.recommendedItem.potentialSupplier.originalObject;

        }
      //Second case : supplier set from text written in field
      else if ($scope.supplierValue != null) {
        $scope.recommendedItem.potentialSupplier =  {
          name: $scope.supplierValue
        }
      }

      $scope.recommendedItem.listCategory = $scope.recommendedItem.listCategory || $scope.$parent.item.listCategory;

      if($scope.recommendedItem.requestedItemId) {
        RecommendedItems.suggestOnItem($scope.recommendedItem, $scope.event_id, $scope.skillId).then(function(result) {
          $uibModalInstance.dismiss();
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_EDIT'));
        }, function(error) {
          WSAlert.danger(error);
        });
      } else {
        $scope.recommendedItem.person = {
          id: auth.user.person_id
        };

        RecommendedItems.suggestNew($scope.recommendedItem, $scope.event_id, $scope.skillId).then(function(result) {
          $uibModalInstance.dismiss();
          WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ADD'));
        }, function(error) {
          WSAlert.danger(error);
        });
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
