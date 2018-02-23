'use strict';

/**
 * @ngdoc service
 * @name ilApp.RecommendedItem
 * @description
 * # RecommendedItem
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('RecommendedItem', function ($q, $http, API_IL) {

    var RecommendedItems = { $data : $q.defer(), total: null };

    RecommendedItems.updateItem = function(item, eventId, _extended){

      var deferred = $q.defer();

      $http.put(API_IL + "/recommended_items/" + eventId + "/requested_item/" + item.id, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not save recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.addItem = function(item, eventId, _extended){

      var deferred = $q.defer();

      $http.put(API_IL + "/recommended_items/" + eventId, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not save recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };
  });
