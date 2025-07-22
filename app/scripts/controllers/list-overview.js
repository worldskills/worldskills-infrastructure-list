'use strict';

angular.module('ilApp')
  .controller('ListOverviewCtrl', function ($scope, $q, $state, $stateParams, auth, Status, Events, List, WSAlert, APP_ID, APP_ROLES, MULTIPLIERS, Reporting) {

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
        var basePositionIds = [
            26, // Skill Competition Manager
            2, // Chief Expert
            3, // Deputy Chief Expert
            7, // Workshop Manager
            8, // Workshop Sector Manager
        ];
        Events.getSkillManagement($scope.list.skill.id).then(function(res){
          $scope.skillManagement = res.data.person_positions;
          // sort by base position ID
          $scope.skillManagement.sort(function (a, b) {
              return basePositionIds.indexOf(a.position.base_position_id) - basePositionIds.indexOf(b.position.base_position_id);
          });
        }, function(error){
          WSAlert.warning("Could not get skill management information");
        });
      }

    });


    $scope.renameList = function() {
      var name = window.prompt('New name for new list?', $scope.list.name.text);
      if (name !== null) {
        $scope.list.name.text = name;
        List.update($scope.list, function (list) {
          WSAlert.success('The list has been successfully updated.');
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
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
