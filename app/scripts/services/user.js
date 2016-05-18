'use strict';

/**
 * @ngdoc service
 * @name ilApp.User
 * @description
 * # User
 * Service in the ilApp.
 */
angular.module('ilApp')
  .factory('User', function ($q, $filter, $http, API_IL, auth, APP_ID, APP_ROLES, $timeout, API_PEOPLE, API_AUTH, POSITIONS) {

    var User = {
      skill: false,
      sector: false,
      event: false,
      activePositions: $q.defer()
    };

    User.getActivePositions = function () {

      //defer if needed
      if(Array.isArray(User.activePositions))
        User.activePositions = $q.defer();

      //wait for auth.user to resolve
      $q.when(auth.user.$promise).then(function () {
        $http.get(API_IL + "/person/" + auth.user.person_id + "/permissions/").then(function (result) {
            //   //check that a role exists too
            //   //if(role.ws_entity.id == )
            //   if(val.sector !== null){
            //     //check if a sector manager role exists in roles
            //     angular.forEach(auth.user.roles, function(val2, key2){
            //       if(val2.name == APP_ROLES.WS_SECTOR_MANAGER && val.sector.event.organizer == val2.ws_entity.id) {
            //         User.sector = val.sector.id;
            //         val['type'] = APP_ROLES.WS_SECTOR_MANAGER;
            //         val['role'] = val2;
            //         User.activePositions.push(val);
            //       }
            //     });
            //   }//sector based
            //   else if(val.event !== null){
            //     //check if a sector manager role exists in roles
            //     angular.forEach(auth.user.roles, function(val2, key2){
            //       if(val2.name == APP_ROLES.ORGANIZER && val.event.organizer == val2.ws_entity.id) {
            //         User.event = val.event.id;
            //         val['type'] = APP_ROLES.ORGANIZER;
            //         val['role'] = val2;
            //         User.activePositions.push(val);
            //       }
            //     });
            //   }//event based
            //   else if(val.skill !== null){
            //     //check if a sector manager role exists in roles
            //     angular.forEach(auth.user.roles, function(val2, key2){
            //       if(val2.name == APP_ROLES.WS_MANAGER && val.skill.event.organizer == val2.ws_entity.id) {
            //         User.skill = val.skill.id;
            //         val['type'] = APP_ROLES.WS_MANAGER;
            //         val['role'] = val2;
            //         User.activePositions.push(val);
            //       }
            //     });
            //   }//skill based
            // });

            if (result.data.person_positions.length > 0) {
              User.activePositions.resolve(result.data.person_positions);
              User.activePositions = result.data.person_positions;
            }
            else
              User.activePositions.reject("No active positions for user");
          },
          function (error) {
            User.activePositions.reject("Could not fetch active user positions: " + error.data.user_msg);
          })
      });

      return User.activePositions.promise;
    };

    User.getSkill = function () {

      var deferred = $q.defer();

      //wait for auth.user to resolve
      $q.when(auth.user.$promise).then(function () {
        $http.get(API_PEOPLE + "/person/" + auth.user.person_id + "/positions").then(function (result) {
            angular.forEach(result.data.person_positions, function (val, key) {
              //TODO: Implement base positions and compare to the base position, check for the same entity in position and permission

              if (val.position.id == POSITIONS.WS_MANAGER || val.position.id == POSITIONS.WS_MANAGER_ASSISTANT) {
                User.skill = val.skill;
              }//if WSM / WSMA skill
            });

            if (User.skill !== false) {
              deferred.resolve(User.skill);
            }
          },
          function (error) {
            deferred.reject("Could not fetch user skill: " + error.data.user_msg);
          })
      });

      return deferred.promise;
    };

    User.getSector = function () {

      var deferred = $q.defer();

      //wait for auth.user to resolve
      $q.when(auth.user.$promise).then(function () {
        $http.get(API_PEOPLE + "/person/" + auth.user.person_id + "/positions").then(function (result) {
            angular.forEach(result.data.person_positions, function (val, key) {
              //TODO: Implement base positions and compare to the base position, check for the same entity in position and permission
              if (val.position.id == POSITIONS.WS_SECTOR_MANAGER) {
                User.sector = val.sector;
              }//if WSM
            });

            if (User.sector !== false) {
              deferred.resolve(User.sector);
            }
          },
          function (error) {
            deferred.reject("Could not fetch user skill: " + error.data.user_msg);
          })
      });

      return deferred.promise;
    };

    User.getEvent = function () {

      var deferred = $q.defer();

      //wait for auth.user to resolve
      $q.when(auth.user.$promise).then(function () {
        $http.get(API_PEOPLE + "/person/" + auth.user.person_id + "/positions").then(function (result) {
            angular.forEach(result.data.person_positions, function (val, key) {
              //TODO: Implement base positions and compare to the base position, check for the same entity in position and permission
              if (val.position.id == POSITIONS.ORGANIZER) {
                User.event = val.event;
              }//if organizer
            });

            if (User.event !== false) {
              deferred.resolve(User.event);
            }
          },
          function (error) {
            deferred.reject("Could not fetch user skill: " + error.data.user_msg);
          })
      });

      return deferred.promise;
    };

    User.isAdmin = function () {
      var isAdmin = false;

      angular.forEach(auth.user.roles, function (val, key) {
        if (val.role_application.application_code == APP_ID && val.name == APP_ROLES.ADMIN)
          isAdmin = true;
      });

      return isAdmin;

    };


    return User;
  });
