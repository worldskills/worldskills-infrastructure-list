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
    };

    return User;
  });
