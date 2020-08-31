'use strict';

angular.module('ilApp')
  .service('RecommendedSubscription', function ($q, $http, API_IL) {

    var RecommendedSubscription = { };

    RecommendedSubscription.getSubscription = function(eventId, listId, personId) {
      var deferred= $q.defer();

      $http.get(API_IL + '/recommended-items/event/' + eventId + '/lists/' + listId + '/subscription/' + personId).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject('Could not fetch subscription: ' + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedSubscription.updateSubscription = function(eventId, listId, personId, subscription) {
      var deferred= $q.defer();

      $http.put(API_IL + '/recommended-items/event/' + eventId + '/lists/' + listId + '/subscription/' + personId, subscription).then(function(res){
        deferred.resolve(res.data);
      },
      function(error){
        deferred.reject("Could not update subscription: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    return RecommendedSubscription;

  });
