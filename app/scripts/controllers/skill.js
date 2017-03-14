'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillCtrl
 * @description
 * # SkillCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillCtrl', function ($q, $http, $scope, $state, $interval, Language, Auth, APP_ROLES, API_IMAGES, $timeout, auth, Items, Events, WSAlert) {
    //$scope.skill_id =
    //$scope.skill_id = $state.params.skillId;
    $scope.categories = {};
    $scope.initializing = $q.defer();

    $scope.initSkill = function(){
        if(typeof $scope.selectedSkill.id == 'undefined'){
                $scope.skill_id = $state.params.skillId;
                $scope.initializing = $q.defer();
                Events.getSkill($scope.skill_id).then(function(result){
                    $scope.selectedSkill = result;

                    //re-init event id to be used later
                    $scope.event_id = result.event.id;
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
      //perhaps not needed, but checks if app has fully loaded before getting the categories
      $q.when($scope.appLoaded).then(function() {
        Items.getCategories($scope.selectedSkill.id).then(function (result) {
          $scope.categories = result;
          $scope.initializing.resolve();
        },
        function (error) {
          WSAlert.danger(error);
          $scope.initializing.reject(error);
        });
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

  });
