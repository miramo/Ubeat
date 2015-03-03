/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('controllers', ['factories']);

    controllers.controller('MainController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('MainController ChangeSuccess');
            $("body").css("background-image", "none");
            // call your functions here
        });
    });

    controllers.controller('HomeController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            initSlider();
            console.log('HomeController ChangeSuccess');
            // call your functions here
        });
    });

    controllers.controller('AlbumController', function ($scope, $routeParams, albumFactory, artistFactory, albumTracksFactory)
    {
        albumFactory.get({id: $routeParams.id}).$promise.then(function (data)
        {
            $scope.album = data.results[0];
            $scope.album.artworkUrl300 = itunesLinkImageSizeTo($scope.album.artworkUrl100, 300);
            $scope.album.releaseDateObj = new Date($scope.album.releaseDate);
           // console.log("ReleaseDate: " + $scope.album.releaseDate);

            blur.init({el: document.querySelector('.artist-header'), path: $scope.album.artworkUrl300});

            artistFactory.get({id: $scope.album.artistId}).$promise.then(function (data)
            {
                $scope.artist = data.results[0];
            }, function (err)
            {
            });


            albumTracksFactory.get({id: $routeParams.id}).$promise.then(function (data)
            {
                $scope.tracks = data.results;

                for (var i = 0; i < $scope.tracks.length; ++i)
                {
                    $scope.tracks[i].time = millisToTime($scope.tracks[i].trackTimeMillis);
                }
            }, function (err)
            {
            });
        }, function (err)
        {
        });

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            // call your functions here
            displayPlayButton();
            $(document).foundation('interchange', 'reflow');
            blur.init({el: document.querySelector('.artist-header'), path: 'img/hypnoflip.png'});
        });
    });

    controllers.controller('ArtistController', function ($scope, artistFactory, artistAlbumsFactory)
    {
        artistFactory.get({id: 19333119}).$promise.then(function (data)
            {
                $scope.artist = data.results[0];
            },
            function (err)
            {
            });

        artistAlbumsFactory.get({id: 19333119}).$promise.then(function (data)
            {
                $scope.albums = data.results;

                for (var i = 0; i < $scope.albums.length; ++i)
                {
                    $scope.albums[i].releaseDateObj = new Date($scope.albums[i].releaseDate);
                    $scope.albums[i].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[i].artworkUrl100, 300);
                }
            },
            function (err)
            {
            });

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('ArtistController ChangeSuccess');

            $(document).foundation('interchange', 'reflow');
            blur.init({el: document.querySelector('.artist-header'), path: 'img/stupeflip-artist.jpg'});
        });
    });
})();