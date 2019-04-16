'use strict';

angular.module('ilApp').controller('TierReportCtrl', function ($scope, $stateParams, TierReport) {

  $scope.statusesIndexed = {};
  $scope.totalsIndexed = {};
  $scope.total = 0;

  TierReport.getTierReportForEvent($stateParams.eventId).then(function (report) {
    $scope.report = report;
    angular.forEach($scope.report.statuses, function (status) {
        $scope.statusesIndexed[status.id] = status;
    });
    angular.forEach($scope.report.totals, function (total) {
        var key = total.list_id + '_' + total.tier_id;
        if (typeof $scope.totalsIndexed[key] === 'undefined') {
            $scope.totalsIndexed[key] = 0;
        }
        $scope.totalsIndexed[key] += total.total;
    });
  });

});
