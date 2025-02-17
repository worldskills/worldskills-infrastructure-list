(function() {
    'use strict';

    angular.module('ilApp').service('List', function ($resource, API_IL) {
        return $resource(API_IL + '/lists/:id', {
            id: '@id'
        }, {
            save: {
                method: 'POST',
                url: API_IL + '/events/:eventId/lists',
            },
            update: {
                method: 'PUT'
            }
        });
    });

})();
