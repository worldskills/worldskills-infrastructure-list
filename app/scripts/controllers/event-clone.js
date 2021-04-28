'use strict';

angular.module('ilApp').controller('EventCloneCtrl', function ($scope, $state, WSAlert, Events, Status, Category) {

  $scope.loading = true;
  $scope.events = [];
  $scope.statuses = [];
  $scope.lists = [];
  $scope.allChecked = true;

  var eventId = $state.params.eventId;

  Events.getEventsWithILs().then(function(e){
    $scope.events = e.events;
    $scope.loading = false;
  }, function(error){
    WSAlert.danger($translate.instant('Unable to load events'));
  });

  Status.getAllStatuses(eventId).then(function (result) {
    $scope.statuses = result;
  });

  Category.getAll(eventId).then(function (result) {
    $scope.listCategories = result;
  });

  Events.getListsForEvent(eventId).then(function (result) {
    $scope.lists = result;
    angular.forEach($scope.lists, function(list){
      list.checked = true;
    });
  });

  $scope.changeEvent = function () {

    var targetEventId = $scope.targetEvent.id;

    Status.getAllStatuses(targetEventId).then(function (result) {
      $scope.targetStatuses = result;
    });

    Category.getAll(targetEventId).then(function (result) {
      $scope.targetListCategories = result;
    });

    Events.getListsForEvent(targetEventId).then(function (result) {
      $scope.targetLists = result;
    });

  };

});
