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
   			Items.categories.reject("Could not fetch categories: " + error);
   		});

   		return Items.categories.promise;
   	};

   	Items.getItems = function(categoryId, skillId, eventId){
   		Items.data = $q.defer();
   		
   		$http.get(API_IL + "/events/" + eventId + "/skills/" + skillId + "/requested_items?category=" + categoryId).then(function(result){
   			Items.data.resolve(result.data.requested_items);
   			Items.data = result.data.requested_items;
   		},
   		function(error){
   			Items.data.reject("Could not get items: " + error);   			
   		});

   		return Items.data.promise;
   	};

   	return Items;

  });