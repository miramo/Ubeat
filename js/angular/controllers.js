/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('controllers', ['factories', 'directives', 'services']);

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

    controllers.controller('HomeController', function ($scope, sharedProperties,
                                                       artistFactory, artistAlbumsFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        $scope.artistIds = [285976572, 185933496, 111051, 371362363, 111051, 371362363, 111051, 371362363];
        var albumsIds = [285976572, 285976572, 285976572, 285976572, 285976572, 285976572, 285976572, 285976572];
        sharedProperties.setTitle('Accueil');

        $scope.artistsTab = [];
        $scope.albums = [];

        for (var i = 0; i < $scope.artistIds.length; ++i)
        {
            artistFactory.get({id: $scope.artistIds[i]}).$promise.then(function (data)
                {
                    $scope.artistsTab[i] = data.results[0];
                    //sharedProperties.setTitle($scope.artists[i].artistName);

                    spotifySearchFactory.get({
                        name: $scope.artistsTab[i].artistName,
                        type: 'artist'
                    }).$promise.then(function (data)
                        {
                            spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                            {
                                $scope.artistsTab[i].image = data.images[0];
                                $scope.artistsTab[i].artistPictureLoaded = true;

                                //   blur.init({el: document.querySelector('.artist-header'), path: $scope.artistsTab[i].image.url});

                            }, function (err)
                            {
                            });

                        }, function (err)
                        {
                        });
                    //artistAlbumsFactory.get({id: $routeParams.id}).$promise.then(function (data)
                    //    {
                    //        $scope.albums = data.results;
                    //
                    //        for (var i = 0; i < $scope.albums.length; ++i)
                    //        {
                    //            $scope.albums[i].releaseDateObj = new Date($scope.albums[i].releaseDate);
                    //            $scope.albums[i].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[i].artworkUrl100, 300);
                    //        }
                    //        $scope.true = false;
                    //    },
                    //    function (err) {});
                },
                function (err)
                {
                });
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
           // initSlider();
            console.log('HomeController ChangeSuccess');
            $(document).foundation();
            // call your functions here
        });
    });

    controllers.controller('ArtistController', function ($scope, $routeParams, sharedProperties,
                                                         artistFactory, artistAlbumsFactory, artistBiographiesFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        $scope.artistPictureLoaded = false;
        $scope.isTabletOrDesktop = true;

        artistFactory.get({id: $routeParams.id}).$promise.then(function (data)
            {
                $scope.artist = data.results[0];
                sharedProperties.setTitle($scope.artist.artistName);

                spotifySearchFactory.get({name: $scope.artist.artistName, type: 'artist'}).$promise.then(function (data)
                {
                    artistBiographiesFactory.get({artist: ":artist:", id: data.artists.items[0].id}).$promise.then(function (data)
                    {
                        $scope.artist.description = getSentencesNb(data.response.biographies[0].text, 3);

                    }, function (err) {});
                    spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                    {
                        $scope.artist.image = data.images[0];
                        $scope.artistPictureLoaded = true;

                        blur.init({el: document.querySelector('.artist-header'), path: $scope.artist.image.url});

                    }, function (err) {});

                }, function (err) {});
                artistAlbumsFactory.get({id: $routeParams.id}).$promise.then(function (data)
                    {
                        $scope.albums = data.results;

                        for (var i = 0; i < $scope.albums.length; ++i)
                        {
                            $scope.albums[i].releaseDateObj = new Date($scope.albums[i].releaseDate);
                            $scope.albums[i].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[i].artworkUrl100, 300);
                        }
                        $scope.true = false;
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
})();