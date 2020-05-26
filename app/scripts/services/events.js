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

    var Events = { id: false, data: $q.defer(), skills: {}, skillAreas: {}};

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

      $http.get(API_IL + "/events/info/" + eventId).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not fetch event details");
      });

      return deferred.promise;
    };

    Events.getEventsWithILs = function(pid){
      var deferred = $q.defer();

      $http.get(API_IL + "/events").then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not fetch list of events with view ILs");
      });

      return deferred.promise;
    };

    Events.getSkillsForSector = function(sectorId, eventId, status){
        var deferred = $q.defer();
        status = status || false;
        $http.get(API_IL + "/events/skills/" + eventId + "/" + sectorId + "?status=" + status).then(function(result){
            Events.skills = result.data.skills;
            Events.id = eventId;
            deferred.resolve(result.data.skills);
        },
        function(error){
            deferred.reject("Could not fetch skills for sector");
        });

        return deferred.promise;
    };

    Events.getListsForEvent = function(eventId){
        var deferred = $q.defer();
        status = status || false;

        $http.get(API_IL + "/events/" + eventId + "/lists").then(function(result){
            deferred.resolve(result.data.lists);
        },
        function(error){
            deferred.reject("Could not fetch lists for event");
        });

        return deferred.promise;
    };

    Events.getSkillsForEvent = function(eventId, status){
        var deferred = $q.defer();
        status = status || false;

        $http.get(API_IL + "/events/skills/" + eventId + "?status=" + status).then(function(result){
            Events.skills = result.data.skills;
            Events.id = eventId;
            deferred.resolve(result.data.skills);
        },
        function(error){
            deferred.reject("Could not fetch skills for event");
        });

        return deferred.promise;
    };

    Events.getSkill = function(skillId, status){
        var deferred = $q.defer();
        status = status || false;

        $http.get(API_IL + "/events/skill/" + skillId + "?status=" + status).then(function(result){
            Events.id = result.data.event.id;
            deferred.resolve(result.data);
        },
        function(error){
            deferred.reject("Could not fetch skill information");
        });

        return deferred.promise;
    };

    Events.getSkillAreas = function(eventId){
      var deferred = $q.defer();

      $http.get(API_IL + "/skill_areas/event/" + eventId).then(function(result){
          Events.skillAreas = result.data.skill_areas;
          deferred.resolve(Events.skillAreas);
        },
        function(error){
          deferred.reject("Could not fetch skill areas: " + error);
        });

      return deferred.promise;
    };

    Events.getParticipantCounts = function(skillId){
      var deferred = $q.defer();

      $http.get(API_IL + "/events/skill/" + skillId + "/participants").then(function(res){
        deferred.resolve(res.data);
      }, function(error){
        deferred.reject("Could not get participant numbers: " + error);
      });

      return deferred.promise;
    };

    Events.getSkillManagement = function(skillId){
      return $http.get(API_IL + "/events/skill/" + skillId + "/management");
    };

    return Events;
  });
