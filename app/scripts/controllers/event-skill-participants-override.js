(function() {
  'use strict';

  angular.module('ilApp').controller('EventSkillParticipantsOverrideCtrl', function ($scope, $q, $translate, $state, $stateParams, Events, WSAlert, SkillParticipantsOverride) {

    $scope.loading.participants = true;

    $q.when($scope.appLoaded.promise).then(function(){

      var promises = [];

      angular.forEach($scope.skills, function (skill) {
        skill.numbers = SkillParticipantsOverride.get({skillId: skill.id});
        promises.push(skill.numbers.$promise);
      });

      $q.all(promises).then(function() {
        $scope.loading.participants = false;
      });

    });

    $scope.save = function () {

      $scope.loading.saveSkillParticipantsOverride = true;

      var promises = [];

      angular.forEach($scope.skills, function (skill) {
        promises.push(skill.numbers.$update({skillId: skill.id}));
      });

      $q.all(promises).then(function() {
        $scope.loading.saveSkillParticipantsOverride = false;
        WSAlert.success($translate.instant('Skill Numbers successfully saved.'));
        $state.go('event', {eventId: $stateParams.eventId});
      }, function (error) {
        $scope.loading.saveSkillParticipantsOverride = false;
        WSAlert.danger(error.data.user_msg);
      });

    };

  });

})();
