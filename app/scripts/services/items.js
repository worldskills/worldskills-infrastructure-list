'use strict';

/**
 * @ngdoc service
 * @name ilApp.Items
 * @description
 * # Items
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Items', function ($q, $http, API_IL, ITEM_STATUS) {
   	
   	var Items = { categories : $q.defer(), $data : $q.defer() }

   	Items.getCategories = function(skillId){

   		if(typeof Items.categories.promise == 'undefined') Items.categories = $q.defer();

   		$http.get(API_IL + "/categories/" + skillId).then(function(result){
   			Items.categories.resolve(result.data.categories);
   			Items.categories = result.data.categories;
   		},
   		function(error){
   			Items.categories.reject("Could not fetch categories: " + error.data.user_msg);
   		});

   		return Items.categories.promise;
   	};

   	Items.getItems = function(categoryId, skillId, eventId, limit, offset, filter, canceler){
   		Items.data = $q.defer();         
   		
         var filterStr = (typeof filter != 'undefined') ? "&filter=" + filter : "";

   		$http.get(API_IL + "/items/" + eventId + "/skills/" + skillId + "/requested_items/" + categoryId + "?limit=" + limit + "&offset=" + offset + filterStr, {timeout: canceler.promise}).then(function(result){
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


         $http.put(API_IL + "/items/" + eventId + "/requested_items/" + item.id, item).then(function(result){
            /** check if we should update the supplied items as well
               * only update IF:
               * 1) this item is only used in this skill
               * 2) the supplied item's status is still "RED" 
            */
            //TODO handle supplied item update
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
         $http.delete(API_IL + "/items/" + eventId + "/requested_items/" + item.id).then(function(result){
            deferred.resolve(result.data);
         },
         function(error){
            deferred.reject("Could not remove requested item: " + error.data.user_msg);
         });

         return deferred.promise;
      };

      Items.linkItem = function(item, eventId){
         var deferred = $q.defer();

         var api = API_IL + "/items/" + eventId         
         //add status
         item.status = {id: ITEM_STATUS.RED};

         $http.post(api + "/requested_items/", item).then(function(result){
            deferred.resolve(result.data);
         },
         function(error){
            //delete supplied item orphan
            deferred.reject("Could not create a requested item, please try again. " + error.data.user_msg);
         });           
         

         return deferred.promise;
      };

      Items.addItem = function(item, eventId){
         var deferred = $q.defer();

         var api = API_IL + "/items/" + eventId
         var supplied_item = {
            "event": { id: eventId},
            "status": { id: ITEM_STATUS.RED },             
            "description": item.description
         };

         //add status to item
         item.status = { id: ITEM_STATUS.RED };
         
         //add supplied item first
         $http.post(api + "/supplied_items/", supplied_item).then(function(result){
            var new_supplied_item = result;

            //set id of the newly created supplied item
            item.supplied_item = {id: new_supplied_item.data.id};

            $http.post(api + "/requested_items/", item).then(function(result){
               deferred.resolve(result.data);
            },
            function(error){
               //delete supplied item orphan
               $http.delete(api + "/supplied_items/" + new_supplied_item.data.id);
               deferred.reject("Could not create a requested item, please try again. " + error.data.user_msg);
            });  
         },
         function(error){
            deferred.reject("Could not create a supplied item: " + error.data.user_msg);
         });         

         return deferred.promise;
      };

      Items.moveItem = function(eventId, skillId, itemId, parentId, index){
         var deferred = $q.defer();         

         $http.put(API_IL + "/items/" + eventId + "/requested_items/" + itemId + "/move?skill="+skillId+"&parent="+parentId+"&index="+index, {}).then(function(result){
            deferred.resolve(result);
         },
         function(error){
            deferred.reject(error.data.user_msg);
         });

         return deferred.promise;
      };

   	return Items;

  });