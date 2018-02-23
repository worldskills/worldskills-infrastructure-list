'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, Events, Items, Downloader, ITEM_STATUS, ITEM_STATUS_TEXT, WSAlert, UPLOADS_URL, Auth, APP_ROLES, $aside) {

    $scope.eventId = $state.params.eventId;
    $scope.skillId = $state.params.skillId;
    $scope.UPLOADS_URL = UPLOADS_URL;
    $scope.participantNumbers = {};
    $scope.skillManagement = {};

    $scope.ITEM_STATUS = ITEM_STATUS;
    $scope.ITEM_STATUS_TEXT = ITEM_STATUS_TEXT;

    $scope.loading = true;

    var promises = [];
    var categoriesIndexed = {};

    promises.push(Events.getSkill($scope.skillId)
        .then(function(result){
            $scope.skill = result;
        }));

    promises.push(Items.getCategories($scope.skillId)
        .then(function(result){
            $scope.categories = result;
            angular.forEach($scope.categories, function (category) {
                category.items = [];
                categoriesIndexed[category.id] = category;
            });
        }));

    promises.push(Events.getSkillManagement($state.params.skillId).then(function(res){
        $scope.skillManagement = res.data.person_positions;
      }));

  promises.push(Events.getParticipantCounts($scope.skillId).then(function (res) {
      $scope.participantNumbers = res;
    }));


    $q.all(promises).then(function () {
        Items.getPublicItems($scope.eventId, $scope.skillId)
            .then(function(result) {
                angular.forEach(result, function (item) {
                    if (typeof categoriesIndexed[item.category] !== 'undefined') {
                        categoriesIndexed[item.category].items.push(item);
                        angular.forEach(item.child_items, function (child) {
                            categoriesIndexed[item.category].items.push(child);
                        });
                    }
                });
                $scope.loading = false;
            });
    });

    $scope.downloadFile = function(file){
      Downloader.handleDownload(data, status, headers, filename);
    };

    $scope.canRecommend = function() {
        return Auth.hasRole(APP_ROLES.ADMIN) || Auth.hasRole(APP_ROLES.RECOMMEND);
    }

    $scope.suggestAddition = function (parent) {  
        $scope.addParent = parent || 0;
        var parent = parent || 0;
  
        $scope.asideState = {
          open: true,
        };
  
        function postClose() {
          $scope.asideState.open = false;
        }
  
        $aside.open({
          templateUrl: 'views/recommendedItemAside.html',
          placement: 'right',
          size: 'lg',
          scope: $scope,
          backdrop: true,
          controller: 'recommendedItemAsideCtrl',
        }).result.then(postClose, postClose);
      };

      $scope.suggestModification = function (parent, item) {  
        $scope.addParent = parent || 0;
        var parent = parent || 0;

        $scope.item = item;
  
        $scope.asideState = {
          open: true,
        };
  
        function postClose() {
          $scope.asideState.open = false;
        }
  
        $aside.open({
          templateUrl: 'views/recommendedItemAside.html',
          placement: 'right',
          size: 'lg',
          scope: $scope,
          backdrop: true,
          controller: 'recommendedItemAsideCtrl',
        }).result.then(postClose, postClose);
      };

});
