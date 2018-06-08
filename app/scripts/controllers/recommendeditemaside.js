'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:recommendedItemAsideCtrl
 * @description
 * # recommendedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('recommendedItemAsideCtrl', function ($scope, $state, $uibModalInstance, $timeout, FileUploader, Items, WSAlert, ItemCategory, SUPPLIED_ITEM_PRIORITIES, MULTIPLIERS, MULTIPLIER_DEFAULT, API_IL, RecommendedItems, SuppliedItem, $translate, auth) {

    //set event id from state if not already set
    if(!$scope.event_id){
      $scope.event_id = $state.params.eventId;
    }

    $scope.multipliers = MULTIPLIERS;
    $scope.priorities = SUPPLIED_ITEM_PRIORITIES;

    $scope.selectedLanguage = $translate.use();

    $scope.recommendedItem = {
      multiplier: MULTIPLIER_DEFAULT
    };

    $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.event_id + '/search?q=';
    $scope.searchAPI = API_IL + '/items/' + $scope.event_id + '/supplied_items/?search=';

    ItemCategory.getAllSubCategory($scope.event_id).then(function(subCategories){
      $scope.subCategories = subCategories.categories;
    }, function(error){ WSAlert.warning(error); });

    if($scope.item && $scope.item.id) {
      //fetch supplied item from API
      SuppliedItem.getItemForRecommendation($scope.item.supplied_item.id, $scope.item.status.event.id).then(function(resSupplied){

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
          listCategoryId: $scope.item.category,
          suppliedItem: resSupplied,
          recommendedItemSupplied: resSupplied
        };
      }, function(error){ WSAlert.danger(error); });
    }

    $scope.potentialSupplierValue = null;

    $scope.potentialSupplierChanged = function (val) {
      if(val == "") {
        $scope.potentialSupplierValue = null;
      } else {
        $scope.potentialSupplierValue = val;
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
        $scope.recommendedItem.recommendedItemSupplied = $scope.recommendedItem.description.originalObject;
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
          if($scope.uploader.queue.length > 0){
              //upload files
              $scope.recommendedItem.id = result.id;
              $scope.uploader.uploadAll();
          }
          else{
            $uibModalInstance.dismiss();
            $scope.successType = "EDIT";
            WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_EDIT'));
          }
        }, function(error) {
          WSAlert.danger(error);
        });
      } else {
        $scope.recommendedItem.person = {
          id: auth.user.person_id
        };

        RecommendedItems.suggestNew($scope.recommendedItem, $scope.event_id, $scope.skillId).then(function(result) {
          if($scope.uploader.queue.length > 0){
              //upload files
              $scope.recommendedItem.id = result.id;
              $scope.uploader.uploadAll();
          }
          else{
            $uibModalInstance.dismiss();
            $scope.successType = "ADD";
            WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ADD'));
          }
        }, function(error) {
          WSAlert.danger(error);
        });
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    //FileUploader
    $scope.uploader = new FileUploader({
      url: API_IL + "/recommended-items/event/" + $scope.event_id + "/supplied_items/" + $scope.recommendedItem.id + "/upload",
      headers: {
        Authorization: 'Bearer ' + auth.accessToken
      }
    });

    $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
      $scope.recommendedItem.recommendedItemSupplied.files.push(response);
    };

    //override item url's with the new generated item id
    $scope.uploader.onBeforeUploadItem = function(item){
        item.url = API_IL + "/recommended-items/event/" + $scope.event_id + "/supplied_items/" + $scope.recommendedItem.id + "/upload";
    };

    $scope.uploader.onCompleteAll = function() {
//      console.info('onCompleteAll');
      if($scope.uploader.progress == 100) {
        $timeout(function () {
          //reload item
          $scope.uploader.clearQueue();

          //close modal window and show alert
          $uibModalInstance.dismiss();
          if($scope.successType === "EDIT")
            WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_EDIT'));
          else
            WSAlert.success($translate.instant('WSALERT.SUCCESS.RECOMMEND_ADD'));
        }, 1000)
      }
      else{
        WSAlert.danger($translate.instant('WSALERT.DANGER.FILE_UPLOAD_FAILED'));
      }
    };
  });
