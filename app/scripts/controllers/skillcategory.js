'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillcategoryCtrl
 * @description
 * # SkillcategoryCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillCategoryCtrl', function ($scope, $state, $q, MULTIPLIERS, Items, WSAlert) {
    
    $scope.categoryId = $state.params.categoryId;
    $scope.selectedCategory = $scope.categories[$scope.categoryId];

    $scope.multipliers = MULTIPLIERS;
    $scope.tmp_item = {};
    $scope.items = {};

    //grid options
    $scope.gridOptions = {
        columnDefs: [
            { width: '10%' ,field: 'id', displayName: 'Id' },
            { width: '60%' ,field: 'description.text', displayName: 'Description' },
            { width: '15%' ,field: 'quantity', displayName: 'Qty' },
            { width: '15%' ,field: 'multiplier', displayName: 'Multiplier' }
        ],
        enableFiltering: false,
        enableSorting: true,
        showTreeExpandNoChildren: false,
        onRegisterApi: function(gridApi){
            $scope.gridApi = gridApi;
            $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);            

            // $scope.gridApi.treeBase.on.rowExpanded($scope, function(row){
            //     $interval(function(){
            //         $scope.nodeLoaded = true;
            //         console.log("node loaded");
            //     }, 2000, 1);
            //     console.log("grid api row expanded");
            // });
        }
    };

    $scope.filter = function(){
        $scope.gridApi.grid.refresh();
    };

    $scope.singleFilter = function(renderableRows){
        var matcher = new RegExp($scope.filterValue, 'i');
        renderableRows.forEach(function(row){
            var match = false;            
            
            //description
            if(row.entity.description.text.match(matcher)) match = true;                    

            if(!match)
                row.visible = false;


        });

        return renderableRows;
    };

    $scope.initCategory = function(){
        //check that skill_id and event_id have finished loading
        $q.when($scope.selectedSkill.promise).then(function(){
            //get items
            Items.getItems($scope.categoryId, $scope.skill_id, $scope.event_id).then(function(result){
                $scope.items = result;

                var items = [];

                angular.forEach(result, function(val, key){
                    val.$$treeLevel = 0;
                    items.push(val);

                    if(typeof val.child_items != 'undefined'){
                        //scan child items
                        angular.forEach(val.child_items, function(val2, key2){
                            //set tree level
                            val2.$$treeLevel = 1;
                            items.push(val2);
                        });                                                
                    }
                });                

                //TODO find a better way, perhaps sort differently on server side                

                $scope.gridOptions.data = items;
            },
            function(error){  //or fail
                WSAlert.danger(error); 
            });
        });
        
    };

 $scope.expandAll = function(){
    console.log($scope.gridApi);
    $scope.gridApi.treeBase.expandAllRows();
  };

    $scope.initCategory();
    
    var beforeSortItems = [];

    $scope.sortableOptions = {
        handle: '.sortHandle',
        connectWith: '.sortableContainer',
        start: function(){
            beforeSortItems = $scope.items.slice();
        },
        stop: function(e, ui) {            
            //level 0
            for (var i in $scope.items) {
                //set sort order
                $scope.items[i].order = i;

                //see if any parent id's changed to 0
                if($scope.items[i].parent_id != 0){
                    $scope.items[i].parent_id = 0;
                }

                //level 1
                for(var k in $scope.items[i].child_items){
                    //set sort order
                    $scope.items[i].child_items[k].order = k;

                    //see if any parent id's changed in this level
                    if($scope.items[i].child_items[k].parent_id != $scope.items[i].id){                        
                        $scope.items[i].child_items[k].parent_id = $scope.items[i].id;
                    }//if parent changed
                }
            }//for

            $scope.logMe();        

        }//stop
    };

    $scope.logMe = function(){
        for(var i= 0 ; i < $scope.items.length ; i++){
            console.log($scope.items[i]);
            if(typeof $scope.items[i].child_items != 'undefined' && $scope.items[i].child_items.length > 0){                                                                 
                console.log("--- CHILD ---");
                for(var k=0; k < $scope.items[i].child_items.length ; k++)
                    console.log($scope.items[i].child_items[k]);
                console.log("--- END CHILD ---")
            }
        }
    };

    $scope.sortable = false;

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

  });
