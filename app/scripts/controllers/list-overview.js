'use strict';

angular.module('ilApp')
  .controller('ListOverviewCtrl', function ($scope, $q, $state, $stateParams, Status, Events, WSAlert, MULTIPLIERS, Reporting) {

    $scope.loading.overview = true;

    $scope.exportList = function(){
        Reporting.exportRequestedForList($scope.event_id, $scope.listId);
    };

    $scope.totalItems = 0;
    $scope.statusSummary = {};
    $scope.skillManagement = {};

    Status.getSummaryForList($stateParams.listId).then(function(res){
      //calculate total for percentage
      angular.forEach(res, function(val, key){
        $scope.totalItems += val.count;
      });

      $scope.statusSummary = res;
      $scope.loading.overview = false;
    },
    function(error){
      WSAlert.warning(error);
    });

    $scope.list.$promise.then(function () {

      if ($scope.list.skill) {
        Events.getSkillManagement($scope.list.skill.id).then(function(res){
          $scope.skillManagement = res.data.person_positions;
        }, function(error){
          WSAlert.warning("Could not get skill management information");
        });
      }

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
