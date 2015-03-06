/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('controllers', ['factories', 'directives', 'services', 'ngAudio']);

    controllers.controller('MainController', function ($scope, sharedProperties)
    {
        $scope.sharedProperties = sharedProperties;
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('MainController ChangeSuccess');
            $("body").css("background-image", "none");
            // call your functions here
        });
    });

    controllers.controller('NavbarController', function ($scope)
    {
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('NavbarController ChangeSuccess');
            $(document).foundation();
            // call your functions here
        });
    });

    controllers.controller('PlaybarController', function ($scope, ngAudio)
    {
        $scope.audio = ngAudio.load('http://a1815.phobos.apple.com/us/r1000/101/Music/70/f0/fd/mzm.hhpjhkpl.aac.p.m4a');

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('PlaybarController ChangeSuccess');
            $(document).foundation();
            // call your functions here
        });
    });

    controllers.controller('HomeController', function ($scope, sharedProperties)
    {
        sharedProperties.setTitle('Accueil');
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            initSlider();
            console.log('HomeController ChangeSuccess');
            // call your functions here
        });
    });

    controllers.controller('AlbumController', function ($scope, $routeParams, sharedProperties,
                                                        albumFactory, artistFactory, albumTracksFactory)
    {
        $scope.isResolved = false;

        albumFactory.get({id: $routeParams.id}, function (data)
        {
            $scope.album = data.results[0];
            sharedProperties.setTitle($scope.album.collectionName);
            $scope.album.artworkUrl300 = itunesLinkImageSizeTo($scope.album.artworkUrl100, 300);
            $scope.album.releaseDateObj = new Date($scope.album.releaseDate);

            blur.init({el: document.querySelector('.artist-header'), path: $scope.album.artworkUrl300});

            artistFactory.get({id: $scope.album.artistId}, function (data)
            {
                $scope.artist = data.results[0];
            });

            albumTracksFactory.get({id: $routeParams.id}, function (data)
            {
                $scope.tracks = data.results;

                for (var i = 0; i < $scope.tracks.length; ++i)
                {
                    $scope.tracks[i].time = millisToTime($scope.tracks[i].trackTimeMillis);
                    $scope.tracks[i].displayPlayButton = false;
                }
            });

            $scope.displayPlayButton = function(track)
            {
                track.displayPlayButton = true;
            }

            $scope.hidePlayButton = function(track)
            {
                track.displayPlayButton = false;
            }

            $scope.isResolved = true;
        });

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            $(document).foundation('interchange', 'reflow');
            $(document).foundation('tooltip', 'reflow');
        });
    });

    controllers.controller('ArtistController', function ($scope, sharedProperties,
                                                         artistFactory, artistAlbumsFactory, artistBiographiesFactory, spotifyArtistFactory)
    {
        $scope.artistPictureLoaded = false;
        $scope.artistInfosLoaded = false;
        $scope.albumsLoaded = false;

        artistFactory.get({id: 19333119}).$promise.then(function (data)
            {
                $scope.artist = data.results[0];
                sharedProperties.setTitle($scope.artist.artistName);

                artistBiographiesFactory.get({artist: ":artist:", id: "7qiRNP9z0FhN63YcLmb8Ai"}).$promise.then(function (data)
                    {
                        $scope.artist.description = getSentencesNb(data.response.biographies[0].text, 3);
                        $scope.artistInfosLoaded = true;

                    }, function (err) {});
                spotifyArtistFactory.get({id: "7qiRNP9z0FhN63YcLmb8Ai"}).$promise.then(function (data)
                {
                    $scope.artist.image = data.images[0];
                    $scope.artistPictureLoaded = true;

                    blur.init({el: document.querySelector('.artist-header'), path: $scope.artist.image.url});

                }, function (err) {});

                artistAlbumsFactory.get({id: 19333119}).$promise.then(function (data)
                    {
                        $scope.albumsLoaded = true;
                        $scope.albums = data.results;

                        for (var i = 0; i < $scope.albums.length; ++i)
                        {
                            $scope.albums[i].releaseDateObj = new Date($scope.albums[i].releaseDate);
                            $scope.albums[i].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[i].artworkUrl100, 300);
                            $scope.albums[i].isLoaded = true;
                        }
                    },
                    function (err)
                    {
                    });
            },
            function (err)
            {
            });


        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('ArtistController ChangeSuccess');

            $(document).foundation('interchange', 'reflow');
        });
    });
})();