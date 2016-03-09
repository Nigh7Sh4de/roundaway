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

roundawayApp.controller('roundawayCtrl', roundawayCtrl);
roundawayApp.controller('homeCtrl', homeCtrl);
roundawayApp.controller('loginCtrl', loginCtrl);
