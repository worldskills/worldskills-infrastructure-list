'use strict';

/**
 * @ngdoc service
 * @name ilApp.Language
 * @description
 * # Language
 * Service in the ilApp.
 */
angular.module('ilApp')
  .service('Language', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
        // AngularJS will instantiate a singleton by calling "new" on this function
	    var LanguageService = {
				selectedLanguage: 'en'	//defaults to en
	    };
	
	    return LanguageService;
  });
