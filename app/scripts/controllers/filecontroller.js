'use strict';

/**
 * @ngdoc function
 * @name ilApp.controller:FileCtrl
 * @description
 * # FileCtrl
 * Controller of the ilApp
 */
angular.module('ilApp')
  .controller('FileCtrl', function ($scope, auth, FileUploader, API_IL, WSAlert, $timeout) {

    var uploader = $scope.uploader = new FileUploader({
      url: API_IL + "/items/" + $scope.event_id + "/supplied_items/" + $scope.item.id + "/upload",
      headers: {
        Authorization: 'Bearer ' + auth.accessToken
      }
    })

    //callbacks for debug

    // uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
    //   console.info('onWhenAddingFileFailed', item, filter, options);
    // };
    // uploader.onAfterAddingFile = function(fileItem) {
    //   console.info('onAfterAddingFile', fileItem);
    // };
    // uploader.onAfterAddingAll = function(addedFileItems) {
    //   console.info('onAfterAddingAll', addedFileItems);
    // };
    // uploader.onBeforeUploadItem = function(item) {
    //   console.info('onBeforeUploadItem', item);
    // };
    // uploader.onProgressItem = function(fileItem, progress) {
    //   console.info('onProgressItem', fileItem, progress);
    // };
    // uploader.onProgressAll = function(progress) {
    //   console.info('onProgressAll', progress);
    // };
    // uploader.onSuccessItem = function(fileItem, response, status, headers) {
    //   console.info('onSuccessItem', fileItem, response, status, headers);
    // };
    // uploader.onErrorItem = function(fileItem, response, status, headers) {
    //   console.info('onErrorItem', fileItem, response, status, headers);
    // };
    // uploader.onCancelItem = function(fileItem, response, status, headers) {
    //   console.info('onCancelItem', fileItem, response, status, headers);
    // };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
      console.info('onCompleteItem', fileItem, response, status, headers);
      //push file and update row
      $scope.item.files.push(response);
      angular.extend($scope.rowItem, $scope.item);
    };

    uploader.onCompleteAll = function() {
      console.info('onCompleteAll');
      if(uploader.progress == 100) {
        $timeout(function () {
          //reload item
          uploader.clearQueue();
        }, 1000)
      }
    };

    console.info('uploader', uploader);

  });
