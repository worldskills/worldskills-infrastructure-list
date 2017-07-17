'use strict';

/**
 * @ngdoc service
 * @name ilApp.reporting
 * @description
 * # reporting
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Reporting', function ($http, $q, $filter, API_IL, Downloader) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var Reporting = {};

      Reporting.dateNow = function(){
        var now = new Date();
        return $filter('date')(now, "yyyy-MM-dd-HH-mm-ss");
      };

	    Reporting.exportRequestedForSkill = function(eventId, skillId) {

	    	var deferred = $q.defer();

	        $http({url: API_IL + "/reports/requested/skill/" + eventId + "/" + skillId, method: "GET", params: { s: "xlsx" }, responseType : "blob", timeout: 120000})
	        .success( function(data, status, headers) {
	           var filename = 'report_requested_' + skillId + '__'  + Reporting.dateNow() + '.xlsx';
	           Downloader.handleDownload(data, status, headers, filename);
	           deferred.resolve();

	        })
	        .error(function(data, status) {
	            deferred.reject("Could not export to excel");
	    	});

	    	return deferred.promise;
	    };

	   	Reporting.exportRequestedForEvent = function(eventId) {

	   		var deferred = $q.defer();

	        $http({url: API_IL + "/reports/requested/event/" + eventId, method: "GET", params: { s: "xlsx" }, responseType : "blob"})
	        .success( function(data, status, headers) {

	           var filename = 'report_requested_' + eventId + '__'  + Reporting.dateNow() + '.xlsx';
	           Downloader.handleDownload(data, status, headers, filename);
	           deferred.resolve();

	        })
	        .error(function(data, status) {
	            deferred.reject("Could not export to excel");
	    	});

	    	return deferred.promise;
	    };

    Reporting.exportCatalogueForEvent = function(eventId) {

      var deferred = $q.defer();

      $http({url: API_IL + "/reports/catalogue/event/" + eventId, method: "GET", params: { s: "xlsx" }, responseType : "blob"})
        .success( function(data, status, headers) {

          var filename = 'report_catalogue_' + eventId + '__'  + Reporting.dateNow() + '.xlsx';
          Downloader.handleDownload(data, status, headers, filename);
          deferred.resolve();

        })
        .error(function() {
          deferred.reject("Could not export to excel");
        });

      return deferred.promise;
    };

	return Reporting;

  });
