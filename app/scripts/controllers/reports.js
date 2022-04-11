'use strict';

angular.module('ilApp').controller('ReportsStatusCtrl', function ($scope, $stateParams, Events, Status) {

  var eventId = $stateParams.eventId;

  $scope.statusesIndexed = {};

  Events.getListsForEvent(eventId).then(function (result) {
    $scope.lists = result;
    angular.forEach($scope.lists, function (list) {
        list.status_summary.total = 0;
        angular.forEach(list.status_summary.summaries, function (summary) {
            list.status_summary.total += summary.count;
        });
    });
  })

  Status.getAllStatuses(eventId).then(function (result) {
    $scope.statuses = result;
    angular.forEach($scope.statuses, function (status) {
        $scope.statusesIndexed[status.id] = status;
    });
  });

});
