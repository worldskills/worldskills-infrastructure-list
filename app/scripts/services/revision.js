'use strict';

/**
 * @ngdoc service
 * @name ilApp.Revision
 * @description
 * # Revision
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Revision', function ($q, $http, API_IL) {

    var Revision = {};

    Revision.getRevisionsForEvent = function(eventId){
      var deferred= $q.defer();

      $http.get(API_IL + '/events/' + eventId + '/revisions').then(function(result){
        deferred.resolve(result.data.revisions);
      },
      function(error){
        deferred.reject('Could not fetch revisions for event: ' + error.data.user_msg);
      });

      return deferred.promise;
    };

    return Revision;
  });
