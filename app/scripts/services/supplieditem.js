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
    
    function transformDateFields(data) {
      if (!data) return data;
      if (data.delivery !== undefined && data.delivery !== null && !(data.delivery instanceof Date)) {
        data.delivery = new Date(data.delivery);
      }
      if (data.supplied_items && Array.isArray(data.supplied_items)) {
        data.supplied_items.forEach(function(item) {
          transformDateFields(item);
        });
      }
      return data;
    }

    return {

      transformDateFields: transformDateFields,

      saveItem: function(item){
        var deferred = $q.defer();

        $http.put(API_IL + "/items/" + item.event.id + "/supplied_items/" + item.id, item).then(function(res){
          deferred.resolve(transformDateFields(res.data));
        },
        function(error){
          deferred.reject("Could not save item: " + error.data.user_msg);
        });

        return deferred.promise;
      },

      createItem: function(item, eventId){
        var deferred = $q.defer();

        $http.post(API_IL + "/items/" + eventId + "/supplied_items/", item).then(function(res){
            deferred.resolve(transformDateFields(res.data));
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

      removeFile: function(item, file){
        var deferred = $q.defer();

        $http.delete(API_IL + "/items/" + item.event.id + "/supplied_items/" + item.id + "/files/" + file.file.id, item).then(function(res){
            deferred.resolve(res.data);
          },
          function(error){
            deferred.reject(error.data.user_msg);
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

      getItems: function (eventId, search, itemCategoryId) {
        var deferred = $q.defer();

        $http.get(API_IL + '/items/' + eventId + '/supplied_items', {params: {search: search, item_category: itemCategoryId, limit: 1000}}).then(function (res) {
          deferred.resolve(transformDateFields(res.data));
        }, function (error) {
          deferred.reject('Could not get items: ' + error.data.user_msg);
        });

        return deferred.promise;
      },

      getItem: function(item){
        var deferred = $q.defer();

        $http.get(API_IL + "/items/" + item.event.id + "/supplied_items/" + item.id).then(function(res){
            deferred.resolve(transformDateFields(res.data));
          },
          function(error){
            deferred.reject("Could not get Product: " + error.data.user_msg);
          });

        return deferred.promise;
      },

      getItemForRecommendation: function(itemId, eventId){
        var deferred = $q.defer();

        $http.get(API_IL + "/items/" + eventId + "/supplied_items/" + itemId + "/recommendation").then(function(res){
            deferred.resolve(transformDateFields(res.data));
          },
          function(error){
            deferred.reject("Could not get Product: " + error.data.user_msg);
          });

        return deferred.promise;
      },

      cloneItem: function(item, eventId, _update){
        var deferred = $q.defer();
        var update = _update || false;

        $http.post(API_IL + '/items/' + eventId + '/supplied_items/' + item.id + '/clone?update=' + update, item).then(function(res){
            deferred.resolve(transformDateFields(res.data));
        }, function(error){
            deferred.reject("Could not clone item: " + error.data.user_msg);
        });

        return deferred.promise;
      },

      combineItems: function(items, masterItem){
        var deferred = $q.defer();

        var combineStr = "?forceRequestedUpdate=0";

        angular.forEach(items, function(val){
          if(val.id != masterItem.id)
            combineStr += "&itemId=" + val.id;
        });

        $http.post(API_IL + "/items/" + masterItem.event.id + "/supplied_items/" + masterItem.id + "/combine" + combineStr, {}).then(function(res){
            deferred.resolve(transformDateFields(res.data));
          },
          function(error){
            deferred.reject("Could not combine items: " + error.data.user_msg);
          });

        return deferred.promise;
      }
    };
  });
