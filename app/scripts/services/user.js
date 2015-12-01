'use strict';

/**
 * @ngdoc service
 * @name ilApp.User
 * @description
 * # User
 * Service in the ilApp.
 */
angular.module('ilApp')
  .factory('User', function ($q, $filter, $http, API_IL, auth, APP_ID, APP_ROLES, $timeout, API_PEOPLE, API_AUTH, POSITIONS) {

  		var User = {
            skill: false,
            sector: false,
            event: false
        };

  		User.getSkill = function(){
    		
            var deferred = $q.defer();

            //wait for auth.user to resolve                    
            $q.when(auth.user.$promise).then(function(){                                
                $http.get(API_PEOPLE + "/person/" + auth.user.person_id + "/positions").then(function(result){                    
                    angular.forEach(result.data.person_positions, function(val, key){
                        //TODO: Implement base positions and compare to the base position, check for the same entity in position and permission
                        if(val.position.id == POSITIONS.WS_MANAGER || val.position.id == POSITIONS.WS_MANAGER_ASSISTANT){
                            User.skill = val.skill;
                        }//if WSM / WSMA skill
                    });

                    if(User.skill !== false){ 
                        deferred.resolve(User.skill);
                    }
                },
                function(error){
                    deferred.reject("Could not fetch user skill: " + error.data.user_msg);
                })
            });    		

    		return deferred.promise;
    	};   

        User.getSector = function(){
            
            var deferred = $q.defer();

            //wait for auth.user to resolve                    
            $q.when(auth.user.$promise).then(function(){                                
                $http.get(API_PEOPLE + "/person/" + auth.user.person_id + "/positions").then(function(result){                    
                    angular.forEach(result.data.person_positions, function(val, key){
                        //TODO: Implement base positions and compare to the base position, check for the same entity in position and permission
                        if(val.position.id == POSITIONS.WS_SECTOR_MANAGER){
                            User.sector = val.sector;
                        }//if WSM
                    });

                    if(User.sector !== false){ 
                        deferred.resolve(User.sector);
                    }
                },
                function(error){
                    deferred.reject("Could not fetch user skill: " + error.data.user_msg);
                })
            });         

            return deferred.promise;
        };   

        User.getEvent = function(){
            
            var deferred = $q.defer();

            //wait for auth.user to resolve                    
            $q.when(auth.user.$promise).then(function(){                                
                $http.get(API_PEOPLE + "/person/" + auth.user.person_id + "/positions").then(function(result){                    
                    angular.forEach(result.data.person_positions, function(val, key){
                        //TODO: Implement base positions and compare to the base position, check for the same entity in position and permission
                        if(val.position.id == POSITIONS.ORGANIZER){
                            User.event = val.event;
                        }//if organizer
                    });

                    if(User.event !== false){ 
                        deferred.resolve(User.event);
                    }
                },
                function(error){
                    deferred.reject("Could not fetch user skill: " + error.data.user_msg);
                })
            });         

            return deferred.promise;
        };                        

        User.isAdmin = function(){
            var isAdmin = false;

            angular.forEach(auth.user.roles, function(val, key){
                if(val.role_application.application_code == APP_ID && val.name == APP_ROLES.ADMIN)              
                    isAdmin = true;
            });

            return isAdmin;

        };        


  	return User;  
  });
