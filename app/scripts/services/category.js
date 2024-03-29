'use strict';

/**
 * @ngdoc service
 * @name ilApp.Status
 * @description
 * # Status
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Category', function ($q, $http, $resource, API_IL, Language) {

    var Category = $resource(API_IL + '/events/:eventId/categories/:id', {
      }, {
          query: {
              method: 'GET'
          },
          save: {
              method: 'POST',
          },
          update: {
              method: 'PUT'
          },
          delete: {
              method: 'DELETE'
          }
      });

    Category.getAll = function(eventId){
      var deferred= $q.defer();

      $http.get(API_IL + "/events/" + eventId + "/categories?l=" + Language.selectedLanguage).then(function(result){
        deferred.resolve(result.data.categories);
      },
      function(error){
        deferred.reject("Could not fetch summary for skill: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    return Category;
  });
