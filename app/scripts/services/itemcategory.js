'use strict';

/**
 * @ngdoc service
 * @name ilApp.ItemCategory
 * @description
 * # ItemCategory
 * Service in the ilApp.
 */
angular.module('ilApp')
  .factory('ItemCategory', function ($q, $http, API_IL, $translate) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var ItemCategory = {};

    ItemCategory.createItem = function(item, eventId){
      var deferred = $q.defer();

      $http.post(API_IL + "/event/" + eventId + "/item-categories/", item)
        .then(function(res){
          deferred.resolve(res.data);
        })
        .catch(function(error){
          deferred.reject("Could not save category: " + error.data.user_msg);
        });

      return deferred.promise;
    },

    ItemCategory.saveItem = function(item, eventId){
      var deferred = $q.defer();

      $http.put(API_IL + "/item-categories/" + item.id, item).then(function(res){
        deferred.resolve(res.data);
      },
      function(error){
        deferred.reject("Could not save category: " + error.data.user_msg);
      });

      return deferred.promise;
    },

    ItemCategory.getAll = function(eventId, level){
      var deferred = $q.defer();

      var url = API_IL + "/event/" + eventId + "/item-categories";

      if(typeof level !== 'undefined'){
        url += "?level="+level;
      }

      $http.get(url)
        .then(function(result){
          deferred.resolve(result.data);
        })
        .catch(function(error){
          deferred.reject($translate.instant("could_not_fetch_item_categories"));
        })
      ;

      return deferred.promise;
    };

    ItemCategory.getAllCategory = function(eventId){
      return ItemCategory.getAll(eventId, 2);
    };

    ItemCategory.removeItemCategory = function(item){
      var deferred = $q.defer();

      $http.delete(API_IL + "/item-categories/" + item.id, item)
        .then(function(res){
          deferred.resolve(res.data);
        })
        .catch(function(error){
          var entityCode = item.parent == null ? 'category' : 'sub_category';
          if(error.status === 304){
            deferred.reject($translate.instant("could_not_remove_item_"+entityCode+"_in_use"));
          } else {
            deferred.reject($translate.instant("could_not_remove_item_"+entityCode, {error: error.data.user_msg}));
          }
        })
      ;

      return deferred.promise;
    };

    return ItemCategory;
  });
