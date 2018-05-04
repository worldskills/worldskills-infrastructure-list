'use strict';

/**
 * @ngdoc service
 * @name ilApp.Status
 * @description
 * # Status
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Status', function ($q, $http, API_IL) {

    var Status = {};

    Status.getSummaryForSkill = function(skillId){
      var deferred= $q.defer();

      $http.get(API_IL + "/summary/skill/" + skillId).then(function(result){
        deferred.resolve(result.data.summaries);
      },
      function(error){
        deferred.reject("Could not fetch summary for skill: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    Status.getSummaryForEvent = function(eventId){
      var deferred = $q.defer();
      $http.get(API_IL + "/summary/event/" + eventId).then(function(result){
        Events.skills = result.data.skills;
        Events.id = eventId;
        deferred.resolve(result.data.skills);
      },
      function(error){
        deferred.reject("Could not fetch skills for event");
      });

      return deferred.promise;
    };

    Status.getAllStatuses = function(eventId){
      var deferred = $q.defer();
      $http.get(API_IL + "/statuses/event/"  + eventId).then(function(result){
        deferred.resolve(result.data.statuses);
      },
      function(error){
        deferred.reject("Could not fetch statuses");
      });

      return deferred.promise;
    };

    Status.getDefaultStatus = function(eventId){
      var deferred = $q.defer();
      $http.get(API_IL + "/statuses/event/default"  + eventId).then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject("Could not fetch default statuse");
      });

      return deferred.promise;
    };


     return Status;
  });
