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

    $scope.canHandleRecommend = function() {
      return Auth.hasRole(APP_ROLES.ADMIN) || Auth.hasRole(APP_ROLES.WS_SECTOR_MANAGER);
    };

    $scope.initSkill = function(){
        $scope.skill_id = $state.params.skillId;
        Events.getSkill($scope.skill_id).then(function(result){
            $scope.selectedSkill = result;

            $scope.activePositions.then(function (activePositions) {
              Auth.setUserSkillPermissions(activePositions, $scope.selectedSkill);
              Auth.setUserEventPermissions(activePositions, $scope.selectedSkill.event);
            });

            //re-init event id to be used later
            $scope.event_id = result.event.id;
            $scope.listId = result.list_id;
            $scope.getCategories();
        },
        function(error){
            WSAlert.danger(error);
            $scope.initializing.reject(error);
        });
    };


    $scope.getCategories = function(){

        var promises = [];
        promises.push(Items.getCategories($scope.skill_id));
        promises.push(Events.getParticipantCounts($scope.skill_id));

        $q.all(promises).then(function(res){

          $scope.categories = res[0];
          $scope.participantNumbers = res[1];

          $scope.initializing.resolve();
        }, function(error){
          WSAlert.danger(error);
          $scope.initializing.reject(error);
        });

    };

    $scope.initSkill();

  });
