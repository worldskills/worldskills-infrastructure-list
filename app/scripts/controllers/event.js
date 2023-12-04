'use strict';

angular.module('ilApp').controller('EventCtrl', function ($scope, $state, $stateParams, $q, Events, Status, List, Reporting, Auth, auth, WSAlert, APP_ROLES, APP_ID, $translate) {

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
    promises.push(Events.getListsForEvent(eventId));

    $q.all(promises).then(function(res){
      $scope.event = res[0];
      $scope.skills = res[1];
      $scope.lists = res[2];
      auth.hasUserRole(APP_ID, ['Admin', 'ExportSuppliedItems'], $scope.event.entity_id).then(function (hasUserRole) {
          $scope.userCanExportSuppliedItems = hasUserRole;
      });
      auth.hasUserRole(APP_ID, ['Admin', 'EditConfig'], $scope.event.entity_id).then(function (hasUserRole) {
          $scope.userCanEditConfig = hasUserRole;
      });
      auth.hasUserRole(APP_ID, ['Admin', 'EditConfig'], $scope.event.entity_id).then(function (hasUserRole) {
          $scope.userCanEditConfig = hasUserRole;
      });
      auth.hasUserRole(APP_ID, ['Admin'], $scope.event.entity_id).then(function (hasUserRole) {
          $scope.userCanSeeHistory = hasUserRole;
      });
      Auth.setUserEventPermissions($scope.event);
      angular.forEach($scope.lists, function (list) {
        Auth.setUserListPermissions(list);
      });
      $scope.loading.lists = false;
    }, function(errors){
      WSAlert.danger($translate.instant('wsalert.danger.no_accesss_public_view'));
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
  };

  $scope.createList = function() {
    var name = window.prompt('Name for new list?');
    if (name !== null) {
      List.save({eventId: $scope.event.id}, {name: {text: name, lang_code: $scope.selectedLanguage}, entity_id: $scope.event.entity_id}, function (list) {
        WSAlert.success('The list has been successfully created.');
        $state.go('eventBase.list.overview', {eventId: $scope.eventId, listId: list.id});
      }, function (error) {
        WSAlert.danger(error.data.user_msg);
      });
    }
  };

  $scope.totalCount = function(summaries){
    var c = 0;

    angular.forEach(summaries, function(val){
      c += val.count;
    });

    return c;
  };

  $scope.init();


});
