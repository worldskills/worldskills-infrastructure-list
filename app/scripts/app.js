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
    'infinite-scroll',
    'ui.grid', 'ui.grid.autoResize', 'ui.grid.exporter', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.grid.pinning', 'ui.grid.rowEdit', 'ui.grid.selection',
    'cfp.hotkeys'
  ])
  //.config(function ($routeProvider) {
    .config(function ($routeProvider, APP_ROLES, $translateProvider, $stateProvider, $urlRouterProvider, $httpProvider) {

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
        var times = (sessionStorage.getItem('login_redirect_counter') !== null) ? sessionStorage.getItem('login_redirect_counter') : 1;
        var MAX_RETRIES = 3;

        if(
            (rejection.status == 400 && rejection.data.code == "2200-1012") ||
            (rejection.status == 401 && rejection.data.code == "100-101")
          )
          {

            //if past max retries (3)
            if(times > MAX_RETRIES){
              WSAlert.danger("You most likely don't have the required permissions, please contact webmaster@worldskills.org");
              sessionStorage.setItem('login_redirect_counter', 1);
            }
            else{
              WSAlert.danger(rejection.data.user_msg + ". Redirecting to login... [" + times + "]");
              var refreshLogin = function () {
                window.history.go(0);
              };
              //redirect to login after 1 second timeout
              times++;
              sessionStorage.setItem('login_redirect_counter', times);
              $timeout(refreshLogin, 1000);
            }
        }
        else{
          //clear timeout
          sessionStorage.setItem('login_redirect_counter', 1);
        }

        return $q.reject(rejection);
      }
    };
  }]);


  $translateProvider.useStaticFilesLoader({
    prefix: 'languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('en');
  $translateProvider.fallbackLanguage('en');
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
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl',
      data: {
        requireLoggedIn: true
      }
    })

    .state('event', {
      url: '/event/{eventId}',
      templateUrl: 'views/event.html',
      controller: 'EventCtrl',
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

    .state('event.overview', {
      url: '/overview',
      templateUrl: 'views/event.overview.html',
      controller: 'EventOverviewCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.ORGANIZER },
            {code: 2200, role: APP_ROLES.WS_SECTOR_MANAGER }
          ]
        }
    })

    //event management
    .state('event.sets', {
      url: '/sets',
      templateUrl: 'views/event.sets.html',
      controller: 'EventSetsCtrl',
      data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER }
        ]
      }
    })

    .state('event.sets.edit', {
      url: '/edit/{setId}',
      templateUrl: 'views/event.sets.edit.html',
      controller: 'EventSetsEditCtrl',
      data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER }
        ]
      }
    })

    .state('event.sets.add', {
      url: '/add',
      templateUrl: 'views/event.sets.add.html',
      controller: 'EventSetsAddCtrl',
      data: {
      requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER }
        ]
      }
    })

    //catalogue
    .state('event.catalogue', {
      url: '/catalogue',
      templateUrl: 'views/event.catalogue.html',
      controller: 'EventCatalogueCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER }
        ]
      }
    })

    //skills
   .state('event.skill', {
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

   .state('event.skill.overview', {
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

   .state('event.skill.category', {
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

   .state('publicItems', {
     url: '/event/{eventId}/skill/{skillId}/public',
     templateUrl: 'views/public-items.html',
     controller: 'PublicItemsCtrl',
     data: {
       requireLoggedIn: true,
       requiredRoles: [
         {code: 2200, role: APP_ROLES.VIEW }
       ]
     }
   })

   //
  //  .state('management', {
  //   url: '/management',
  //   controller: 'ManagementCtrl',
  //   templateUrl: 'views/management.html',
  //   abstract: true,
  //   data: {
  //     requireLoggedIn: true,
  //       requiredRoles: [
  //         {code: 2200, role: APP_ROLES.ADMIN },
  //         {code: 2200, role: APP_ROLES.ORGANIZER }
  //       ]
  //     }
  //  })
   //
  //  .state('management.sets', {
  //   url: '/sets/{eventId}',
  //   templateUrl: 'views/event.sets.html',
  //   controller: 'EventSetsCtrl',
  //   data: {
  //     requireLoggedIn: true,
  //     requiredRoles: [
  //         {code: 2200, role: APP_ROLES.ADMIN },
  //         {code: 2200, role: APP_ROLES.ORGANIZER }
  //       ]
   //
  //     }
  //  })
  //  ;

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
