'use strict';

/**
 * @ngdoc overview
 * @name ilApp
 * @description
 * # ilApp
 *
 * Main module of the application.
 */
angular
  .module('ilApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.select',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'daterangepicker',
    'pascalprecht.translate',
    'worldskills.utils',
    'angularFileUpload',
    'ui.tree',
    'ngAside',
    'angucomplete-alt',
    'angular-confirm',
    'infinite-scroll'
  ])
  //.config(function ($routeProvider) {
    .config(function ($routeProvider, APP_ROLES, $translateProvider, $stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    
    $urlRouterProvider.otherwise('/');

      $urlRouterProvider.otherwise(function ($injector, $location) {
      // check for existing redirect
      var $state = $injector.get('$state');
      var redirectToState = sessionStorage.getItem('redirect_to_state');
      var redirectToParams = sessionStorage.getItem('redirect_to_params');
      sessionStorage.removeItem('redirect_to_state');
      sessionStorage.removeItem('redirect_to_params');
      if (redirectToState) {
          if (redirectToParams) {
              redirectToParams = angular.fromJson(redirectToParams);
          } else {
              redirectToParams = {};
          }
          $state.go(redirectToState, redirectToParams);
      } else {
          $state.go('home');
      }
  });

    $httpProvider.interceptors.push(['$q', 'WSAlert', '$timeout', function($q, WSAlert, $timeout) {
    return {        
      responseError: function(rejection) {
        /*
          Called when another XHR request returns with
          an error status code.          
        */

        if(
            (rejection.status == 400 && rejection.data.code == "2200-1012") ||            
            (rejection.status == 401 && rejection.data.code == "100-101")
          )
          {
          WSAlert.danger(rejection.data.user_msg + ". Redirecting to login...");
          var refreshLogin = function(){ 
            //FIXME - figure out a way to redirect to login directly without a refresh
            window.history.go(0); 
          };
          //redirect to login after 2.5 second timeout
          $timeout(refreshLogin, 500);
        }
        return $q.reject(rejection);
      }
    };
  }]);


  $translateProvider.useStaticFilesLoader({
    prefix: 'languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('en_US');
  $translateProvider.fallbackLanguage('en_US');
  $translateProvider.useLocalStorage();
  $translateProvider.useSanitizeValueStrategy('sanitize');

  //language negotiation
  //http://angular-translate.github.io/docs/#/guide/09_language-negotiation
  // $translateProvider.registerAvailableLanguageKeys(['en', 'pt'], {
  //   'en_US': 'en',
  //   'en_UK': 'en',
  //   'pt_BR': 'pt'    
  // });


//routes
  $stateProvider

  // //index
    .state('home', {
      url: '/',
      templateUrl: 'views/main.html',
      contoller: 'HomeCtrl',
      data: {
        requireLoggedIn: true
      }
    })   

   .state('skill', {
    url: '/skill/{skillId}',
    templateUrl: 'views/skill.html',
    controller: 'SkillCtrl',
    abstract: true,
    data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER },
          {code: 2200, role: APP_ROLES.WS_MANAGER },
          {code: 2200, role: APP_ROLES.WS_SECTOR_MANAGER }
        ]
      }
   })

   .state('skill.overview', {
    url: '',
    templateUrl: 'views/skill.overview.html',
    controller: 'SkillOverviewCtrl',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER },
          {code: 2200, role: APP_ROLES.WS_MANAGER },
          {code: 2200, role: APP_ROLES.WS_SECTOR_MANAGER }
        ]
        
      }
   })

   .state('skill.category', {
    url: '/category/{categoryId}',
    templateUrl: 'views/skill.category.html',
    controller: 'SkillCategoryCtrl',
    data: {
      requireLoggedIn: true,
      requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER },
          {code: 2200, role: APP_ROLES.WS_MANAGER },
          {code: 2200, role: APP_ROLES.WS_SECTOR_MANAGER }
        ]
        
      }
   })
   ;

  })
.run(function($rootScope, $state, $stateParams, auth, WSAlert){
  //DEVELOPMENT API URL
  $rootScope.available_languages = {"en_US":"English"};
  //$rootScope.available_languages = {"en_US":"English", "pt_BR":"Portuguese (Brazil)"};

  //PRODUCTION API URL
  //$rootScope.api_url = "http://beuk.worldskills.org/glossary/";
  $rootScope.closeAlert = WSAlert.closeAlert;

  // It's very handy to add references to $state and $stateParams to the $rootScope
  // so that you can access them from any scope within your applications.For example,
  // <li ng-class='{ active: $state.includes('contacts.list') }'> will set the <li>
  // to active whenever 'contacts.list' or one of its decendents is active.
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
});