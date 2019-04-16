(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name ilApp
   * @description
   * # ilApp
   *
   * Main module of the application.
   */
  var ilApp = angular
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
      'angularMoment',
      'tmh.dynamicLocale',
      'ui.grid', 'ui.grid.autoResize', 'ui.grid.exporter', 'ui.grid.edit', 'ui.grid.resizeColumns', 'ui.grid.cellNav', 'ui.grid.pinning', 'ui.grid.rowEdit', 'ui.grid.selection',
      'cfp.hotkeys'
    ]);

  ilApp.constant('APP_ROLES', {
    ADMIN: 'Admin',
    ORGANIZER: 'Organizer',
    WS_MANAGER: 'Workshop Manager',
    WS_SECTOR_MANAGER: 'Sector Manager',
    EDIT_ITEM_CATEGORIES: 'EditItemCategories',
    EDIT_ITEM_STATUS: 'EditItemStatus',
    EDIT_CONFIG: 'EditConfig',
    RECOMMEND: 'Recommend',
    RECOMMEND_SUPPLIED: 'RecommendSupplied',
    VIEW: 'View'
  });

  ilApp.constant('MULTIPLIERS', [
    {"id": "SKILL", "name" : "per Skill", "x_number_needed": false },
    {"id": "COMPETITORS", "name" : "per Competitor", "x_number_needed": false },
    {"id": "EXPERTS", "name" : "per Expert", "x_number_needed": false },
    {"id": "PER_NUM_COMPETITORS", "name" : "per every X Competitors", "x_number_needed": true },
    {"id": "PER_NUM_EXPERTS", "name" : "per every X Experts", "x_number_needed": true }
  ]);



  ilApp.constant('MULTIPLIER_DEFAULT', 'SKILL');

  ilApp.constant('SUPPLIED_ITEM_PRIORITIES', [
    'CRITICAL',
    'HIGH',
    'NORMAL',
    'LOW'
  ]);

  ilApp.constant('UNITS', {
    "pcs": "UNIT_PIECES",
    "t": "UNIT_TONNES",
    "kg": "UNIT_KILOGRAMS",
    "g": "UNIT_GRAMS",
    "l": "UNIT_LITRES",
    "boxes": "UNIT_BOXES",
    "boots": "UNIT_BOOTS",
    "bottles": "UNIT_BOTTLES",
    "sheets": "UNIT_SHEETS",
    "kits": "UNIT_KITS",
    "m": "UNIT_METRES",
    "cm": "UNIT_CENTIMETRES",
    "m2": "UNIT_SQUARE_METRES",
    "m3": "UNIT_CUBIC_METRES",
  });

  ilApp.config(function ($routeProvider, APP_ROLES, $translateProvider, $stateProvider, $urlRouterProvider, $httpProvider, tmhDynamicLocaleProvider) {

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

    tmhDynamicLocaleProvider.localeLocationPattern('/bower_components/angular-i18n/angular-locale_{{locale}}.js');

    $translateProvider.useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage('en');
    $translateProvider.fallbackLanguage('en');
    $translateProvider.useLocalStorage();
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.registerAvailableLanguageKeys(['en', 'fr'], {
      'en_*': 'en',
      'fr_*': 'fr',
      '*': 'en'
    });

    //routes
    $stateProvider

    //index
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
          {code: 2200, role: APP_ROLES.ORGANIZER },
          {code: 2200, role: APP_ROLES.WS_SECTOR_MANAGER }
        ]
      }
    })

    .state('event.revisions', {
      url: '/revisions',
      templateUrl: 'views/event.revisions.html',
      controller: 'EventRevisionsCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.ORGANIZER }
          ]
        }
    })

    .state('event.tierReport', {
      url: '/tier-report',
      templateUrl: 'views/tierReport.html',
      controller: 'TierReportCtrl',
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

    .state('publicItemsEventList', {
      url: '/events/public',
      templateUrl: 'views/public-items-event-list.html',
      controller: 'PublicItemsEventListCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.VIEW }
        ]
      }
    })

    .state('publicItemsEvent', {
      url: '/event/{eventId}/public',
      templateUrl: 'views/public-items-event.html',
      controller: 'PublicItemsEventCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.VIEW }
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

    .state('requestedItems', {
      url: '/event/{eventId}/requested-items',
      templateUrl: 'views/requested-items.html',
      controller: 'RequestedItemCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER },
          {code: 2200, role: APP_ROLES.WS_MANAGER }
        ]
      }
    })

    .state('itemCategory', {
      url: '/event/{eventId}/item-category',
      templateUrl: 'views/item-category.html',
      controller: 'ItemCategoryCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.EDIT_ITEM_CATEGORIES }
        ]
      }
    })

    .state('event.skill-participants-override', {
      url: '/skill-participants-override',
      templateUrl: 'views/event-skill-particpants-override.html',
      controller: 'EventSkillParticipantsOverrideCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.EDIT_CONFIG }
        ]
      }
    })

    .state('recommendations', {
      url: '/event/{eventId}/recommendations',
      templateUrl: 'views/recommendations.html',
      controller: 'RecommendationsCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.ORGANIZER },
          {code: 2200, role: APP_ROLES.WS_MANAGER }
        ]
      }
    })

    .state('ping', {
      url: '/ping'
    });

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

  });

  ilApp.run(function($rootScope, $state,$timeout, $stateParams, auth, WSAlert, $templateCache, $translate, $http, amMoment, tmhDynamicLocale, uibDatepickerPopupConfig){

    $rootScope.available_languages = {"en":"English", "fr":"Français"};

    var activeLanguage = $translate.use() ||
      $translate.storage().get($translate.storageKey()) ||
      $translate.preferredLanguage();

    $http.defaults.headers.common["Accept-Language"] = activeLanguage;
    amMoment.changeLocale(activeLanguage);
    tmhDynamicLocale.set(activeLanguage);

    //Set global translations of to uiboostrapDatepicker
    $rootScope.$on('$translateChangeSuccess', function () {
      var activeLanguage = $translate.use();
      $http.defaults.headers.common["Accept-Language"] = activeLanguage;
      tmhDynamicLocale.set(activeLanguage);

      $translate(['DATEPICKER.CLOSE', 'DATEPICKER.TODAY', 'DATEPICKER.CLEAR'])
      .then(function (translations) {
        uibDatepickerPopupConfig.closeText = translations['DATEPICKER.CLOSE'];
        uibDatepickerPopupConfig.currentText = translations['DATEPICKER.TODAY'];
        uibDatepickerPopupConfig.clearText = translations['DATEPICKER.CLEAR'];
      }).catch(function (translationsId) {
        uibDatepickerPopupConfig.closeText = translationsId['DATEPICKER.CLOSE'];
        uibDatepickerPopupConfig.currentText = translationsId['DATEPICKER.TODAY'];
        uibDatepickerPopupConfig.clearText = translationsId['DATEPICKER.CLEAR'];
      });
    });

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

})();
