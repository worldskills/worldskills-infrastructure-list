'use strict';

/**
 * @ngdoc service
 * @name ilApp.Events
 * @description
 * # Events
 * Service in the ilApp.
 */
angular.module('ilApp')
  .factory('Events', function ($q, $http, API_IL) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var Events = { data: $q.defer() };    

    Events.init = function(){
        //var deferred = $q.defer();
        if(typeof Events.data.promise == 'undefined') Events.data = $q.defer();
                
        $http.get(API_IL + "/events").then(function(result){
            Events.data.resolve(result.data.connect_events);
            Events.data = result.data.connect_events;
        },
        function(error){
            Events.data.reject("Could not fetch events");
        });
        return Events.data.promise;
    };    

    Events.getSubscriptions = function(eventId, offsetVal, limitVal){
        var deferred = $q.defer();
        $http.get(API_IL + "/subscriptions/events/" + eventId, {params: {offset: offsetVal, limit: limitVal} }).then(function(result){
            deferred.resolve(result.data);
        },
        function(error){
            deferred.reject("Could not get event subscriptions: " + error.data.user_msg);
        });

        return deferred.promise;
    };

    return Events;   	
  });
