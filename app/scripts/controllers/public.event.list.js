'use strict';

angular.module('ilApp').controller('PublicItemsEventListCtrl', function ($scope, $state, $q, Events, Items, WSAlert, Auth, APP_ROLES, $translate, auth) {


  $scope.loading = true;
  $scope.error = false;
  $scope.events = {};


  $scope.init = function(){

    Events.getViewEvents(auth.user.person_id).then(function(e){
      $scope.events = e.events;      
      $scope.loading = false;
    }, function(error){
      WSAlert.danger($translate.instant('WSALERT.DANGER.NO_ACCESSS_PUBLIC_VIEW'));
    });

  };



  $q.when(auth.user.$promise).then(function(r){
    $scope.init();
  });


});