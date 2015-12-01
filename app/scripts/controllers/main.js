'use strict';

angular.module('ilApp')
  .controller('MainCtrl', function ($q, $scope, Auth, $state, $rootScope, APP_ROLES, $translate, Language, auth, WSAlert, Events, User) {
    $scope.selectedLanguage = Language.selectedLanguage;    

    

    // $scope.events = Events;
    // $scope.statuses = Statuses;
    // $scope.loading = {};    

    $scope.activeRole = {};
    $scope.ilRoles = {};
    
    // $scope.access = {
    //     'skill': false,
    //     'sector': false,
    //     'competition': false
    // };

    $scope.selectedSkill = {};
    $scope.selectedSector = {};
    $scope.skill_id, $scope.event_id;
    $scope.loading = { overview: true };    

    $scope.reloadSkill = function(){
        $scope.selectedSkill = $q.defer();

        $scope.activeRole = Auth.activeRole();
        User.getSkill().then(function(result){
            $scope.skill_id = result.id;
            $scope.event_id = result.event.id;     
            $scope.selectedSkill.resolve(result);            
            $scope.selectedSkill = result;       
        },
        function(error){
            WSAlert.danger(error);
            $scope.selectedSkill.reject(error);
        });

        return $scope.selectedSkill.promise;
    }

    $scope.reloadSector = function(){
        $scope.selectedSector = $q.defer();

        $scope.activeRole = Auth.activeRole();
        User.getSector().then(function(result){
            $scope.selectedSector.resolve(result);            
            $scope.selectedSector = result;       

            $scope.sector_id = $scope.selectedSector.id;
            $scope.event_id = $scope.selectedSector.event;  

            //load skills in sector for this event
            Events.getSkillsForSector($scope.sector_id, $scope.event_id).then(function(result){
                $scope.skills = result;
            },
            function(error){
                WSAlert.danger(error);
            });
        },
        function(error){
            WSAlert.danger(error);
            $scope.selectedSector.reject(error);
        });

        return $scope.selectedSector.promise;
    };

    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        $scope.init(toState);
    });

    $scope.init = function(toState){        
        $scope.loading.overview = true;

        $q.when(auth.user.$promise).then(function(){
            $scope.loading.overview = false;
            
            $scope.activeRole = Auth.activeRole();
            if(toState.name == 'home'){
                $scope.ilRoles = Auth.ilRoles();

                switch($scope.activeRole){
                    case APP_ROLES.WS_MANAGER:
                        //get skill
                        $scope.reloadSkill().then(function(result){
                            $scope.selectedSkill = result;
                            $state.go('skill.overview', {'skillId': result.id});                        
                        });
                    break;
                    case APP_ROLES.WS_SECTOR_MANAGER:
                        //get sector
                        $scope.reloadSector().then(function(result){                            
                            $scope.selectedSector = result;

                        });
                    break;
                    case APP_ROLES.ORGANIZER:
                    break;
                    case APP_ROLES.ADMIN:
                    break;
                    default:
                    break;
                }//switch
            }//if
        });
    };

  });
