'use strict';

/**
 * @ngdoc directive
 * @name ilApp.directive:SkillStatusSelector
 * @description
 * # SkillStatusSelector
 */
angular.module('ilApp')
.directive('skillStatusSelector', function($state) {
  return {
    restrict: 'E',
    templateUrl: 'views/skill-status-selector.html',
    scope: {
      link: "@link",
      event: "=event",
      skills: "=skills"
    },
    link: function($scope, element, attrs) {
      $scope.getLink = function(skill){
        //return $scope.link;
        return $state.href($scope.link, {eventId: $scope.event, skillId: skill.id});
      };

      $scope.totalCount = function(summaries){
        var c = 0;

        angular.forEach(summaries, function(val){
          c += val.count;
        });

        return c;
      };
    }
  };
});
