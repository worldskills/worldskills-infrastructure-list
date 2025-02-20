'use strict';

/**
 * @ngdoc service
 * @name ilApp.reporting
 * @description
 * # reporting
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Reporting', function ($http, $q, $filter, API_IL, Downloader, Language) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var Reporting = {};

    Reporting.dateNow = function(){
      var now = new Date();
      return $filter('date')(now, "yyyy-MM-dd-HH-mm-ss");
    };

    Reporting.exportRequestedForList = function(eventId, listId) {

      var deferred = $q.defer();

      $http({url: API_IL + "/reports/requested/lists/" + eventId + "/" + listId, method: "GET", params: { s: "xlsx" }, responseType : "blob", timeout: 120000 })
      .success( function(data, status, headers) {
          var filename = 'report_requested_' + listId + '__'  + Reporting.dateNow() + '.xlsx';
          Downloader.handleDownload(data, status, headers, filename);
          deferred.resolve();

      })
      .error(function(data, status) {
          deferred.reject("Could not export to excel");
      });

      return deferred.promise;
    };

    Reporting.exportRequestedForEvent = function(eventId, filters, global) {

      //Defaut (and old) behavior is global from the global page of an event
      if(undefined == global){
        global = true;
      }

      var deferred = $q.defer();
      var format = 'xlsx';
      var params = {
        s: format,
        l: Language.selectedLanguage,
        global: global
      };

      if(filters){
        params.status = filters.status ? filters.status.id : null;
        params.description = filters.description || null;
        params.skill = filters.skill ? filters.skill.id : null;
        params.sector = filters.sector ? filters.sector.id : null;
        params.item_category = filters.item_category ? filters.item_category.id : null;
        params.item_subcategory = filters.item_subcategory ? filters.item_subcategory.id : null;
        params.category = filters.category ? filters.category.id : null;
        params.supplier = filters.supplier || null;
        params.id = filters.id || null;
        params.manufacturer = filters.manufacturer || null;
        params.air = filters.air || null;
        params.water = filters.water || null;
        params.electricity = filters.electricity || null;
      }

      $http({url: API_IL + "/reports/requested/event/" + eventId, method: "GET", params: params, responseType: "blob"})
      .success( function(data, status, headers) {

        var filename = 'report_requested_' + eventId + '__'  + Reporting.dateNow() + '.' + format;
        Downloader.handleDownload(data, status, headers, filename);
        deferred.resolve();

      })
      .error(function(data, status) {
        deferred.reject("Could not export to an ." + format);
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
