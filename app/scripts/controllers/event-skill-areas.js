(function() {
  'use strict';

  angular.module('ilApp').controller('EventSkillAreasCtrl', function ($scope, $q, $translate, $state, $stateParams, Events, SkillArea, WSAlert, SkillParticipantsOverride) {

    $scope.create = function () {
      var name = prompt('Skill Area Name:');
      if (name !== null) {
        SkillArea.save({eventId: $stateParams.eventId}, {name: name}, function (area) {
          WSAlert.success('The Skill Area has been added.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
    };

    $scope.edit = function (area) {
      var name = prompt('Skill Area Name:', area.name);
      if (name !== null) {
        SkillArea.update({eventId: $stateParams.eventId, id: area.id}, {name: name}, function (area) {
          WSAlert.success('The Skill Area has been updated.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
    };

    $scope.delete = function (area) {
      if (confirm('Delete Skill Area?')) {
         SkillArea.delete({eventId: $stateParams.eventId, id: area.id}, function () {
             WSAlert.success('The Skill Area has been deleted.');
             $state.go('.', {}, {reload: true});
         }, function (httpResponse) {
             window.alert('An error has occured: ' + JSON.stringify(httpResponse.data));
         });
      }
    };

  });

})();
