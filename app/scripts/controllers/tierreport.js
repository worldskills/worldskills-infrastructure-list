'use strict';

angular.module('ilApp').controller('TierReportCtrl', function ($scope, $state, $stateParams, $translate, WSAlert, auth, APP_ID, APP_ROLES, TierReport, Events, ItemTier) {

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

  Events.getEvent($stateParams.eventId).then( function (event) {
    $scope.event = event;

    auth.hasUserRole(APP_ID, [APP_ROLES.ADMIN, APP_ROLES.EDIT_CONFIG], $scope.event.entity_id).then(function (hasUserRole) {
      $scope.userCanEditConfig = hasUserRole;
    });
  });

  $scope.createTier = function () {
    var name = prompt('Tier Name:');
    if (name !== null) {
      var tier = {name: {lang_code: $translate.use(), text: name}};
      ItemTier.save({eventId: $stateParams.eventId}, tier, function (category) {
        WSAlert.success('Tier has been added.');
        $state.go('.', {}, {reload: true});
      }, function (error) {
        WSAlert.danger(error.data.user_msg);
      });
    }
  };

  $scope.editTier = function (tier) {
    var name = prompt('Tier Name:', tier.name.text);
      if (name !== null) {
        tier.name.text = name;
        tier.name.lang_code = $translate.use();
        ItemTier.update({eventId: $stateParams.eventId}, tier, function (tier) {
          WSAlert.success('Tier has been updated.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
  };

});
