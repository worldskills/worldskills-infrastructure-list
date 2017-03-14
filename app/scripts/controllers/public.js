'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, Events, Items, Downloader, ITEM_STATUS, WSAlert, UPLOADS_URL) {

    $scope.eventId = $state.params.eventId;
    $scope.skillId = $state.params.skillId;
    $scope.UPLOADS_URL = UPLOADS_URL;

    $scope.ITEM_STATUS = ITEM_STATUS;

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

});
