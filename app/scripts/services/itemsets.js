'use strict';

/**
 * @ngdoc service
 * @name ilApp.ItemSets
 * @description
 * # ItemSets
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('ItemSets', function ($http, $q, API_IL, MULTIPLIERS) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var ItemSets = { event: false, list : false };

    ItemSets.init = function(eventId){
      var deferred = $q.defer();

      $http.get(API_IL + "/sets/event/" + eventId).then(function(result){
        ItemSets.event = eventId;
        ItemSets.list = result.data.sets;
        deferred.resolve(ItemSets.list);
      },
      function(error){
        ItemSets.event = false; ItemSets.list = false;
        deferred.reject("Could not refresh sets: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    ItemSets.load = function(setId){
      var deferred = $q.defer();

      $http.get(API_IL + "/sets/set/" + setId).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not load set: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    ItemSets.removeFromSet = function(setId, setItemId){
      var deferred = $q.defer();

      if(setItemId === 'undefined' || setItemId < 1)
        deferred.reject("Error: Item id not set");

        $http.delete(API_IL + "/sets/set/" + setId + "/items/" + setItemId).then(function(res){
          deferred.resolve(res);
        },
        function(error){
          deferred.reject("Could not remove item from set: " + error.data.user_msg);
        });

        return deferred.promise;
    };

    ItemSets.saveDetails = function(set){
      var deferred = $q.defer();

      if(typeof set.id === 'undefined')
        deferred.reject("Error: set id not set");

      $http.put(API_IL + "/sets/set/" + set.id, set).then(function(res){
        deferred.resolve(res);
      },
      function(error){
        deferred.reject("Could not save set details: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    ItemSets.addToSet = function(setId, item){
      var deferred = $q.defer();

      if(typeof setId === 'undefined') deferred.reject("Error: set id missing");

      var postItem = {
          "item": {
            "id": item.originalObject.id
          }
      };



      $http.post(API_IL + "/sets/set/" + setId + "/items", postItem).then(function(res){
        deferred.resolve(res);
      },
      function(error){
        deferred.reject("Could not add item to the set: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    ItemSets.removeSet = function(setId){
      var deferred = $q.defer();

      if(typeof setId === 'undefined') deferred.reject("Error: set id missing");

      $http.delete(API_IL + "/sets/set/" + setId).then(function(res){
        deferred.resolve(res);
      },
      function(error){
        deferred.reject("Could not remove set: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    ItemSets.addSet = function(set, eventId){
      var deferred = $q.defer();

      $http.post(API_IL + "/sets/event/" + eventId, set).then(function(res){
        deferred.resolve(res);
      },
      function(error){
        deferred.reject("Could not create new set: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    ItemSets.updateQuantities = function(set){
      var deferred = $q.defer();

      $http.put(API_IL + "/sets/set/" + set.id + "/items", set).then(function(res){
        deferred.resolve(res);
      },
      function(error){
        deferred.reject("Could not update quantities: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    return ItemSets;
  });
