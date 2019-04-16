'use strict';

angular.module('ilApp').service('TierReport', function ($q, $http, API_IL) {

    var TierReport = {};

    TierReport.getTierReportForEvent = function(eventId){
      var deferred= $q.defer();

      $http.get(API_IL + '/events/' + eventId + '/reports/tiers').then(function(result){
        deferred.resolve(result.data);
      },
      function(error){
        deferred.reject('Could not fetch tier report for event: ' + error.data.user_msg);
      });

      return deferred.promise;
    };

    return TierReport;
  });
