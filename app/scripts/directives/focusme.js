'use strict';

/**
 * @ngdoc directive
 * @name ilApp.directive:focusMe
 * @description
 * # focusMe
 */
angular.module('ilApp')
  .directive('focusMe', function ($timeout) {
    return {
      link: function (scope, element, attrs, model) {
        $timeout(function () {
          element[0].focus();
        });
      }
    };
  });
