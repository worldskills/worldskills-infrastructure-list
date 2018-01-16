'use strict';

/**
 * @ngdoc service
 * @name ilApp.ItemCategory
 * @description
 * # ItemCategory
 * Service in the ilApp.
 */
angular.module('ilApp')
  .factory('ItemCategory', function ($q, $http, API_IL) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var ItemCategory = { id: false, data: $q.defer(), itemCategories: {}, itemSubCategories: {}};

    ItemCategory.init = function(){
        //TODO implement if needed
        //var deferred = $q.defer();
        if(typeof ItemCategory.data.promise == 'undefined') ItemCategory.data = $q.defer();

        $http.get(API_IL + "/item-category").then(function(result){
            ItemCategory.data.resolve(result.data.connect_events);
            ItemCategory.data = result.data.connect_events;
        },
        function(error){
            ItemCategory.data.reject("Could not fetch events");
        });
        return ItemCategory.data.promise;
    };

    ItemCategory.getAll = function(eventId, level){
      var deferred = $q.defer();

      var url = API_IL + "/event/" + eventId + "/item-category";

      if(typeof level !== 'undefined'){
        url += "?level="+level;
      }

      $http.get(url).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not fetch item categories");
      });

      return deferred.promise;
    };

    ItemCategory.getAllCategory = function(eventId){
      return ItemCategory.getAll(eventId, 2);
    };


    ItemCategory.getAllSubCategory = function(eventId){
      return ItemCategory.getAll(eventId, 1);
    };


    ItemCategory.getSkillsForSector = function(sectorId, eventId, status){
        var deferred = $q.defer();
        status = status || false;
        $http.get(API_IL + "/events/skills/" + eventId + "/" + sectorId + "?status=" + status).then(function(result){
            ItemCategory.skills = result.data.skills;
            ItemCategory.id = eventId;
            deferred.resolve(result.data.skills);
        },
        function(error){
            deferred.reject("Could not fetch skills for sector");
        });

        return deferred.promise;
    };

    ItemCategory.getSkillsForEvent = function(eventId, status){
        var deferred = $q.defer();
      status = status || false;

        $http.get(API_IL + "/events/skills/" + eventId + "?status=" + status).then(function(result){
            ItemCategory.skills = result.data.skills;
            ItemCategory.id = eventId;
            deferred.resolve(result.data.skills);
        },
        function(error){
            deferred.reject("Could not fetch skills for event");
        });

        return deferred.promise;
    };

    ItemCategory.getSkill = function(skillId, status){
        var deferred = $q.defer();
        status = status || false;

        $http.get(API_IL + "/events/skill/" + skillId + "?status=" + status).then(function(result){
            ItemCategory.id = result.data.event.id;
            deferred.resolve(result.data);
        },
        function(error){
            deferred.reject("Could not fetch skill information");
        });

        return deferred.promise;
    };

    ItemCategory.getSkillAreas = function(eventId){
      var deferred = $q.defer();

      $http.get(API_IL + "/skill_areas/event/" + eventId).then(function(result){
          ItemCategory.skillAreas = result.data.skill_areas;
          deferred.resolve(ItemCategory.skillAreas);
        },
        function(error){
          deferred.reject("Could not fetch skill areas: " + error);
        });

      return deferred.promise;
    };

    ItemCategory.getParticipantCounts = function(skillId){
      var deferred = $q.defer();

      $http.get(API_IL + "/events/skill/" + skillId + "/participants").then(function(res){
        deferred.resolve(res.data);
      }, function(error){
        deferred.reject("Could not get participant numbers: " + error);
      });

      return deferred.promise;
    };

    ItemCategory.getSkillManagement = function(skillId){
      return $http.get(API_IL + "/events/skill/" + skillId + "/management");
    };

    return ItemCategory;
  });
