'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:recommendedItemAsideCtrl
 * @description
 * # recommendedItemAsideCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('recommendedItemAsideCtrl', function ($scope, $state, $uibModalInstance, $timeout, FileUploader, Items, WSAlert, ItemCategory, UNITS, SUPPLIED_ITEM_PRIORITIES, MULTIPLIERS, API_IL, RecommendedItems, SuppliedItem, $translate, auth) {

    //set event id from state if not already set
    if(!$scope.event_id){
      $scope.event_id = $state.params.eventId;
    }

    $scope.multipliers = MULTIPLIERS;
    $scope.priorities = SUPPLIED_ITEM_PRIORITIES;
    $scope.UNITS = UNITS;

    $scope.selectedLanguage = $translate.use();
    $scope.recommendedItemSuppliedForm = {};
    $scope.suppliedDirty = false;

    $scope.searchSupplierAPI = API_IL + '/suppliers/' + $scope.event_id + '/search?q=';
    $scope.searchAPI = API_IL + '/items/' + $scope.event_id + '/supplied_items/?limit=100&search=';

    $scope.categories = [];
    $scope.flattenCategories = function (categories, path) {
      angular.forEach(categories, function (category) {
        category.path = path;
        $scope.categories.push(category);
        if (category.children) {
          $scope.flattenCategories(category.children, category.name.text + ' / ' + path);
        }
      });
    }
    ItemCategory.getAllCategory($scope.event.id).then(function (res) {
      $scope.flattenCategories(res.categories, '');
    },
    function (error) {
      WSAlert.danger(error);
    });


    $scope.refreshView = function(_suppliedItemId, _eventId){
      var suppliedItemId = _suppliedItemId || false;
      var eventId = _eventId || false;

      if($scope.reviewItem != void 0){
        //pass in review item from the recommendations view
        $scope.recommendedItem = $scope.reviewItem;

        //load supplied item if exists
        if($scope.recommendedItem.suppliedItem != void 0){
          if($scope.recommendedItem.recommendedItemSupplied == void 0) {
            $scope.recommendedItem.recommendedItemSupplied = $scope.recommendedItem.suppliedItem;
          }
        }
      }
      else if(suppliedItemId !== false && eventId !== false){
        SuppliedItem.getItemForRecommendation(suppliedItemId, eventId).then(function(resSupplied){
          $scope.recommendedItem['suppliedItem'] = resSupplied;
          $scope.recommendedItem['recommendedItemSupplied'] = resSupplied;
          $scope.recommendedItem['person'] = {id: auth.user.person_id};
        }, function(error){ WSAlert.danger(error); });
      }
      else if($scope.item && $scope.item.id) {
        //fetch supplied item from API
        SuppliedItem.getItemForRecommendation($scope.item.supplied_item.id, $scope.item.status.event.id).then(function(resSupplied){

          $scope.recommendedItem = {
            requestedItemId : $scope.item.id,
            description : $scope.item.description,
            category: $scope.item.category,
            quantity : $scope.item.quantity,
            additional_quantity: $scope.item.additional_quantity,
            unit: $scope.item.unit,
            multiplier : $scope.item.multiplier,
            multiplyFactor : $scope.item.multiply_factor,
            price: $scope.item.price,
            secret: $scope.item.secret,
            area: $scope.item.area,
            tier: {id: $scope.item.tier_id},
            wrongSuppliedItem : false,
            comment: "",
            deletionSuggestion: false,
            rejected: false,
            person: {
              id: auth.user.person_id
            },
            suppliedItem: resSupplied,
            recommendedItemSupplied: resSupplied
          };
        }, function(error){ WSAlert.danger(error); });
      }
    };

    $scope.refreshView();

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

      //do the same for supplied item supplier - this is dirty, perhaps find a cleaner way
      //Set potential supplier from autocomplete
      //First case : supplier chosen by clicking a suggestion
      if ($scope.recommendedItem.recommendedItemSupplied.supplier != void 0
        && $scope.recommendedItem.recommendedItemSupplied.supplier.originalObject != void 0) {
          if($scope.recommendedItem.recommendedItemSupplied.supplier.originalObject.name != void 0){
            $scope.recommendedItem.recommendedItemSupplied.supplier = {
              name: $scope.recommendedItem.recommendedItemSupplied.supplier.originalObject.name
            };
          }
          else{
            $scope.recommendedItem.recommendedItemSupplied.supplier = {
              name: $scope.recommendedItem.recommendedItemSupplied.supplier.originalObject
            };
          }
        }
      //Second case : supplier set from text written in field
      else if ($scope.supplierValue != null) {
        $scope.recommendedItem.recommendedItemSupplied.supplier =  {
          name: $scope.supplierValue
        };
      }
      //////////////////

      //check if supplied form is $dirty
      if(
        this.recommendedItemSuppliedForm.DETAILED.$dirty ||
        this.recommendedItemSuppliedForm.HOST.$dirty ||
        this.recommendedItemSuppliedForm.LOGISTICS.$dirty ||
        this.recommendedItemSuppliedForm.INSTALLATION.$dirty ||
        this.recommendedItemSuppliedForm.FILES.$dirty ||
        this.recommendedItemSuppliedForm.EXTRA.$dirty ||
        !$scope.recommendedItem.suppliedItem.id ||
        $scope.uploader.queue.length > 0)
        $scope.suppliedDirty = true;


      if($scope.reviewItem != void 0){
        RecommendedItems.updateRecommendation($scope.recommendedItem, $scope.event_id, $scope.suppliedDirty).then(function(result){
          if($scope.uploader.queue.length > 0){
              //upload files
              $scope.recommendedItem.id = result.id;
              $scope.uploader.uploadAll();
          }
          $uibModalInstance.close(result);
        }, function(error){
          WSAlert.danger(error);
        });
      }
      else if($scope.recommendedItem.requestedItemId) {
        RecommendedItems.suggestOnItem($scope.recommendedItem, $scope.event_id, $scope.listId, $scope.suppliedDirty).then(function(result) {
          if($scope.uploader.queue.length > 0){
              //upload files
              $scope.recommendedItem.id = result.id;
              $scope.uploader.uploadAll();
          }
          else{
            $uibModalInstance.dismiss();
            $scope.successType = "EDIT";
            WSAlert.success($translate.instant('wsalert.success.recommend_edit'), '', false, false);
          }
        }, function(error) {
          WSAlert.danger(error);
        });
      } else {
        $scope.recommendedItem.person = {
          id: auth.user.person_id
        };

        RecommendedItems.suggestNew($scope.recommendedItem, $scope.event_id, $scope.listId, $scope.suppliedDirty).then(function(result) {
          if($scope.uploader.queue.length > 0){
              //upload files
              $scope.recommendedItem.id = result.id;
              $scope.uploader.uploadAll();
          }
          else{
            $uibModalInstance.dismiss();
            $scope.successType = "ADD";
            WSAlert.success($translate.instant('wsalert.success.recommend_add'));
          }
        }, function(error) {
          WSAlert.danger(error);
        });
      }

      if($scope.item && $scope.item.id) {
        $scope.item.modificationSuggestions++;
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

    $scope.uploader.onAfterAddingFile = function() {
       $scope.addForm.$setDirty();
    };

    $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
      //init array in case it doesn't exist yet
      if($scope.recommendedItem.recommendedItemSupplied.files == void 0)
        $scope.recommendedItem.recommendedItemSupplied.files = [];

      $scope.recommendedItem.recommendedItemSupplied.files.push(response);
    };

    //override item url's with the new generated item id
    $scope.uploader.onBeforeUploadItem = function(item){
        item.url = API_IL + "/recommended-items/event/" + $scope.event_id + "/supplied_items/" + $scope.recommendedItem.id + "/upload";
    };

    $scope.uploader.onCompleteAll = function() {
      if($scope.uploader.progress == 100) {
        $timeout(function () {
          //reload item
          $scope.uploader.clearQueue();

          //close modal window and show alert
          $uibModalInstance.dismiss();
          if($scope.successType === "EDIT")
            WSAlert.success($translate.instant('wsalert.success.recommend_edit'), '', false, false);
          else
            WSAlert.success($translate.instant('wsalert.success.recommend_add'));
        }, 1000)
      }
      else{
        WSAlert.danger($translate.instant('wsalert.danger.file_upload_failed'));
      }
    };
  });
