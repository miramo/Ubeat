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

    ubeatApp.controller('MainController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('MainController ChangeSuccess');
            $("body").css("background-image","none");
            // call your functions here
        });
    });

    ubeatApp.controller('HomeController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            initSlider();
            console.log('HomeController ChangeSuccess');
            // call your functions here
        });
    });

    ubeatApp.controller('AlbumController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('AlbumController ChangeSuccess');
            // call your functions here
            displayPlayButton();
            $(document).foundation('interchange', 'reflow');
            blur.init({ el : document.querySelector('.artist-header'), path : 'img/hypnoflip.png' });
        });
    });

    ubeatApp.controller('ArtistController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('ArtistController ChangeSuccess');

            $(document).foundation('interchange', 'reflow');
            blur.init({ el : document.querySelector('.artist-header'), path : 'img/stupeflip-artist.jpg' });
        });
    });


})();