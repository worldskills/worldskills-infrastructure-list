'use strict';

angular.module('ilApp').controller('EventCloneCtrl', function ($scope, $state, WSAlert, Events, Status, ItemTier, Category, ItemCategory, EventClone) {

  $scope.loading = true;
  $scope.events = [];
  $scope.statuses = [];
  $scope.tiers = [];
  $scope.lists = [];
  $scope.listCategories = [];
  $scope.itemCategories = [];
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

  ItemTier.getTiersForEvent(eventId).then(function (tiers) {
    $scope.tiers = tiers;
  });

  Category.getAll(eventId).then(function (result) {
    $scope.listCategories = result;
  });

  ItemCategory.getAll(eventId).then(function (result) {
    $scope.itemCategories = result.categories;
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

    ItemTier.getTiersForEvent(targetEventId).then(function (tiers) {
      $scope.targetTiers = tiers;
    });

    Category.getAll(targetEventId).then(function (result) {
      $scope.targetListCategories = result;
    });

    ItemCategory.getAll(targetEventId).then(function (result) {
      $scope.targetItemCategories = result.categories;
    });

    Events.getListsForEvent(targetEventId).then(function (result) {
      $scope.targetLists = result;
    });

  };

  $scope.toggleAll = function () {
    angular.forEach($scope.lists, function(list){
      list.checked = $scope.allChecked;
    });
  };

  $scope.clone = function () {

    var listIds = $scope.lists.filter(list => list.checked).map(list => list.id);

    EventClone.clone(eventId, $scope.targetEvent.id, listIds).then(function (result) {
      console.log(result);
    });

  };

});
