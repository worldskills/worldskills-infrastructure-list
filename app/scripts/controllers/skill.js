'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillCtrl
 * @description
 * # SkillCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillCtrl', function ($q, $http, $scope, $upload, $state, $interval, Language, Auth, APP_ROLES, API_IMAGES, $timeout, auth, Items, WSAlert) {
    $scope.loading = {};    
    //$scope.skill_id = 
    //$scope.skill_id = $state.params.skillId;    
    $scope.categories = {};
    
    if(!$scope.selectedSkill.id){
        //if empty reload from main.js
        $scope.reload().then(function(selectedSkill){
            //no need to do anything
        },
        function(error){
            WSAlert.danger(error);
        });
    }           

    $scope.initSkill = function(){
        Items.getCategories().then(function(result){
            $scope.categories = result;
        },
        function(error){
            WSAlert.danger(error);
        });
    };

    $scope.initSkill();
    // $scope.categories = {
    // 	1: { "id": 1, name: "General Installations" },
    // 	2: { "id": 2, name: "Workshop Installations" },
    // 	3: { "id": 3, name: "Materials / Consumables" },
    // 	4: { "id": 4, name: "Familiarization materials" },
    // 	5: { "id": 5, name: "Samples" }
    // };



  });
