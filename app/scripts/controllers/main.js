'use strict';

angular.module('ilApp')
  .controller('MainCtrl', function ($q, $scope, Auth, $state, $rootScope, $translate, Language, auth, WSAlert, User) {
    $scope.selectedLanguage = Language.selectedLanguage;    

    

    // $scope.events = Events;
    // $scope.statuses = Statuses;
    // $scope.loading = {};    

    $scope.activeRole = {};
    
    $scope.access = {
        'skill': false,
        'sector': false,
        'competition': false
    };

    $scope.selectedSkill = {};
    $scope.skill_id, $scope.event_id;

    $scope.reload = function(){
        $scope.selectedSkill = $q.defer();

        $scope.activeRole = Auth.activeRole();
        User.getSkill().then(function(result){
            $scope.selectedSkill.resolve(result);            
            $scope.selectedSkill = result;       

            $scope.skill_id = $scope.selectedSkill.id;
            $scope.event_id = $scope.selectedSkill.event.id;     
        },
        function(error){
            WSAlert.danger(error);
            $scope.selectedSkill.reject(error);
        });

        return $scope.selectedSkill.promise;
    }

    $scope.init = function(){        
        $q.when(auth.user.$promise).then(function(){
            $scope.activeRole = Auth.activeRole();
            if($state.current.name == 'home'){

                switch($scope.activeRole){
                    case 'Workshop Manager':
                        //get skill
                        $scope.reload().then(function(result){
                            //$scope.access.skill = result;
                            $scope.selectedSkill = result;
                            $state.go('skill.overview', {'skillId': result.id});                        
                        });
                    break;
                    case 'Sector Manager':
                    break;
                    case 'Organizing Committee':
                    break;
                    case 'Admin':
                    break;
                    default:
                    break;
                }//switch
            }//if
        });
    };

    $scope.init();
    
    
    
    // $scope.reloadUser = function(){
    //     //loading scope variables that can be used throughout the app
    //     $scope.user = User;        
    //     $scope.resources = Resources;

    
    //     $q.when(User.init()).then(function(){
    
    //         //load other resource
    //         var promises = [];
    //         promises.push(User.inbox());
    //         promises.push(User.getSubscriptions());
    //         promises.push(User.getConnections());
    //         promises.push(User.getRequested());
    //         promises.push(Resources.init());
    
    //         $q.all(promises).then(function(result){
    //             //console.log('loaded external resources');
    //             //User.data.subscriptions = result[1];
    //             //User.data.connections = result[2];
    //             //User.data.requested = result[3];
    //         },
    //         function(error){
    //             WSAlert.danger("Error loading user resources, please refresh your browser: " + error);
    //         });
    //         //event subscriptions
    //         //User.subscriptions($scope.user.data.id).then(function(res){
    //         //  //console.log('subscriptions loaded');
    //         //},
    //         //function(error){
    //         //  WSAlert.danger("", error);
    //         //});
    
    //         //load inbox        
    //         //loaded in chain because it gets saved within the user var
    //         //User.getInbox().then(function(result){
    //         //    $scope.user.inbox = result;
    //         //},
    //         //function(error){
    //         //    //fail silently
    //         //});
    //     },
    //     function(error){
    //         //WSAlert.danger("", error);
    //     });
    // };     

    // $scope.reloadUser();   
    
    // //load events
    // $scope.loading.events_init = true;
    // Events.init().then(function(result){
    // 	//console.log("events init");   
    //     $scope.loading.events_init = false; 	
    // },
    // function(error){
    // 	//WSAlert.danger("", error);
    //     $scope.loading.events_init = false;
    // });

    //  //load events
    // Statuses.init().then(function(result){
    //     //console.log("statuses init");       
    // },
    // function(error){
    //     WSAlert.danger("", "Could not fetch resources, please refresh or try again later.");
    // });

    // $scope.getProfileImage = function(image, type){
    //     var retval = false;
    //     if(typeof image == 'undefined' || typeof image.links == 'undefined') return false;
    //     type = (typeof type == 'undefined') ? "" : "_"+type;
    //     angular.forEach(image.links, function(val, key){
    //         if(val.rel == 'alternate'){ 
    //             retval = val.href + type;
    //         }
    //     });
    //     return retval;
    // };

    // $scope.getImage = function(image){
    //     var retval = false;

    //     if(typeof image == 'undefined' || typeof image.links == 'undefined') return false;        
    //     angular.forEach(image.links, function(val, key){
    //         if(val.rel == 'alternate'){ 
    //             retval = val.href;
    //         }
    //     });
    //     return retval;
    // };


  });
