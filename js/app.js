// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs

(function ()
{
    $(document).foundation();

    var ubeatApp = angular.module('ubeat', ['ngRoute']);
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
                .when('/album',
                {
                    templateUrl: 'views/pages/album.html',
                    controller : 'AlbumController'
                })
                .when('/artist',
                {
                    templateUrl: 'views/pages/artist.html',
                    controller : 'ArtistController'
                });
        }]);

    ubeatApp.controller('MainController', function($scope)
    {

    });

    ubeatApp.controller('HomeController', function ($scope)
    {
    });

    ubeatApp.controller('AlbumController', function ($scope)
    {
    });

    ubeatApp.controller('ArtistController', function ($scope)
    {
    });


})();