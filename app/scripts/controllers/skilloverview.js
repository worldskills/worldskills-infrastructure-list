'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillOverviewCtrl
 * @description
 * # SkillOverviewCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillOverviewCtrl', function ($scope, $q, WSAlert, MULTIPLIERS, Reporting) {

    
    $scope.exportSkill = function(){
        Reporting.exportRequestedForSkill($scope.event_id, $scope.skill_id);
    };

    $scope.exportEvent = function(){
        Reporting.exportRequestedForEvent($scope.event_id);
    };

    /*
    FROM people - to be used to move the item editor in place
    //edit DOM to move the editor element to the right place
        var editRow, editor;
        editRow = angular.element("#history_" + id);
        editor = angular.element("#historyEditor").hide();
        
        //animate
        editRow.toggleClass('well').append(editor);
        editor.fadeIn();                */
  	
  });
