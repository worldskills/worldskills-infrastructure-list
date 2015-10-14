(function() {
    'use strict';

    //TODO update values when integrating with API
    
    var ilApp = angular.module('ilApp'); 
    ilApp.constant('API_IL', 'http://localhost:8080/il');
    ilApp.constant('API_PEOPLE', 'http://localhost:8080/people');
    ilApp.constant('APP_ID', '2200');
    ilApp.constant('API_IMAGES', 'http://localhost:8080/images');
    ilApp.constant('CLIENT_ID', '778a11aa2b30');
    ilApp.constant('API_AUTH', 'http://localhost:8080/auth');
    ilApp.constant('AUTHORIZE_URL', 'http://localhost:10100/oauth/authorize');
    ilApp.constant('LOGOUT_URL', 'http://localhost:10100/logout');

    ilApp.constant('DATE_FORMAT', 'yyyy-MM-ddThh:mm:ssZ');
    ilApp.constant('WORLDSKILLS_CLIENT_ID', '778a11aa2b30');
    ilApp.constant('WORLDSKILLS_API_AUTH', 'http://localhost:8080/auth');
    ilApp.constant('WORLDSKILLS_AUTHORIZE_URL', 'http://localhost:10100/oauth/authorize');

    ilApp.constant('APP_ROLES', {
        ADMIN: 'Admin',
        ORGANIZER: 'Organizing Committee',
        WS_MANAGER: 'Workshop Manager',
        WS_SECTOR_MANAGER: 'Workshop Sector Manager'
    });    

    ilApp.constant('POSITIONS', {
        WS_MANAGER: 10,
        WS_SECTOR_MANAGER: 11,
        ORGANIZER: 12
    });

    ilApp.constant('MULTIPLIERS', [
        {"id": "SKILL", "name" : "per Skill", "x_number_needed": false },
        {"id": "COMPETITORS", "name" : "per Competitor", "x_number_needed": false },
        {"id": "EXPERTS", "name" : "per Expert", "x_number_needed": false },
        {"id": "PER_NUM_COMPETITORS", "name" : "per every X Competitors", "x_number_needed": true },
        {"id": "PER_NUM_EXPERTS", "name" : "per every X Experts", "x_number_needed": true }
    ]);

})();