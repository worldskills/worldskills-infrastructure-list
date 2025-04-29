'use strict';

/**
 * @ngdoc service
 * @name ilApp.Items
 * @description
 * # Items
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Items', function ($q, $http, API_IL, MULTIPLIERS, SuppliedItem, Status, Language) {

    var Items = { categories : $q.defer(), $data : $q.defer(), total: null };
    var statuses = null;

    Items.getItems = function(categoryId, listId, eventId, limit, offset, filter, canceler){
      Items.data = $q.defer();

      var filterStr = (typeof filter != 'undefined') ? "&filter=" + filter : "";

      $http.get(API_IL + "/items/" + eventId + "/lists/" + listId + "/requested_items/" + categoryId + "?limit=" + limit + "&offset=" + offset + filterStr, {timeout: canceler.promise}).then(function(result){
        Items.data.resolve(result.data);
        Items.data = result.data;
      },
      function(error){
        if(typeof error.data == 'undefined') Items.data.reject("Could not get items, please contact webmaster@worldskills.org");
      });

      return Items.data.promise;
    };

    Items.saveItem = function(item, eventId, _extended){

      //extended view of the item in response
      var extended = _extended || false;

      var deferred = $q.defer();

      $http.put(API_IL + "/items/" + eventId + "/requested_items/" + item.id + "?extended=" + extended, item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not save requested item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    Items.saveItemSuppliedItem = function (item, eventId) {

      var deferred = $q.defer();

      $http.put(API_IL + '/items/' + eventId + '/requested_items/' + item.id + '/supplied_item/' + item.supplied_item.id).then(function (result) {
        deferred.resolve(result.data);
      }, function (error) {
        deferred.reject("Could not save requested item: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    Items.removeItem = function(item, eventId, leaveOrphan){
      var deferred = $q.defer();

      leaveOrphan == leaveOrphan || false;

      //deleting children automatically in API if the parent gets deleted
      $http.delete(API_IL + "/items/" + eventId + "/requested_items/" + item.id + "?leave_orphan=" + leaveOrphan).then(function(result){
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

      $http.post(api + "/requested_items/", item).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        //delete supplied item orphan
        deferred.reject("Could not create a requested item, please try again. " + error.data.user_msg);
      });

      return deferred.promise;
    };


    Items.addItem = function(item, eventId, _extended, _split_supplied_item, _createSuppliedItem){
      var deferred = $q.defer();

      //extended view of the item in response
      var extended = _extended || false;
      var split_supplied_item = _split_supplied_item || false;
      var createSuppliedItem = _createSuppliedItem || false;
      Status.getDefaultStatus(eventId).then(function(defaultStatus){
        var api = API_IL + "/items/" + eventId

        //add supplied item first if needed
        if(createSuppliedItem){
          $http.post(api + "/supplied_items/" + "?extended=" + extended + "&split_supplied_item=" + split_supplied_item, item.supplied_item).then(function(result){
            //supplied item created
            var new_supplied_item = result;

            //link supplied item
            item.supplied_item = result.data;
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
            deferred.reject("Could not create a Product: " + error.data.user_msg);
          });
        }
        else if(split_supplied_item){
          //clone item
          SuppliedItem.cloneItem(item.supplied_item, eventId, true).then(function(clone){
            //link supplied item
            item.supplied_item = clone;
            $http.post(api + "/requested_items/", item).then(function(result){
                deferred.resolve(result.data);
              },
              function(error){
                //delete supplied item orphan
                $http.delete(api + "/supplied_items/" + clone.id);
                deferred.reject("Could not create a requested item, please try again. " + error.data.user_msg);
              });
          },
          function(error){
            deferred.reject("Could not create a copy of Product: " + error.data.user_msg);
          });
        }
        else {
            //supplied item already created
            $http.post(api + "/requested_items/" + "?extended=" + extended + "&split_supplied_item=" + split_supplied_item, item).then(function(result){
                deferred.resolve(result.data);
              },
              function(error){
                //no need to delete supplied item orphan - as it already existed
                deferred.reject("Could not create a requested item, please try again. " + error.data.user_msg);
              });
        }
      }, function(error){ deferred.reject("Could not fetch default status"); });


      return deferred.promise;
    };

    Items.getCatalogue = function(eventId, filters){
      var deferred = $q.defer();

      var queryParams = "?search=";

      //skill filter
      if(filters.active && filters.list && filters.list.id != 'all')
        queryParams += "&list=" + filters.list.id;

      //category filter
      if(filters.active && filters.category && filters.category.id != 'all')
        queryParams += "&category=" + filters.category.id;

      $http.get(API_IL + "/items/" + eventId + "/catalogue/" + queryParams).then(function(res){
        deferred.resolve(SuppliedItem.transformDateFields(res.data));
      },
      function(error){
        deferred.reject("Could not get catalogue items: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    Items.getItemsByEvent = function(eventId, itemPerPage, page, filters){
      var deferred = $q.defer();

      var params = {
        l: Language.selectedLanguage,
        limit: itemPerPage,
        offset: itemPerPage * (page-1),
        id: filters.id || null,
        tier: filters.tier ? filters.tier.id : null,
        status: filters.status ? filters.status.id : null,
        description: filters.description || null,
        skill: filters.skill ? filters.skill.id : null,
        sector: filters.sector ? filters.sector.id : null,
        item_category: filters.item_category ? filters.item_category.id : null,
        item_subcategory: filters.item_subcategory ? filters.item_subcategory.id : null,
        category: filters.category ? filters.category.id : null,
        supplier: filters.supplier || null,
        manufacturer: filters.manufacturer || null,
        model: filters.model || null,
        size: filters.size || null,
        air: filters.air || null,
        water: filters.water || null,
        electricity: filters.electricity || null
      };

      $http.get(API_IL + '/items/' + eventId, {params: params}).then(function(result) {
        deferred.resolve(result.data);
      }, function(error) {
        deferred.reject(error.data);
      });

      return deferred.promise;
    };

    Items.getPublicItems = function(eventId, listId){
      var deferred = $q.defer();

      $http.get(API_IL + '/public/lists/' + listId + '/requested_items').then(function(result) {
        deferred.resolve(result.data);
      }, function(error) {
        deferred.reject(error.data.user_msg);
      });

      return deferred.promise;
    };

    Items.factorNeeded = function (multiplierId) {
      var retval = false;

      angular.forEach(MULTIPLIERS, function (val) {
        if (val.id == multiplierId && val.x_number_needed === true) retval = true;
      });

      return retval;
    };

     return Items;

  });
