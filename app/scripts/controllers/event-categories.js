(function() {
  'use strict';

  angular.module('ilApp').controller('EventCategoriesCtrl', function ($scope, $q, $translate, $state, $stateParams, Events, Category, WSAlert, SkillParticipantsOverride) {

    $scope.categories = Category.query({eventId: $stateParams.eventId});

    $scope.create = function () {
      var name = prompt('Category Name:');
      if (name !== null) {
        var category = {name: {lang_code: $translate.use(), text: name}, order: $scope.categories.categories.length + 1};
        Category.save({eventId: $stateParams.eventId}, category, function (category) {
          WSAlert.success('The Category has been added.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
    };

    $scope.edit = function (category) {
      var name = prompt('Category Name:', category.name.text);
      if (name !== null) {
        category.name.text = name;
        category.name.lang_code = $translate.use();
        Category.update({eventId: $stateParams.eventId, id: category.id}, category, function (category) {
          WSAlert.success('The Category has been updated.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
    };

    $scope.delete = function (category) {
      if (confirm('Delete Category?')) {
         Category.delete({eventId: $stateParams.eventId, id: category.id}, function () {
             WSAlert.success('The Category has been deleted.');
             $state.go('.', {}, {reload: true});
         }, function (error) {
             if (error.status == 409) {
               WSAlert.danger(error.data.user_msg);
             } else {
               window.alert('An error has occured: ' + JSON.stringify(error.data));
             }
         });
      }
    };

  });

})();
