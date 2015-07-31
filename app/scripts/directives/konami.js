'use strict';

angular.module('ilApp')
  .directive('konami', function () {
    return {
    restrict: "AEC",
    controller: function ($scope) {
      $scope.executeKonami = function () {
        //add custom konami fun below
        //you also need to add <konami/> to any view you want to enable to konami code in
        $.getScript('http://www.cornify.com/js/cornify.js',function(){
          cornify_add();
          $(document).keydown(cornify_add);
        }); 
        //end konami fun
      }
    },
    link: function (scope, element, attrs) {
      
      var kon_index = 0,
      kon_keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
      
      $(document).keydown(function(e){
        if (e.keyCode === kon_keys[kon_index++]) {
          console.log(e.keyCode);
          if (kon_index === kon_keys.length) {
            scope.executeKonami();
          }
        } else {
          kon_index = 0;
        }
      });
    }
  }
  });