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

    var RecommendedItems = { };

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
      console.log(item);
      $http.post(API_IL + "/recommended-items/event/" + eventId + "/skill/" + skillId, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not save recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.suggestDeletion = function(item, eventId, skillId) {

      var deferred = $q.defer();

      $http.post(API_IL + "/recommended-items/event/" + eventId + "/skill/" + skillId + "/requested-item/" + item.requestedItemId + "/suggest-delete", item).then(function(result) {
        deferred.resolve(result.data);
      },
      function(error) {
        deferred.reject("Could not suggest delete for item : " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.getRecommendations = function(eventId) {

      var deferred = $q.defer();

      $http.get(API_IL + "/recommended-items/event/" + eventId + "/recommendations").then(function(result) {
        deferred.resolve(result.data);
      },
      function(error) {
        deferred.reject("Could not get recommendations : " + error.data.user_msg);
      });

      return deferred.promise;
    }

    RecommendedItems.acceptRecommendation = function(item, eventId) {
      var deferred = $q.defer();
      $http.get(API_IL + "/recommended-items/event/" + eventId + "/accept/" + item.id).then(function(result) {
        deferred.resolve(result.data);
      },
      function(error) {
        deferred.reject("Could not accept recommendation : " + error.data.user_msg);
      });

      return deferred.promise;
    }

    RecommendedItems.rejectRecommendation = function(item, eventId) {
      var deferred = $q.defer();
      $http.post(API_IL + "/recommended-items/event/" + eventId + "/reject/" + item.id, item).then(function(result) {
        deferred.resolve(result.data);
      },
      function(error) {
        deferred.reject("Could not reject recommendation : " + error.data.user_msg);
      });

      return deferred.promise;
    }

    return RecommendedItems;

  });
