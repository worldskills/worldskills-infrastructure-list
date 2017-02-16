'use strict';

/**
 * @ngdoc service
 * @name ilApp.reporting
 * @description
 * # reporting
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Reporting', function ($http, $q, API_IL, Downloader) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var Reporting = {};

	    Reporting.exportRequestedForSkill = function(eventId, skillId) {

	    	var deferred = $q.defer();

	        $http({url: API_IL + "/reports/requested/skill/" + eventId + "/" + skillId, method: "GET", params: { s: "xlsx" }, responseType : "blob"})
	        .success( function(data, status, headers) {

	           var filename = 'report_requested_' + skillId + '.xlsx';
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

	           var filename = 'report_requested_' + eventId + '.xlsx';
	           Downloader.handleDownload(data, status, headers, filename);
	           deferred.resolve();

	        })
	        .error(function(data, status) {
	            deferred.reject("Could not export to excel");
	    	});

	    	return deferred.promise;
	    };

	return Reporting;

  });
