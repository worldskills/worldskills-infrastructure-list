'use strict';

/**
 * @ngdoc service
 * @name ilApp.RecommendedItem
 * @description
 * # RecommendedItem
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('RecommendedItems', function ($q, $http, API_IL) {

    var RecommendedItems = { $data : $q.defer(), total: null };

    RecommendedItems.suggestOnItem = function(item, eventId, skillId){

      var deferred = $q.defer();

      $http.post(API_IL + "/recommended-items/event/" + eventId + "/skill/" + skillId + "/requested-item/" + item.requestedItemId, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not update recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.suggestNew = function(item, eventId, skillId){

      var deferred = $q.defer();

      $http.post(API_IL + "/recommended-items/event/" + eventId + "/skill/" + skillId, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not save recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    return RecommendedItems;

  });