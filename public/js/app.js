var roundawayApp = roundawayApp || angular.module('roundawayApp', ['ngRoute']);

roundawayApp.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider
        .when('/home', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'loginCtrl'
        })
        .when('/profile', {
            templateUrl: 'profile.html',
            controller: 'profileCtrl'
        });
})

var roundawayCtrl = function($scope) {
    console.log('App started.');
}

var homeCtrl = function($scope) {
    console.log('Home page');
};

var loginCtrl = function($scope) {
    console.log('Login page');
};

var profileCtrl = function($scope, $http) {
    console.log('Profile page');
    $http.get('/api/profile').then(function(res) {
        var profile = res.data;
        $scope.name = profile.name;
    })
};

roundawayApp.controller('roundawayCtrl', roundawayCtrl);
roundawayApp.controller('homeCtrl', homeCtrl);
roundawayApp.controller('loginCtrl', loginCtrl);
roundawayApp.controller('profileCtrl', profileCtrl);
