(function() {
    'use strict';

    angular.module('ilApp').service('SkillParticipantsOverride', function ($resource, API_IL) {
        return $resource(API_IL + '/events/skill/:skillId/participants-override', {
        }, {
          update: {
              method: 'PUT'
          }
        });
    });

})();
