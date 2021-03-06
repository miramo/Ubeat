// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs

(function ()
{
    $(document).foundation();

    var ubeatApp = angular.module('ubeat', ['ngRoute', 'mainControllers', 'pagesControllers', 'templatesControllers',
        'ngIncludeResp', 'slick', 'LocalStorageModule', 'headroom', 'angular-md5', 'ui.slider']);

    ubeatApp.config(['$routeProvider',
        function ($routeProvider)
        {
            $routeProvider
                .when('/',
                {
                    templateUrl: 'views/pages/home.html',
                    controller : 'HomeController'
                })
                .when('/album/:id',
                {
                    templateUrl: 'views/pages/album.html',
                    controller : 'AlbumController'
                })
                .when('/artist/:id',
                {
                    templateUrl: 'views/pages/artist.html',
                    controller : 'ArtistController'
                })
                .when('/user/:id',
                {
                    templateUrl: 'views/pages/single-user.html',
                    controller : 'SingleUserController'
                })
                .when('/playlists/',
                {
                    templateUrl: 'views/pages/playlists.html',
                    controller : 'PlaylistsController'
                })
                .when('/error/',
                {
                    templateUrl: 'views/pages/error.html',
                    controller : 'ErrorPageController'
                })
                .when('/queue/',
                {
                    templateUrl: 'views/pages/play-queue.html',
                    controller : 'PlayQueueController'
                })
                .when('/search/:element',
                {
                    templateUrl: 'views/pages/search.html',
                    controller : 'SearchController'
                })
                .when('/search/',
                {
                    templateUrl: 'views/pages/search.html',
                    controller : 'SearchController'
                })
                .otherwise({
                    redirectTo: '/error/',
                    controller: 'ErrorPageController'
                });
        }]);


})();