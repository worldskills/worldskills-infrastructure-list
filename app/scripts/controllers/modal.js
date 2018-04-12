'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller handling modals
 */
angular.module('ilApp')
  .controller('ModalCtrl', function ($scope, $uibModalInstance) {

    $scope.ok = function () {
      $uibModalInstance.close($scope);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  });
