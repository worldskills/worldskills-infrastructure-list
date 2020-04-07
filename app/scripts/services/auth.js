'use strict';

angular.module('ilApp')
  .service('Auth', function Person(API_AUTH, auth, APP_ROLES, APP_ID, $http, $q) {

    var Auth = {};

    Auth.hasRole = function(role) {
      var hasRole = false;
      angular.forEach(auth.user.roles, function (val, key) {
        if (val.name == role) {
          hasRole = true;
        }
      });
      return hasRole;
    };

    Auth.ilRoles = function () {
      return auth.user.roles.filter(function (role) {
        return role.role_application.application_code == APP_ID;
      });
    };

    Auth.setUserEventPermissions = function (activePositions, event) {
      if (Auth.hasRole(APP_ROLES.ADMIN)) {
        event.userCanEdit = true;
        return;
      }
      if (Auth.hasRole(APP_ROLES.ORGANIZER)) {
        angular.forEach(activePositions, function (position) {
          if (typeof position.event !== 'undefined' && position.event.id == event.id) {
            event.userCanEdit = true;
          }
        });
      }
      if (Auth.hasRole(APP_ROLES.WS_SECTOR_MANAGER)) {
        angular.forEach(activePositions, function (position) {
          if (typeof position.sector !== 'undefined' && position.sector.event.id == event.id) {
            event.userCanEdit = true;
          }
        });
      }
    };

    Auth.setUserSkillPermissions = function (activePositions, skill) {
      auth.hasUserRole(APP_ID, ['Admin', 'View'], skill.entity_id).then(function (hasUserRole) {
          skill.userCanView = hasUserRole;
      });
      if (Auth.hasRole(APP_ROLES.ADMIN)) {
        skill.userCanEdit = true;
        return;
      }
      if (Auth.hasRole(APP_ROLES.ORGANIZER)) {
        angular.forEach(activePositions, function (position) {
          if (typeof position.event !== 'undefined' && position.event.id == skill.event.id) {
            skill.userCanEdit = true;
          }
        });
      }
      if (Auth.hasRole(APP_ROLES.WS_SECTOR_MANAGER)) {
        angular.forEach(activePositions, function (position) {
          if (typeof position.sector !== 'undefined' && position.sector.id == skill.sector.id) {
            skill.userCanEdit = true;
          }
        });
      }
      if (Auth.hasRole(APP_ROLES.WS_MANAGER)) {
        angular.forEach(activePositions, function (position) {
          if (typeof position.skill !== 'undefined' && position.skill.id == skill.id) {
            skill.userCanEdit = true;
          }
        });
      }
    };

    Auth.getAuthUser = function (pid) {
      var User = {};
      var deferred = $q.defer();

      $http.get(API_AUTH + "/users/person/" + pid)
        .then(function (result) {
            deferred.resolve(result.data);
          },
          function (error) {
            deferred.reject("Could not fetch Auth User: " + error);
          });

      return deferred.promise;
    };

    return Auth;
  });
