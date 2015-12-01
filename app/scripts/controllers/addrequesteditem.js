'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:addRequestedItemCtrl
 * @description
 * # addRequestedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('addRequestedItemCtrl', function ($scope, $uibModalInstance, Items, WSAlert, MULTIPLIER_DEFAULT) {
    	
    $scope.item = {
    	multiplier: MULTIPLIER_DEFAULT
    };

    $scope.disableInput = false;

    $scope.$watch('suppliedItem', function(val1, val2){
    	if(typeof val1.title !== 'undefined')
    		$scope.disableInput = true;	
    });

    $scope.rename = function(){
    	$scope.suppliedItem = {};
    	$scope.disableInput = false;
    };

    $scope.addItem = function(){
    	$scope.loading.addItem = true;
    	//if supplied item selected - use link together
    	if(typeof $scope.suppliedItem.originalObject.id !== 'undefined'){
    		//get description from supplied item
            // $scope.item.description = {
            //     'lang_code': $scope.selectedLanguage,
            //     'text': $scope.suppliedItem.originalObject
            // };

            $scope.item.description = {
                'lang_code': $scope.selectedLanguage,
                'text': $scope.suppliedItem.originalObject.description.text
            };
            // $scope.item.description = $scope.suppliedItem.originalObject.description;

            //set category
            $scope.item.category = $scope.categoryId;

            //add supplied item id
            $scope.item.supplied_item = { 'id' : $scope.suppliedItem.originalObject.id };           

            //add the requested item
            Items.linkItem($scope.item, $scope.event_id).then(function(result){              
                //Push the new item into the items tree
                $scope.items.push(result);
                
                //clear and dismiss the form
                $scope.addForm.$setPristine();
                $uibModalInstance.dismiss();
                $scope.loading.addItem = false;             
            },
            function(error){
                WSAlert.danger(error);
                $uibModalInstance.dismiss();
                $scope.loading.addItem = false;
            });
    	}//if supplied item selected
    	else{
    		//get description from supplied item
            $scope.item.description = {
                'lang_code': $scope.selectedLanguage,
                'text': $scope.suppliedItem.originalObject
            };

            //set category
            $scope.item.category = $scope.categoryId;

            //add the requested item
            Items.addItem($scope.item, $scope.event_id).then(function(result){              
                //Push the new item into the items tree
                $scope.items.push(result);
                
                //clear and dismiss the form
                $scope.addForm.$setPristine();
                $uibModalInstance.dismiss();
                $scope.loading.addItem = false;             
            },
            function(error){
                WSAlert.danger(error);
                $uibModalInstance.dismiss();
                $scope.loading.addItem = false;
            });
    	}//creating completely new item
    };

    $scope.cancel = function(){
    	$uibModalInstance.dismiss();
    };

  });
