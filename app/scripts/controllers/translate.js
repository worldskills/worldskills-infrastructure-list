'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:TranslateCtrl
 * @description
 * # TranslateCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('TranslateCtrl', function ($translate, $translateLocalStorage, $scope, Language, $route, $state, $http, amMoment, tmhDynamicLocale) {

    //get current language from local storage
    Language.selectedLanguage = $translateLocalStorage.get('NG_TRANSLATE_LANG_KEY');
    $scope.selectedLanguage = Language.selectedLanguage;
    $scope.changeLanguage = function(langKey){
      //Translate strings in template
      $translate.use(langKey);
      //Force locale for api requests
      $http.defaults.headers.common["Accept-Language"] = langKey;
      //Used to change locale to render properly date/time
      amMoment.changeLocale(langKey);
      //Used to load dynamically locale from angular-i18n
      //Necessary to translate angular-ui-bootstrap eg: datepicker
      //Cf: https://stackoverflow.com/questions/19671887/angularjs-angular-ui-bootstrap-changing-language-used-by-the-datepicker
      tmhDynamicLocale.set(langKey);

      Language.selectedLanguage = langKey;
      $scope.selectedLanguage = langKey;

      $state.reload();
    };

  });
