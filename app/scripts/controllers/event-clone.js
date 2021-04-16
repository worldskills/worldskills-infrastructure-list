'use strict';

angular.module('ilApp').controller('EventCloneCtrl', function ($scope, $state, WSAlert, Events, Status) {

  $scope.loading = true;
  $scope.events = [];
  $scope.statuses = [];

  Events.getEventsWithILs().then(function(e){
    $scope.events = e.events;
    $scope.loading = false;
  }, function(error){
    WSAlert.danger($translate.instant('Unable to load events'));
  });

  Status.getAllStatuses($state.params.eventId).then(function (result) {
    $scope.statuses = result;
  });

  $scope.changeEvent = function () {

    Status.getAllStatuses($scope.targetEvent.id).then(function (result) {
      $scope.targetStatuses = result;
    });
  };

});
