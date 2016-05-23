'use strict';

/**
 * @ngdoc service
 * @name ilApp.User
 * @description
 * # User
 * Service in the ilApp.
 */
angular.module('ilApp')
  .factory('User', function ($q, $filter, $http, API_IL, auth, APP_ID, APP_ROLES, $timeout, API_PEOPLE, API_AUTH) {

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

    return User;
  });
