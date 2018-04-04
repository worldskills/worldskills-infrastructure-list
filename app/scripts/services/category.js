'use strict';

/**
 * @ngdoc service
 * @name ilApp.Status
 * @description
 * # Status
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Category', function ($q, $http, API_IL, Language) {

    var Category = {};

    Category.getAll = function(){
      var deferred= $q.defer();

      $http.get(API_IL + "/categories?l=" + Language.selectedLanguage).then(function(result){
        deferred.resolve(result.data.categories);
      },
      function(error){
        deferred.reject("Could not fetch summary for skill: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    return Category;
  });
