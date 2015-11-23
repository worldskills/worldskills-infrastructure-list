'use strict';

/**
 * @ngdoc service
 * @name ilApp.Items
 * @description
 * # Items
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Items', function ($q, $http, API_IL) {
   	
   	var Items = { categories : $q.defer(), $data : $q.defer() }

   	Items.getCategories = function(){

   		if(typeof Items.categories.promise == 'undefined') Items.categories = $q.defer();

   		$http.get(API_IL + "/categories").then(function(result){
   			Items.categories.resolve(result.data.categories);
   			Items.categories = result.data.categories;
   		},
   		function(error){
   			Items.categories.reject("Could not fetch categories: " + error.data.user_msg);
   		});

   		return Items.categories.promise;
   	};

   	Items.getItems = function(categoryId, skillId, eventId, limit, offset){
   		Items.data = $q.defer();
   		
   		$http.get(API_IL + "/events/" + eventId + "/skills/" + skillId + "/requested_items?category=" + categoryId + "&limit=" + limit + "&offset=" + offset).then(function(result){
   			Items.data.resolve(result.data.requested_items);
   			Items.data = result.data.requested_items;
   		},
   		function(error){
   			Items.data.reject("Could not get items: " + error.data.user_msg);   			
   		});

   		return Items.data.promise;
   	};

      Items.saveItem = function(item, eventId){
         var deferred = $q.defer();

         $http.put(API_IL + "/events/" + eventId + "/requested_items/" + item.id, item).then(function(result){
            deferred.resolve(result.data);
         },
         function(error){
            deferred.reject("Could not save requested item: " + error.data.user_msg);
         });

         return deferred.promise;
      };

      Items.removeItem = function(item, eventId){
         var deferred = $q.defer();

         //deleting children automatically in API if the parent gets deleted
         $http.delete(API_IL + "/events/" + eventId + "/requested_items/" + item.id).then(function(result){
            deferred.resolve(result.data);
         },
         function(error){
            deferred.reject("Could not remove requested item: " + error.data.user_msg);
         });

         return deferred.promise;
      };

      Items.addSuppliedItem = function(item){
// 
      };

      Items.addItem = function(item, eventId){
         var deferred = $q.defer();

         $http.post(API_IL + "/events/" + eventId + "/requested_items/", item).then(function(result){
            deferred.resolve(result.data);
         },
         function(error){
            deferred.reject(error.data.user_msg);
         });  

         return deferred.promise;

      };

      Items.moveItem = function(eventId, skillId, itemId, parentId, index){
         var deferred = $q.defer();         

         $http.put(API_IL + "/events/" + eventId + "/requested_items/" + itemId + "/move?skill="+skillId+"&parent="+parentId+"&index="+index, {}).then(function(result){
            deferred.resolve(result);
         },
         function(error){
            deferred.reject(error.data.user_msg);
         });

         return deferred.promise;
      };

   	return Items;

  });