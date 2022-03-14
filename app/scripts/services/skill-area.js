(function() {
    'use strict';

    angular.module('ilApp').service('SkillArea', function ($resource, API_IL) {
        return $resource(API_IL + '/skill_areas/event/:eventId/:id', {
        }, {
            query: {
                method: 'GET'
            },
            save: {
                method: 'POST',
            },
            update: {
                method: 'PUT'
            },
            delete: {
                method: 'DELETE'
            }
        });
    });

})();
