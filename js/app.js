// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs

(function ()
{
    $(document).foundation();

    var ubeatApp = angular.module('ubeat', ['ngRoute', 'mainControllers', 'pagesControllers', 'templatesControllers',
                                            'ngIncludeResp', 'slick', 'LocalStorageModule']);

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
                .otherwise({
                    redirectTo: '/error/',
                    controller: 'ErrorPageController'
                });
        }]);


})();