// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs

(function ()
{
    $(document).foundation();

    var ubeatApp = angular.module('ubeat', ['ngRoute', 'controllers', 'ngIncludeResp', 'slick']);
    //var foundationModule =  angular.module('foundation', ['mm.foundation']);

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
                });
        }]);


})();