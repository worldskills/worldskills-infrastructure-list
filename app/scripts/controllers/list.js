'use strict';

angular.module('ilApp')
  .controller('ListCtrl', function ($q, $http, $scope, $state, $stateParams, $interval, Language, APP_ID, APP_ROLES, API_IMAGES, $timeout, Auth, auth, Items, Events, List, Category, WSAlert) {

    $scope.categories = {};
    $scope.participantNumbers = {};
    $scope.initializing = $q.defer();

    $scope.event_id = $stateParams.eventId;
    $scope.listId = $stateParams.listId;

    $scope.initSkill = function(){

        $scope.list = List.get({id: $scope.listId}, function(result){

            Auth.setUserListPermissions($scope.list);

            auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_SUPPLIED_ITEMS, APP_ROLES.EDIT_REQUESTED_ITEMS], $scope.list.entity_id).then(function (hasUserRole) {
              $scope.canHandleRecommend = hasUserRole;
            });

            $scope.getCategories();
        },
        function(error){
            WSAlert.danger(error);
            $scope.initializing.reject(error);
        });

        Events.getEvent($scope.event_id).then( function (event) {
          $scope.event = event;
          Auth.setUserEventPermissions($scope.event);
          auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_SUPPLIED_ITEMS], $scope.event.entity_id).then(function (hasUserRole) {
            $scope.canEditSuppliedItem = hasUserRole;
          });
          auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_ITEM_STATUS], $scope.event.entity_id).then(function (hasUserRole) {
            $scope.canEditItemStatus = hasUserRole;
          });
          auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_CONFIG], $scope.event.entity_id).then(function (hasUserRole) {
            $scope.canEditConfig = hasUserRole;
          });
        });
    };


    $scope.getCategories = function(){

        var promises = [];
        promises.push(Category.getAll($scope.event_id));
        
        if ($scope.list.skill) {
          promises.push(Events.getParticipantCounts($scope.list.skill.id));
        }

        $q.all(promises).then(function(res){

          $scope.categories = res[0];
          if (typeof res[1] !== 'undefined') {
            $scope.participantNumbers = res[1];
          }

          $scope.initializing.resolve();
        }, function(error){
          WSAlert.danger(error);
          $scope.initializing.reject(error);
        });

    };

    $scope.initSkill();

  });
