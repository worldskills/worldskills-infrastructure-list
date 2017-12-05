(function() {
  'use strict';

  var ilApp = angular.module('ilApp');
  ilApp.constant('API_IL', 'http://localhost:8080/il');
  ilApp.constant('API_PEOPLE', 'https://dev-api.worldskills.org:12200/people');
  ilApp.constant('APP_ID', '2200');
  ilApp.constant('API_IMAGES', 'http://staging-api.worldskills.org/images');
  ilApp.constant('CLIENT_ID', 'bc9cf785283f');
  ilApp.constant('API_AUTH', 'https://dev-api.worldskills.org/auth');
  ilApp.constant('AUTHORIZE_URL', 'https://dev-auth.worldskills.org/oauth/authorize');
  ilApp.constant('LOGOUT_URL', 'https://dev-api.worldskills.org/logout');
  ilApp.constant('UPLOADS_URL', 'https://staging-il.worldskillsusercontent.org');

  ilApp.constant('DATE_FORMAT', 'yyyy-MM-ddThh:mm:ssZ');
  ilApp.constant('WORLDSKILLS_CLIENT_ID', 'bc9cf785283f');
  ilApp.constant('WORLDSKILLS_API_AUTH', 'https://dev-api.worldskills.org/auth');
  ilApp.constant('WORLDSKILLS_AUTHORIZE_URL', 'https://dev-auth.worldskills.org/oauth/authorize');


  ilApp.constant('LOAD_CHILD_ENTITY_ROLES', false);
  ilApp.constant('FILTER_AUTH_ROLES', [2200]);

  ilApp.constant('APP_ROLES', {
    ADMIN: 'Admin',
    ORGANIZER: 'Organizer',
    WS_MANAGER: 'Workshop Manager',
    WS_SECTOR_MANAGER: 'Sector Manager',
    VIEW: 'View'
  });

  ilApp.constant('MULTIPLIERS', [
    {"id": "SKILL", "name" : "per Skill", "x_number_needed": false },
    {"id": "COMPETITORS", "name" : "per Competitor", "x_number_needed": false },
    {"id": "EXPERTS", "name" : "per Expert", "x_number_needed": false },
    {"id": "PER_NUM_COMPETITORS", "name" : "per every X Competitors", "x_number_needed": true },
    {"id": "PER_NUM_EXPERTS", "name" : "per every X Experts", "x_number_needed": true }
  ]);

  ilApp.constant('ITEM_STATUS', {
    'RED': 1,
    'YELLOW': 2,
    'GREEN': 3,
    'BLACK': 4
  });

  ilApp.constant('ITEM_STATUS_TEXT', {
    'RED': "Requested",
    'YELLOW': "Pending",
    'GREEN': "Confirmed",
    'BLACK': "Secret"
  });

  ilApp.constant('MULTIPLIER_DEFAULT', 'SKILL');

})();
