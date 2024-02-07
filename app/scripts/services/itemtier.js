'use strict';

angular.module('ilApp')
  .service('ItemTier', function ($q, $http, $resource, API_IL) {

    var ItemTier = $resource(API_IL + '/events/:eventId/tiers/:id', {
      id: '@id'
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

    ItemTier.getTiersForEvent = function(eventId){
      var deferred= $q.defer();

      $http.get(API_IL + '/events/' + eventId + '/tiers').then(function(result){
        deferred.resolve(result.data.tiers);
      },
      function(error){
        deferred.reject('Could not fetch tiers for event: ' + error.data.user_msg);
      });

      return deferred.promise;
    };

    return ItemTier;
  });
