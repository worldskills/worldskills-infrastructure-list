'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:editSuppliedItemCtrl
 * @description
 * # editSuppliedItemCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('editSuppliedItemCtrl', function ($scope, $uibModalInstance) {

    //close modal aside
    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

  });
