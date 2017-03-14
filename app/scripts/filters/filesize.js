'use strict';

/**
 * @ngdoc filter
 * @name ilApp.filter:nl2br
 * @function
 * @description
 * # nl2br
 * Filter in the ilApp.
 */
angular.module('ilApp')
  .filter('filesize', function () {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
      if (typeof precision === 'undefined') precision = 1;
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
  });
