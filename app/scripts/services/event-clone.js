'use strict';

angular.module('ilApp').factory('EventClone', function ($q, $http, API_IL) {

  var EventClone = {};

  EventClone.clone = function (eventId, targetEventId, listIds) {
    var deferred= $q.defer();

    $http.post(API_IL + '/events/' + eventId + '/clone', {}, {params: {target_event_id: targetEventId, list_id: listIds}}).then(function (result) {
      deferred.resolve(result.data);
    },
    function(error){
      deferred.reject('Could not clone event: ' + error.data.user_msg);
    });

    return deferred.promise;
  };

  return EventClone;
});
