(function() {
    'use strict';

    angular.module('ilApp').service('SkillNumbers', function ($resource, API_IL) {
        return $resource(API_IL + '/events/skill/:skillId/numbers', {
        }, {
          update: {
              method: 'PUT'
          }
        });
    });

})();
