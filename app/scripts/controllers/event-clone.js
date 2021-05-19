'use strict';

angular.module('ilApp').controller('EventCloneCtrl', function ($scope, $state, WSAlert, Events, Status, ItemTier, Category, ItemCategory, EventClone) {

  $scope.loading = true;
  $scope.events = [];
  $scope.statuses = [];
  $scope.tiers = [];
  $scope.skillAreas = [];
  $scope.lists = [];
  $scope.listCategories = [];
  $scope.itemCategories = [];
  $scope.allChecked = true;
  $scope.copying = false;

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

  ItemTier.getTiersForEvent(eventId).then(function (result) {
    $scope.tiers = result;
  });

  Events.getSkillAreas(eventId).then(function (result) {
    $scope.skillAreas = result;
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
      list.disabled = false;
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

    Events.getSkillAreas(targetEventId).then(function (result) {
      $scope.targetSkillAreas = result;
    });

    Category.getAll(targetEventId).then(function (result) {
      $scope.targetListCategories = result;
    });

    ItemCategory.getAll(targetEventId).then(function (result) {
      $scope.targetItemCategories = result.categories;
    });

    Events.getListsForEvent(targetEventId).then(function (result) {
      $scope.targetLists = result;
      // reset target lists
      angular.forEach($scope.targetLists, function (targetList) {
        targetList.matched = false;
      });
      // loop and match lists
      angular.forEach($scope.lists, function (list) {
        // reset
        list.checked = true;
        list.disabled = false;
        list.targetList = null;
        // match lists
        angular.forEach($scope.targetLists, function (targetList) {
          // by skill
          if (list.skill) {
            if (targetList.skill && !list.targetList && targetList.skill.base_id == list.skill.base_id) {
              list.targetList = targetList;
              targetList.matched = true;
            }
          } else {
            // by name
            if (!targetList.skill && !list.targetList && targetList.name.text == list.name.text) {
              list.targetList = targetList;
              targetList.matched = true;
            }
          }
        });
        if (list.skill && !list.targetList) {
          list.checked = false;
          list.disabled = true;
        }
      });
    });

  };

  $scope.toggleAll = function () {
    angular.forEach($scope.lists, function(list){
      list.checked = $scope.allChecked;
    });
  };

  $scope.totalCount = function(summaries){
    var c = 0;

    angular.forEach(summaries, function(val){
      c += val.count;
    });

    return c;
  };

  $scope.clone = function () {

    $scope.copying = true;

    var listIds = $scope.lists.filter(function (list) { return list.checked; }).map(function (list) { return list.id; });

    EventClone.clone(eventId, $scope.targetEvent.id, listIds).then(function (result) {
      WSAlert.success('Lists have been copied.');
      $state.go('event', {eventId: $scope.targetEvent.id});
    }, function (error) {
      alert('Error while copying: ' + error);
      $scope.copying = false;
    });

  };

});
