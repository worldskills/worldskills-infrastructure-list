'use strict';

/**
 * @ngdoc service
 * @name ilApp.SuppliedItem
 * @description
 * # SuppliedItem
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('SuppliedItem', function ($q, $http, API_IL) {
    return {
      saveItem: function(item, updateRequested){
        var deferred = $q.defer();

        var forceUpdateRequested = (updateRequested === true) ? "?forceUpdateRequested=1" : "";

        $http.put(API_IL + "/items/" + item.event.id + "/supplied_items/" + item.id + forceUpdateRequested, item).then(function(res){
          deferred.resolve(res.data);
        },
        function(error){
          deferred.reject("Could not save item: " + error.data.user_msg);
        });

        return deferred.promise;
      },

      createItem: function(item, eventId){
        var deferred = $q.defer();

        $http.post(API_IL + "/items/" + eventId + "/supplied_items/", item).then(function(res){
            deferred.resolve(res.data);
          },
          function(error){
            deferred.reject("Could not save item: " + error.data.user_msg);
          });

        return deferred.promise;
      },

      removeItem: function(item){
        var deferred = $q.defer();

        $http.delete(API_IL + "/items/" + item.event.id + "/supplied_items/" + item.id, item).then(function(res){
            deferred.resolve(res.data);
          },
          function(error){
            deferred.reject("Could not remove item: " + error.data.user_msg);
          });

        return deferred.promise;
      },

      getLinkedItems: function(item){
        var deferred = $q.defer();

        $http.get(API_IL + "/items/" + item.event.id + "/supplied_items/" + item.id + "/linked").then(function(res){
          deferred.resolve(res.data);
        },
        function(error){
          deferred.reject("Could not get linked items: " + error.data.user_msg);
        });

        return deferred.promise;
      },

      combineItems: function(items, masterItem){
        var deferred = $q.defer();

        var combineStr = "?forceRequestedUpdate=1";

        angular.forEach(items, function(val){
          if(val.id != masterItem.id)
            combineStr += "&itemId=" + val.id;
        });

        $http.post(API_IL + "/items/" + masterItem.event.id + "/supplied_items/" + masterItem.id + "/combine" + combineStr, {}).then(function(res){
            deferred.resolve(res.data);
          },
          function(error){
            deferred.reject("Could not combine items: " + error.data.user_msg);
          });

        return deferred.promise;
      }
    };
  });
