'use strict';

angular.module('ilApp').controller('EventCtrl', function ($scope, $state, $stateParams, $q, Events, Status, Reporting, WSAlert, $translate) {

  $scope.eventId = $state.params.eventId;
  $scope.skillId = $state.params.skillId;

  $scope.error = false;
  $scope.skills = {};
  $scope.event = {};
  
  $scope.loading.lists = true;
  $scope.loading.requested = false;
  $scope.loading.catalogue = false;

  $scope.loadingEvent = $q.defer();
  $scope.skillAreas = {};

  $scope.init = function(){
    var eventId = $state.params.eventId;
    var promises = [];

    promises.push(Events.getEvent(eventId));
    promises.push(Events.getSkillsForEvent(eventId, true));

    $q.all(promises).then(function(res){
      $scope.event = res[0];
      $scope.skills = res[1];
      $scope.loading.lists = false;
    }, function(errors){
      WSAlert.danger($translate.instant('WSALERT.DANGER.NO_ACCESSS_PUBLIC_VIEW'));
      $scope.loading.lists = false;
    });

    Status.getAllStatuses($state.params.eventId).then(function (result) {
      $scope.statuses = result;
    });

  };

  $scope.exportAllRequested = function(e){
    e.preventDefault();
    $scope.loading.requested = true;
    Reporting.exportRequestedForEvent($scope.eventId).then(function(){
      $scope.loading.requested = false;
    }, function(error){ WSAlert.danger(error); $scope.loading.requested = false; });
  };

  $scope.exportAllCatalogue = function(e){
    e.preventDefault();
    $scope.loading.catalogue = true;
    Reporting.exportCatalogueForEvent($scope.eventId).then(function(){
      $scope.loading.catalogue = false;
    }, function(error){ WSAlert.danger(error); $scope.loading.catalogue = false; });
  }

  $scope.totalCount = function(summaries){
    var c = 0;

    angular.forEach(summaries, function(val){
      c += val.count;
    });

    return c;
  };

  $scope.init();


});
