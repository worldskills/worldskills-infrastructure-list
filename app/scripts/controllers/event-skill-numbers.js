(function() {
  'use strict';

  angular.module('ilApp').controller('EventSkillNumbersCtrl', function ($scope, $q, $translate, $state, WSAlert, SkillNumbers) {
    
    $q.when($scope.appLoaded.promise).then(function(){

      angular.forEach($scope.skills, function (skill) {
        skill.numbers = SkillNumbers.get({skillId: skill.id});
      });

    });

    $scope.save = function () {

      $scope.loading.saveSkillNumbers = true;

      var promises = [];

      angular.forEach($scope.skills, function (skill) {
        promises.push(skill.numbers.$update({skillId: skill.id}));
      });

      $q.all(promises).then(function() {
        $scope.loading.saveSkillNumbers = false;
        WSAlert.success($translate.instant('Skill Numbers successfully saved.'));
        $state.go('event.overview', {eventId: $scope.selectedEvent.id});
      }, function (error) {
        $scope.loading.saveSkillNumbers = false;
        WSAlert.danger(error.data.user_msg);
      });

    };

  });

})();
