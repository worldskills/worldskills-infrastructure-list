'use strict';

angular.module('ilApp')
  .controller('MainCtrl', function (
    $q, $scope, Auth, $state, $rootScope, APP_ROLES, $translate, Language, auth, WSAlert, Events, User
  ) {
    $scope.selectedLanguage = Language.selectedLanguage;

    //inherited $scope.activePosition
    $scope.ilRoles = {};

    $scope.selectedSkill = {};
    $scope.selectedSector = {};
    $scope.selectedEvent = {};
    $scope.appLoaded = $q.defer();
    $scope.loadStatus = true;

    $scope.hideFooter = false;


    $scope.skill_id, $scope.event_id;

    $scope.reloadSector = function () {
      var deferred = $q.defer();

      //load skills in sector for this event
      Events.getSkillsForSector($scope.sector_id, $scope.event_id, $scope.loadStatus).then(function (result) {
        $scope.skills = result;
        deferred.resolve();
      },
      function (error) {
        deferred.reject("Could not load skills for sector: " + error.data.user_msg);
      });

      return deferred.promise;
    };

    $scope.reloadEvent = function () {
      var deferred = $q.defer();

      //load skills in sector for this event
      Events.getSkillsForEvent($scope.event_id, $scope.loadStatus).then(function (result) {
        $scope.skills = result;
        deferred.resolve();
      },
      function (error) {
        deferred.reject("Could not load skills for event: " + error);
      });

      return deferred.promise;

    };

    //observes the activePosition scope var
    $scope.$watch('activePosition', function(pos){
      $scope.loadActivePosition(pos, null);
    });


    $scope.loadActivePosition = function(pos, $event){
      if($event !== null && $event !== undefined) $event.preventDefault();

      $scope.loading.init = true;

      //if position differs, set a new active position (called from home.html position selector)
      //not the prettiest solution, but hey...
      if(pos !== $scope.activePosition) $scope.setActivePosition(pos);

      //init promise
      if(!$scope.appLoaded.promise)
        $scope.appLoaded = $q.defer();


      //load item from session storage if needed
      if($scope.activePosition.id === undefined && pos.id === undefined){

        if(sessionStorage.getItem('active_position_id') !== null) {
          //check that active positions has loaded
          $q.when(User.activePositions.promise).then(function(res){
            angular.forEach(User.activePositions, function(val){
              if(val.id == sessionStorage.getItem('active_position_id')) {
                //resolve if still a promise
                if($scope.$parent.activePosition.promise)
                  $scope.$parent.activePosition.resolve(val);

                $scope.$parent.activePosition = val;
              }
            });
          });
        }
        else{
           $scope.loading.init = false; //stop loading to show position selection
           //automatically select the first active competition - this skips the selection, but it's shown on the navigation anyway, fixes catalogue loading errors
           $q.when(User.activePositions.promise).then(function(res){
             //resolve if still a promise
             if($scope.$parent.activePosition.promise)
               $scope.$parent.activePosition.resolve(res[0]);

             $scope.$parent.activePosition = res[0];
          });
       }
      }
      else {
        $scope.selectedSkill = {};
        $scope.selectedEvent = {};
        $scope.selectedSector = {};

        //redirect if in home
         if($state.current.name == 'home') $scope.redirectNeeded = true;


        if($state.current.name === 'event.catalogue')
          $scope.loadStatus = false;

        if (pos.role == APP_ROLES.WS_SECTOR_MANAGER) {
          $scope.selectedEvent = pos.event;
          $scope.selectedSector = pos.sector;
          $scope.sector_id = pos.sector.id;
          $scope.event_id = pos.sector.event.id;

          $scope.reloadSector().then(function(res){
              $scope.loading.init = false;
              $scope.appLoaded.resolve();

              if($scope.redirectNeeded)
                $state.go('event.overview', {eventId: $scope.selectedSector.event.id});
            },
            function(error){
              WSAlert.danger(error);
              $scope.appLoaded.reject();
              $scope.loading.init = false;
            });
        }
        else if (pos.role == APP_ROLES.WS_MANAGER) {

          $scope.selectedSkill = pos.skill;
          $scope.selectedEvent = pos.event;
          $scope.skill_id = pos.skill.id;
          $scope.event_id = pos.skill.event.id;
          $scope.loading.init = false;
          $scope.appLoaded.resolve();

          if($scope.redirectNeeded)
            $state.go('event.skill.overview', {eventId: $scope.selectedSkill.event.id, skillId: $scope.selectedSkill.id});
        }
        else if (pos.role == APP_ROLES.ORGANIZER) {
          $scope.selectedEvent = pos.event;

          Events.id = $scope.selectedEvent.id;
          Events.data = $scope.selectedEvent;

          $scope.event_id = $scope.selectedEvent.id;

          $scope.reloadEvent().then(function(res){
              $scope.loading.init = false;
              $scope.appLoaded.resolve();

              if($scope.redirectNeeded)
                $state.go('event.overview', {eventId: $scope.selectedEvent.id});
            },
            function(error) {
              $scope.loading.init = false;
              WSAlert.danger(error);
              $scope.appLoaded.reject();
            });
        }
      }
    };

    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
      if(toState.name == 'event.catalogue') $scope.hideFooter = true;
      else $scope.hideFooter = false;
      // if (fromState.name === "") {
      //   // The initial transition comes from "root", which uses the empty string as a name.
      //   alert("initial state: " + toState.name);
      // }
    });

  });
