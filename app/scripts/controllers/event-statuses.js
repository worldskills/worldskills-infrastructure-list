(function() {
  'use strict';

  angular.module('ilApp').controller('EventStatusesCtrl', function ($scope, $q, $translate, $state, $stateParams, Events, Status, $uibModal, WSAlert) {

    Status.getAllStatuses($stateParams.eventId).then(function (result) {
      $scope.statuses = result;
    });

    $scope.saveStatus = function () {
      if ($scope.status.id) {
        Status.update($scope.status, function (status) {
          WSAlert.success('The Status has been updated.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      } else {
        Status.save({eventId: $stateParams.eventId}, $scope.status, function (status) {
          WSAlert.success('The Status has been added.');
          $state.go('.', {}, {reload: true});
        }, function (error) {
          WSAlert.danger(error.data.user_msg);
        });
      }
    };

    $scope.closeModal = function () {
      $scope.statusModal.dismiss('cancel');
    };

    $scope.create = function () {
      $scope.status = {
        name: {
          text: '',
          lang_code: $translate.use()
        },
        color_code: '#5cb85c',
        description: {
          text: '',
          lang_code: $translate.use()
        },
        allow_editing: true,
        show_in_public_view: true
      };
      $scope.statusModal = $uibModal.open({
        animation: false,
        templateUrl: 'views/event-statuses-modal.html',
        scope: $scope
      });
    };

    $scope.edit = function (status) {
      $scope.status = status;
      $scope.statusModal = $uibModal.open({
        animation: false,
        templateUrl: 'views/event-statuses-modal.html',
        scope: $scope
      });
    };

    $scope.deleteStatus = function (status) {
      if (confirm('Delete Status?')) {
         Status.delete({id: status.id}, function () {
             WSAlert.success('The Status has been deleted.');
             $state.go('.', {}, {reload: true});
         }, function (error) {
             if (error.status == 409) {
               window.alert(error.data.user_msg);
             } else {
               window.alert('An error has occured: ' + JSON.stringify(error.data));
             }
         });
      }
    };

  });

})();
