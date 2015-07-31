'use strict';

/**
 * @ngdoc filter
 * @name ilApp.filter:startFrom
 * @function
 * @description
 * # startFrom
 * Filter in the ilApp.
 */
angular.module('ilApp')
  .filter('startFrom', function () {
    return function(input, start) {
        if(input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
  });
