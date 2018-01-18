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

    var ItemCategory = { id: false, data: $q.defer(), itemCategories: {}, itemSubCategories: {}};

    ItemCategory.init = function(){
        if(typeof ItemCategory.data.promise == 'undefined') {
          ItemCategory.data = $q.defer();
        }

        $http.get(API_IL + "/item-category")
          .then(function(result){
            ItemCategory.data.resolve(result.data.connect_events);
            ItemCategory.data = result.data.connect_events;
          })
          .catch(function(error){
            ItemCategory.data.reject($translate.instant("COULD_NOT_FETCH_ITEM_CATEGORIES"));
          })
        ;

        return ItemCategory.data.promise;
    };

    ItemCategory.createItem = function(item, eventId){
      var deferred = $q.defer();

      $http.post(API_IL + "/event/" + eventId + "/item-category/", item)
        .then(function(res){
          deferred.resolve(res.data);
        })
        .catch(function(error){
          deferred.reject("Could not save item: " + error.data.user_msg);
        });

      return deferred.promise;
    },

    ItemCategory.saveItem = function(item, eventId){
      var deferred = $q.defer();

      $http.put(API_IL + "/item-category/" + item.id, item).then(function(res){
        deferred.resolve(res.data);
      },
      function(error){
        deferred.reject("Could not save item: " + error.data.user_msg);
      });

      return deferred.promise;
    },

    ItemCategory.getAll = function(eventId, level){
      var deferred = $q.defer();

      var url = API_IL + "/event/" + eventId + "/item-category";

      if(typeof level !== 'undefined'){
        url += "?level="+level;
      }

      $http.get(url)
        .then(function(result){
          deferred.resolve(result.data);
        })
        .catch(function(error){
          deferred.reject($translate.instant("COULD_NOT_FETCH_ITEM_CATEGORIES"));
        })
      ;

      return deferred.promise;
    };

    ItemCategory.getAllCategory = function(eventId){
      return ItemCategory.getAll(eventId, 2);
    };


    ItemCategory.getAllSubCategory = function(eventId){
      return ItemCategory.getAll(eventId, 1);
    };

    ItemCategory.removeItemCategory = function(item){
      var deferred = $q.defer();

      $http.delete(API_IL + "/item-category/" + item.id, item)
        .then(function(res){
          deferred.resolve(res.data);
        })
        .catch(function(error){
          var entityCode = item.parent == null ? 'CATEGORY' : 'SUB_CATEGORY';
          if(error.status === 304){
            deferred.reject($translate.instant("COULD_NOT_REMOVE_ITEM_"+entityCode+"_IN_USE"));
          } else {
            deferred.reject($translate.instant("COULD_NOT_REMOVE_ITEM_"+entityCode, {error: error.data.user_msg}));
          }
        })
      ;

      return deferred.promise;
    };

    return ItemCategory;
  });
