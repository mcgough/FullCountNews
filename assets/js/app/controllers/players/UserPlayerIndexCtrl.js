PlayerTracker.controller('UserPlayerIndexCtrl',['$scope','$resource','$http','UserService','$q','$mdDialog','$location',function($scope,$resource,$http,UserService,$q,$mdDialog,$location){

  $scope.UserService = UserService;

  $scope.currentUser = UserService.currentUser;

  $scope.$watchCollection('UserService',function(){
    $scope.currentUser = UserService.currentUser;
    if($scope.currentUser === false){
      $location.path('/');
    }
  });

  var Player = $resource('/api/userlist/:id'),
      Db = $resource('/api/playerdb/:id'),
      Headline = $resource('/api/headline/:id'),
      playerList;

  $http.get('/api/playerdb/getAllPlayers').success(function(response) {
    playerList = response;
  });

  //autocomplete function
  $scope.getMatches = function(){
    var letterCount = $scope.searchText.length,
        search = $scope.searchText,
        list = playerList,
        options = [];
    if (letterCount % 2 !== 0) {
      for (var i = 0; i < list.length; i++) {
        var name = list[i].name.slice(0,letterCount);
        if (name.toLowerCase() === search.toLowerCase()) {
          options.push(list[i]);
        }
      }
      return options;
    } else {
      return false;
    }
  };

  $scope.findPlayer = function(item) {
    if (item) {
      $scope.searchText = '';
      var player = item;
      $http.get('/api/playerdb/getPlayerStats',
        {params:{
          name: player.name,
          url: player.url
        }})
      .success(function(response) {
        var player = response,
            user = new Player();
        user.$save({userId:$scope.currentUser.id,player:player}, function(response) {
          $scope.playerList.push(player);
        });
      });
    }
  };

  //loads users players and updates their stats
  $scope.loadUserList = function() {
    $http.get('/api/userlist/updateUserlistStats')
      .success(function(response) {
        var playerList = response.map(function(obj) {
          return JSON.parse(obj.player);
        });

        $scope.playerList = playerList;
        $scope.getHeadlines();

      });
  };


  //delete button function
  $scope.deletePlayer = function(playerId){
    $http.delete('/api/userlist/deletePlayer',{params:{id:playerId}})
    .success(function(data){
      console.log(data);
      // $scope.loadUserList();
    });
  };


  // compares headlines to user players last name
  $scope.getHeadlines = function(){
    $scope.loading = true;
    Headline.query({},function(data){
      $scope.news = data;
    });
    $scope.loading = false;
  };

  $scope.loadUserList();

  $scope.showDialog = function($event) {
    var parentEl = angular.element(document.body);
     $mdDialog.show({
       parent: parentEl,
       // targetEvent: $event,
       templateUrl: '/views/headlines/headlineDialog.html',
       locals: {
         headline: $event
       },
       controller: 'DialogController'
    });
  };

}]);