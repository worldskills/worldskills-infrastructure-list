'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:SkillOverviewCtrl
 * @description
 * # SkillOverviewCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('SkillOverviewCtrl', function ($scope, $q, $state, Status, ITEM_STATUS, ITEM_STATUS_TEXT, WSAlert, MULTIPLIERS, Reporting) {


    $scope.exportSkill = function(){
        Reporting.exportRequestedForSkill($scope.event_id, $scope.skill_id);
    };

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.ITEM_STATUS_TEXT = ITEM_STATUS_TEXT;

    $scope.totalItems = 0;
    $scope.statusSummary = {};

    Status.getSummaryForSkill($state.params.skillId).then(function(res){
      //calculate total for percentage
      angular.forEach(res, function(val, key){
        $scope.totalItems += val.count;
      });

      $scope.statusSummary = res;
    },
    function(error){
      WSAlert.warning(error);
    });




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
