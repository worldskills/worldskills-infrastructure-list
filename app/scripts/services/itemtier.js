'use strict';

angular.module('ilApp')
  .service('ItemTier', function ($q, $http, API_IL) {

    var ItemTier = {};

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
