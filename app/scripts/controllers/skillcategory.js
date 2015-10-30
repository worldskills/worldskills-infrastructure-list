'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillcategoryCtrl
 * @description
 * # SkillcategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillCategoryCtrl', function ($scope, $state, $q, $aside, MULTIPLIERS, Items, WSAlert) {
    
    $scope.categoryId = $state.params.categoryId;
    $scope.selectedCategory = $scope.categories[$scope.categoryId];

    $scope.multipliers = MULTIPLIERS;
    $scope.tmp_item = {};
    $scope.items = {};

    //sidebar
    // $scope.editItem = function(item){
    //     var asideInstance = $aside.open({
    //       templateUrl: 'views/editRequestedItemAside.html',
    //       controller: 'editRequestedItemCtrl',
    //       placement: 'left',
    //       size: 'lg',
    //       scope: $scope
    //     });
    // };

    $scope.asideState = {
      open: false
    };
    
    $scope.editItem = function(item) {
      $scope.asideState = {
        open: true
      };
      
      function postClose() {
        $scope.asideState.open = false;
      }
      
      $aside.open({
        templateUrl: 'views/editRequestedItemAside.html',
        placement: 'right',
        size: 'md',
        scope: $scope,
        backdrop: true,
        controller: 'editRequestedItemCtrl'
        // controller: function($scope, $modalInstance) {
        //   $scope.ok = function(e) {
        //     $modalInstance.close();
        //     e.stopPropagation();
        //   };
        //   $scope.cancel = function(e) {
        //     $modalInstance.dismiss();
        //     e.stopPropagation();
        //   };
        // }
      }).result.then(postClose, postClose);
  };



    $scope.initCategory = function(){
        //check that skill_id and event_id have finished loading
        $q.when($scope.selectedSkill.promise).then(function(){
            //get items
            Items.getItems($scope.categoryId, $scope.skill_id, $scope.event_id).then(function(result){

                //TODO this can happen server side, just make sure all level 0 items have a child_items array, even if it's empty
                angular.forEach(result, function(val, key){
                    if(typeof val.child_items == 'undefined')
                        result[key].child_items = [];
                });

                $scope.items = result;
            },
            function(error){  //or fail
                WSAlert.danger(error); 
            });
        });
        
    };


    $scope.initCategory();

    $scope.filter = function(){

    };
      

    $scope.visible = function(item){        
        
        var retval = false;

        var matcher = RegExp($scope.filterValue, 'i');
        
        //see if item has child items that match the query     
        if(typeof item.child_items != 'undefined'){       
            angular.forEach(item.child_items, function(val, key){
                if(!retval){
                    retval = !($scope.filterValue && $scope.filterValue.length > 0 && !val.description.text.match(matcher));
    
                    //id value search
                    if(retval == false){
                        retval = (val.id == $scope.filterValue);
                    }
                }
            });
        }

        //if my children don't match, or I didn't have any, see if I'm a match myself        
        if(retval == false){
            retval = !($scope.filterValue && $scope.filterValue.length > 0 && !item.description.text.match(matcher));

            //id value search
            if(retval == false){
                retval = (item.id == $scope.filterValue);
            }
        }

        
        return retval;
    };
    

    // $scope.items = [
    //     { "multiply_factor": 2, "order": "1", "id": 1, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 1" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "PER_NUM_COMPETITORS", "price": 13223.21, "skill": { "id": 387 } },
    //     { "order": "2", "id": 2, "child_items": [
    //         { "order": "5", "id": 5, "parent_id": 2, "description": { "lang_code": "en", "text": "Hoverboard 5" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "COMPETITORS", "price": 13223.21, "skill": { "id": 387 } },
    //         { "multiply_factor": 10, "order": "6", "id": 6, "parent_id": 2, "description": { "lang_code": "en", "text": "Hoverboard 6" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "PER_NUM_COMPETITORS", "price": 13223.21, "skill": { "id": 387 } },
    //         { "order": "7", "id": 7, "parent_id": 2, "description": { "lang_code": "en", "text": "Hoverboard 7" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //         { "order": "8", "id": 8, "parent_id": 2, "description": { "lang_code": "en", "text": "Hoverboard 8" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     ], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 2" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     { "order": "3", "id": 3, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 3" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } }
    //     // { "id": 4, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 4" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },        
    //     // { "id": 9, "child_items": [], "parent_id": 8, "description": { "lang_code": "en", "text": "Hoverboard 9" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 10, "child_items": [], "parent_id": 8, "description": { "lang_code": "en", "text": "Hoverboard 10" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 11, "child_items": [], "parent_id": 8, "description": { "lang_code": "en", "text": "Hoverboard 11" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 12, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 12" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 13, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 13" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 14, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 14" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 15, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 15" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 16, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 16" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 17, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 17" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 18, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 18" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } },
    //     // { "id": 19, "child_items": [], "parent_id": 0, "description": { "lang_code": "en", "text": "Hoverboard 19" }, "category": { "id": 1 }, "quantity": 4, "multiplier": "SKILL", "price": 13223.21, "skill": { "id": 387 } }
    // ];


    $scope.getMultiplier = function(item){
        var retval = "";
        var multiplier = "";        

        return retval;
    };

  })
.directive('requested', function(){
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/item_render.html'    
  }
});