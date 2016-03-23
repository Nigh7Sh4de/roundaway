var roundawayApp = roundawayApp || angular.module('roundawayApp', ['ngRoute']);

roundawayApp.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'homeCtrl'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
        })
        .when('/profile', {
            templateUrl: 'views/profile.html',
            controller: 'profileCtrl'
        });
})

var roundawayCtrl = function($scope, $http) {
    console.log('App started.');
    $http.get('/api/users/profile').then(function(res) {
        var profile = res.data;
        if (typeof profile == 'string')
            $scope.loggedin = false;
        else {
            $scope.loggedin = true;
        }
    })
}

var homeCtrl = function($scope) {
    console.log('Home page');
};

var loginCtrl = function($scope) {
    console.log('Login page');
};

var profileCtrl = function($scope, $http) {
    $http.get('/api/users/profile').then(function(res) {
        console.log(res);
        var profile = res.data;
        if (typeof profile == 'string')
            window.location = '/login';

        $scope.name = profile.name;
        if (profile.authid != null)
            $scope.SocialNetworks = {
                Google: profile.authid.google != null,
                Facebook: profile.authid.facebook != null
            }
    })
};

roundawayApp.controller('roundawayCtrl', roundawayCtrl);
roundawayApp.controller('homeCtrl', homeCtrl);
roundawayApp.controller('loginCtrl', loginCtrl);
roundawayApp.controller('profileCtrl', profileCtrl);
