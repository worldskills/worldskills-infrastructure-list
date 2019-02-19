'use strict';

angular.module('ilApp').controller('EventRevisionsCtrl', function ($scope, $stateParams, Revision) {

  Revision.getRevisionsForEvent($stateParams.eventId).then(function (revisions) {
    $scope.revisions = revisions;
  });

});
