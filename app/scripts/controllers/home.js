'use strict';

angular.module('ilApp')
  .controller('HomeCtrl', function (
    $q, $scope, Auth, $state, $rootScope, APP_ROLES, $translate, Language, auth, WSAlert, Events, User
  ) {
    $scope.selectedLanguage = Language.selectedLanguage;

  });
