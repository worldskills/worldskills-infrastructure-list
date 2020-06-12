'use strict';

angular.module('ilApp')
  .service('Auth', function Person(API_AUTH, auth, APP_ROLES, APP_ID, $http, $q) {

    var Auth = {};

    Auth.setUserEventPermissions = function (event) {
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_SUPPLIED_ITEMS], event.entity_id).then(function (hasUserRole) {
        event.userCanEdit = hasUserRole;
      });
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.CREATE_SUPPLIED_ITEMS], event.entity_id).then(function (hasUserRole) {
        event.userCanCreate = hasUserRole;
      });
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_REQUESTED_ITEMS], event.entity_id).then(function (hasUserRole) {
        event.userCanEditAllRequestedItems = hasUserRole;
      });
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_CONFIG], event.entity_id).then(function (hasUserRole) {
        event.userCanEditConfig = hasUserRole;
      });
    };

    Auth.setUserListPermissions = function (list) {
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.VIEW], list.entity_id).then(function (hasUserRole) {
          list.userCanView = hasUserRole;
      });
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_REQUESTED_ITEMS], list.entity_id).then(function (hasUserRole) {
          list.userCanEdit = hasUserRole;
      });
    };

    Auth.setUserSkillPermissions = function (skill) {
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.VIEW], skill.entity_id).then(function (hasUserRole) {
          skill.userCanView = hasUserRole;
      });
      auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_REQUESTED_ITEMS], skill.entity_id).then(function (hasUserRole) {
          skill.userCanEdit = hasUserRole;
      });
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
