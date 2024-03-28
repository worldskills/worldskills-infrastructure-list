'use strict';

angular.module('ilApp').controller('EventRevisionsCtrl', function ($scope, $stateParams, $sce, Revision, htmldiff) {

  var limit = 100;
  var offset = 0;

  $scope.revisions = [];
  $scope.loading = false;

  $scope.loadNextRevisions = function () {

    $scope.loading = true;

    Revision.getRevisionsForEvent($stateParams.eventId, limit, offset).then(function (revisions) {
      $scope.loading = false;
      $scope.revisions = $scope.revisions.concat(revisions);
    });

    offset += limit;
  };

  $scope.loadNextRevisions();

  $scope.revisionDiff = function (a, b) {
    return $sce.trustAsHtml(htmldiff(a || '', b || ''));
  };

});
