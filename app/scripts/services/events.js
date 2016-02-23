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

    var Events = { id: false, data: $q.defer(), skills: {} };

    Events.init = function(){
        //TODO implement if needed
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

    Events.getEvent = function(eventId){
      var deferred = $q.defer();

      $http.get(API_IL + "/events/" + eventId).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not fetch event details");
      });

      return deferred.promise;
    };

    Events.getSkillsForSector = function(sectorId, eventId){
        var deferred = $q.defer();
        $http.get(API_IL + "/events/skills/" + eventId + "/" + sectorId).then(function(result){
            Events.skills = result.data.skills;
            Events.id = eventId;
            deferred.resolve(result.data.skills);
        },
        function(error){
            deferred.reject("Could not fetch skills for sector");
        });

        return deferred.promise;
    };

    Events.getSkillsForEvent = function(eventId){
        var deferred = $q.defer();
        $http.get(API_IL + "/events/skills/" + eventId).then(function(result){
            Events.skills = result.data.skills;
            Events.id = eventId;
            deferred.resolve(result.data.skills);
        },
        function(error){
            deferred.reject("Could not fetch skills for event");
        });

        return deferred.promise;
    };

    Events.getSkill = function(skillId){
        var deferred = $q.defer();

        $http.get(API_IL + "/events/skill/" + skillId).then(function(result){
            Events.id = result.data.event;
            deferred.resolve(result.data);
        },
        function(error){
            deferred.reject("Could not fetch skill information");
        });

        return deferred.promise;
    };

    return Events;
  });
