'use strict';

angular.module('ilApp').controller('SuppliedItemImportCtrl', function ($scope, $state, FileUploader, WSAlert, auth, API_IL) {

  $scope.importing = false;

  $scope.uploader = new FileUploader({
    url: API_IL + '/items/' + $state.params.eventId + '/supplied_items_import',
    headers: {
      Authorization: 'Bearer ' + auth.accessToken
    }
  });

  $scope.uploader.onCompleteItem = function (item, response, status) {
    $scope.importing = false;
    if (status === 200) {
      WSAlert.success('Products have been imported');
      $state.go('eventBase.catalogue', {}, {reload: true});
    } else {
      WSAlert.danger('Import failed: ' + JSON.stringify(response));
    }
  };

  $scope.importSuppliedItems = function () {
    $scope.importing = true;
    $scope.uploader.uploadAll();
  };

});
