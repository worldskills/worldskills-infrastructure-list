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
      WSAlert.danger($translate.instant('WSALERT.DANGER.VIEW_PUBLIC_ITEMS_LIST'));
      $scope.loading = false;
    });


  };

  $scope.totalCount = function(summaries){
    var c = 0;

    angular.forEach(summaries, function(val){
      c += val.count;
    });

    return c;
  };

  $scope.init();


});
