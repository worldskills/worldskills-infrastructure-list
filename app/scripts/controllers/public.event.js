'use strict';

angular.module('ilApp').controller('PublicItemsEventCtrl', function ($scope, $state, $q, Events, Items, WSAlert, Auth, APP_ROLES, $translate, auth) {

  $scope.eventId = $state.params.eventId;
  $scope.skillId = $state.params.skillId;

  $scope.loading = true;
  $scope.error = false;
  $scope.skills = {};
  $scope.event = {};


  $scope.init = function(){
    var eventId = $state.params.eventId;
    var promises = [];

    promises.push(Events.getEvent(eventId));
    promises.push(Events.getSkillsForEvent(eventId, true));

    $q.all(promises).then(function(res){
      $scope.event = res[0];
      $scope.skills = res[1];
      $scope.loading = false;
    }, function(errors){
      WSAlert.danger($translate.instant('WSALERT.DANGER.NO_ACCESSS_PUBLIC_VIEW'));
      $scope.loading = false;
    });


  };



  $scope.init();


});
