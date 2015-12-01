'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillCtrl
 * @description
 * # SkillCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillCtrl', function ($q, $http, $scope, $upload, $state, $interval, Language, Auth, APP_ROLES, API_IMAGES, $timeout, auth, Items, Events, WSAlert) {
    $scope.loading = {};    
    //$scope.skill_id = 
    //$scope.skill_id = $state.params.skillId;    
    $scope.categories = {};
    $scope.initializing = $q.defer();

/*$scope.selectedSkill = $q.defer();

        $scope.activeRole = Auth.activeRole();
        User.getSkill().then(function(result){
            $scope.selectedSkill.resolve(result);            
            $scope.selectedSkill = result;       

            $scope.skill_id = $scope.selectedSkill.id;
            $scope.event_id = $scope.selectedSkill.event.id;     
        },
        function(error){
            WSAlert.danger(error);
            $scope.selectedSkill.reject(error);
        });

        return $scope.selectedSkill.promise;
    }*/

    $scope.initSkill = function(){                                        
        if(typeof $scope.selectedSkill.id == 'undefined'){            
                $scope.skill_id = $state.params.skillId;
                $scope.initializing = $q.defer();
                Events.getSkill($scope.skill_id).then(function(result){                                                    
                    $scope.selectedSkill = result;

                    //re-init event id to be used later
                    $scope.event_id = result.event;    
                    $scope.getCategories();
                },
                function(error){
                    WSAlert.danger(error);
                    $scope.initializing.reject(error);
                });
        }
        else{
            $scope.initializing = $q.defer();
            $scope.getCategories();
        }
        
    };

    $scope.getCategories = function(){
        Items.getCategories($scope.selectedSkill.id).then(function(result){
            $scope.categories = result;
            $scope.initializing.resolve();
        },
        function(error){
            WSAlert.danger(error);
            $scope.initializing.reject(error);
        });
    };

    // if(!$scope.selectedSkill.id){        
    //     //if empty reload from main.js
    //     $scope.reload().then(function(selectedSkill){
    //         $scope.initSkill();
    //         //no need to do anything
    //     },
    //     function(error){
    //         WSAlert.danger(error);
    //     });
    // }           
    // else $scope.initSkill();
    $scope.initSkill();


    // $scope.categories = {
    // 	1: { "id": 1, name: "General Installations" },
    // 	2: { "id": 2, name: "Workshop Installations" },
    // 	3: { "id": 3, name: "Materials / Consumables" },
    // 	4: { "id": 4, name: "Familiarization materials" },
    // 	5: { "id": 5, name: "Samples" }
    // };



  });
