'use strict';

angular.module('ilApp').controller('PublicItemsCtrl', function ($scope, $state, $q, Events, Items, ITEM_STATUS, WSAlert) {

    $scope.eventId = $state.params.eventId;
    $scope.skillId = $state.params.skillId;

    $scope.ITEM_STATUS = ITEM_STATUS;

    $scope.loading = true;

    var promises = [];
    var categoriesIndexed = {};

    promises.push(Events.getSkill($scope.skillId)
        .then(function(result){
            $scope.skill = result;
        }, function(error){
            WSAlert.danger(error);
        }));

    promises.push(Items.getCategories($scope.skillId)
        .then(function(result){
            $scope.categories = result;
            angular.forEach($scope.categories, function (category) {
                category.items = [];
                categoriesIndexed[category.id] = category;
            });
        }, function(error){
            WSAlert.danger(error);
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
            }, function(error) {
                WSAlert.danger(error);
            });
    });

});
