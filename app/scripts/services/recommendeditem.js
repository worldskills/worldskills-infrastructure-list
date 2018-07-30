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

    RecommendedItems.updateRecommendation = function(recommendedItem, eventId, _suppliedItemChanged){

      var deferred = $q.defer();
      var suppliedItemChanged = _suppliedItemChanged || false;

      $http.put(API_IL + "/recommended-items/event/" + eventId + "/skill/" + recommendedItem.skill.id + "/requested-item/" + recommendedItem.id + "?suppliedItemChanged=" + suppliedItemChanged, recommendedItem).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not update recommendation: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.suggestOnItem = function(item, eventId, skillId, _suppliedItemChanged){

      var deferred = $q.defer();
      var suppliedItemChanged = _suppliedItemChanged || false;

      $http.post(API_IL + "/recommended-items/event/" + eventId + "/skill/" + skillId + "/requested-item/" + item.requestedItemId + "?suppliedItemChanged=" + suppliedItemChanged, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not update recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.suggestNew = function(item, eventId, skillId, _suppliedItemChanged){

      var deferred = $q.defer();
      var suppliedItemChanged = _suppliedItemChanged || false;


      $http.post(API_IL + "/recommended-items/event/" + eventId + "/skill/" + skillId + "?suppliedItemChanged=" + suppliedItemChanged, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not save recommended item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    RecommendedItems.suggestDeletion = function(item, eventId, skillId) {
      //fixed duplicated code
      return this.suggestOnItem(item, eventId, skillId);
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

    RecommendedItems.acceptRecommendation = function(item, eventId, _split) {
      var split = _split || false;
      var deferred = $q.defer();
      $http.post(API_IL + "/recommended-items/event/" + eventId + "/accept/" + item.id + "?split=" + split).then(function(result) {
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
