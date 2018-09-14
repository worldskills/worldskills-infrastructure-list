'use strict';

/**
 * @ngdoc service
 * @name ilApp.WSAlert
 * @description
 * # WSAlert
 * Service in the ilApp.
 */
angular.module('ilApp')
.service('WSAlert', function WSAlert($timeout, $location, $anchorScroll) {
    $anchorScroll.yOffset = 50;

    // AngularJS will instantiate a singleton by calling "new" on this function
    var addMessage = function(type){
        return function(title, text, displayed, scroll){
            var msg = {
                'type': type,
                'title': title,
                'text': text,
                'displayed': displayed || false
            };
            scroll = (typeof scroll !== 'undefined') ? scroll : true;

            this.messages.push(msg);
            var _this = this;
            
            //scroll to alerts
            if (scroll) {
              $location.hash('alertScrollAnchor');
              $anchorScroll();
            }

            //clear message automatically in 7.5 seconds
            $timeout(function(){
                msg.displayed = true;
                _this.clear();
            }, 7500);
        };
    };

    this.messages = [];
    this.success = addMessage('success');
    this.warning = addMessage('warning');
    this.info = addMessage('info');
    this.danger = addMessage('danger');

    this.setAllDisplayed = function(){      
        angular.forEach(this.messages, function(message){
            message.displayed = true;
        });
    };

    this.clear = function(){
        var messages = [];
        angular.forEach(this.messages, function(message){
            if(!message.displayed){
                messages.push(message);
            }
        });
        this.messages = messages;
    };
  });
