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
    EDIT_REQUESTED_ITEMS: 'EditRequestedItems',
    EDIT_REQUESTED_ITEMS_ALWAYS: 'EditRequestedAlways',
    CREATE_SUPPLIED_ITEMS: 'CreateSuppliedItems',
    EDIT_SUPPLIED_ITEMS: 'EditSuppliedItems',
    EDIT_SUPPLIERS: 'EditSuppliers',
    EDIT_ITEM_CATEGORIES: 'EditItemCategories',
    EDIT_ITEM_STATUS: 'EditItemStatus',
    EDIT_CONFIG: 'EditConfig',
    RECOMMEND: 'Recommend',
    RECOMMEND_SUPPLIED: 'RecommendSupplied',
    VIEW: 'View',
    VIEW_ALWAYS: 'ViewAlways'
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
    "pcs": "unit_pieces",
    "t": "unit_tonnes",
    "kg": "unit_kilograms",
    "g": "unit_grams",
    "l": "unit_litres",
    "boxes": "unit_boxes",
    "boots": "unit_boots",
    "bottles": "unit_bottles",
    "sheets": "unit_sheets",
    "kits": "unit_kits",
    "m": "unit_metres",
    "cm": "unit_centimetres",
    "m2": "unit_square_metres",
    "m3": "unit_cubic_metres",
  });

  ilApp.config(function ($routeProvider, APP_ROLES, $translateProvider, $stateProvider, $urlRouterProvider, $httpProvider, tmhDynamicLocaleProvider) {

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
        $state.go('eventList');
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
            WSAlert.danger(rejection.data.user_msg);
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

    .state('eventBase', {
      url: '/events/{eventId}',
      templateUrl: 'views/event.base.html',
      controller: 'EventBaseCtrl',
      abstract: true,
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.VIEW }
          ]
        }
    })

    //catalogue
    .state('eventBase.catalogue', {
      url: '/catalogue',
      templateUrl: 'views/event.catalogue.html',
      controller: 'EventCatalogueCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.EDIT_SUPPLIED_ITEMS }
        ]
      }
    })

    .state('eventBase.revisions', {
      url: '/revisions',
      templateUrl: 'views/event.revisions.html',
      controller: 'EventRevisionsCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_CONFIG }
          ]
        }
    })

    .state('eventBase.clone', {
      url: '/clone',
      templateUrl: 'views/event.clone.html',
      controller: 'EventCloneCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_CONFIG }
          ]
        }
    })

    .state('eventBase.tierReport', {
      url: '/tier-report',
      templateUrl: 'views/tierReport.html',
      controller: 'TierReportCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_CONFIG }
          ]
        }
    })

    .state('eventBase.skillAreas', {
      url: '/skill-areas',
      templateUrl: 'views/event-skill-areas.html',
      controller: 'EventSkillAreasCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_CONFIG }
          ]
        }
    })

    .state('eventBase.categories', {
      url: '/categories',
      templateUrl: 'views/event-categories.html',
      controller: 'EventCategoriesCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_CONFIG }
          ]
        }
    })

    .state('eventBase.statuses', {
      url: '/statuses',
      templateUrl: 'views/event-statuses.html',
      controller: 'EventStatusesCtrl',
      data: {
        requireLoggedIn: true,
          requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_CONFIG }
          ]
        }
    })

    // lists
    .state('eventBase.list', {
      url: '/lists/{listId}',
      templateUrl: 'views/list.html',
      controller: 'ListCtrl',
      abstract: true,
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.EDIT_REQUESTED_ITEMS }
        ]
      }
    })

    .state('eventBase.list.overview', {
      url: '',
      templateUrl: 'views/list.overview.html',
      controller: 'ListOverviewCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_REQUESTED_ITEMS }
          ]
        }
    })

    .state('eventBase.list.category', {
      url: '/category/{categoryId}',
      templateUrl: 'views/list.category.html',
      controller: 'ListCategoryCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
            {code: 2200, role: APP_ROLES.ADMIN },
            {code: 2200, role: APP_ROLES.EDIT_REQUESTED_ITEMS }
          ]
        }
    })

    .state('eventList', {
      url: '/events',
      templateUrl: 'views/event-list.html',
      controller: 'EventListCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.VIEW }
        ]
      }
    })

    .state('event', {
      url: '/events/{eventId}',
      templateUrl: 'views/event.html',
      controller: 'EventCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.VIEW }
        ]
      }
    })

    .state('publicItems', {
      url: '/events/{eventId}/lists/{listId}/public',
      templateUrl: 'views/public-items.html',
      controller: 'PublicItemsCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.VIEW }
        ]
      }
    })

    .state('publicItemsSkill', {
      url: '/events/{eventId}/skills/{skillId}/public',
      controller: 'PublicItemsSkillCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.VIEW }
        ]
      }
    })

    .state('requestedItems', {
      url: '/events/{eventId}/requested-items',
      templateUrl: 'views/requested-items.html',
      controller: 'RequestedItemCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.EDIT_REQUESTED_ITEMS }
        ]
      }
    })

    .state('itemCategory', {
      url: '/events/{eventId}/item-category',
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

    .state('eventBase.skill-participants-override', {
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
      url: '/events/{eventId}/recommendations?list',
      templateUrl: 'views/recommendations.html',
      controller: 'RecommendationsCtrl',
      data: {
        requireLoggedIn: true,
        requiredRoles: [
          {code: 2200, role: APP_ROLES.ADMIN },
          {code: 2200, role: APP_ROLES.EDIT_SUPPLIED_ITEMS },
          {code: 2200, role: APP_ROLES.CREATE_SUPPLIED_ITEMS },
          {code: 2200, role: APP_ROLES.EDIT_REQUESTED_ITEMS }
        ]
      }
    })

    .state('ping', {
      url: '/ping'
    });

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

      $translate(['datepicker.close', 'datepicker.today', 'datepicker.clear'])
      .then(function (translations) {
        uibDatepickerPopupConfig.closeText = translations['datepicker.close'];
        uibDatepickerPopupConfig.currentText = translations['datepicker.today'];
        uibDatepickerPopupConfig.clearText = translations['datepicker.clear'];
      }).catch(function (translationsId) {
        uibDatepickerPopupConfig.closeText = translationsId['datepicker.close'];
        uibDatepickerPopupConfig.currentText = translationsId['datepicker.today'];
        uibDatepickerPopupConfig.clearText = translationsId['datepicker.clear'];
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
