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
  .filter('nl2br', function () {
    return function (input) {
      if(typeof input !== 'undefined')
        return input.replace(/\n/g, "<br />");
    };
  });
