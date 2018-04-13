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
    $scope.participantNumbers = {};
    $scope.initializing = $q.defer();

    $scope.canRecommend = function() {
      return Auth.hasRole(APP_ROLES.ADMIN) || Auth.hasRole(APP_ROLES.RECOMMEND);
    };

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

        var promises = [];
        promises.push(Items.getCategories($scope.selectedSkill.id));
        promises.push(Events.getParticipantCounts($scope.skill_id));

        $q.all(promises).then(function(res){

          $scope.categories = res[0];
          $scope.participantNumbers = res[1];

          $scope.initializing.resolve();
        }, function(error){
          WSAlert.danger(error);
          $scope.initializing.reject(error);
        });

      });
    };

    $scope.initSkill();

  });
