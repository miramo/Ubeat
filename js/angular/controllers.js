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
                                                       artistFactory, albumFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        $scope.artistIds = [285976572, 185933496, 111051, 371362363, 994656, 405129701, 115429828, 263132120];
        $scope.albumsIds = [289081371, 260725492, 731756766, 422478077, 266075192, 669445575, 598997036, 305792965];
        sharedProperties.setTitle('Accueil');

        $scope.artistsLoadedCount = 0;
        $scope.artistsLoadComplete = false;
        $scope.albumsLoadedCount = 0;
        $scope.albumsLoadComplete = false;
        $scope.artistsTab = [];
        $scope.albumsTab = [];
        $scope.sharedProperties = sharedProperties;

        $scope.albumLoad = function(id)
        {
            //console.log("AlbumLoad[" + id + "]");
        }

        $scope.$watch('artistsLoadedCount', function (newVal, oldVal)
        {
            if (newVal >= $scope.artistIds.length)
            {
                $scope.artistsLoadComplete = true;
                sharedProperties.setHomeArtists($scope.artistsTab);
                $scope.sharedProperties.homeArtists = sharedProperties.getHomeArtists();

                //var blur = new Blur({
                //    el        : document.querySelector('body'),
                //    path      : '',
                //    radius    : 50,
                //    fullscreen: true
                //});

                    //$scope.$evalAsync(function()
                    //{
                    //
                    //    console.log(document.getElementsByClassName('slick-center')[0]);
                    //});

               //angular.element.find('.slider-index').on('swipe', function(event, slick, direction)
               //{
               //
               //    console.log("ZIZI");
               //});
                //blur.init({
                //    el  : document.querySelector('body'),
                //    path: $('.slick-center')[0].src
                //});
            }
        });

        $scope.$watch('albumsLoadedCount', function (newVal, oldVal)
        {
            if (newVal >= $scope.albumsIds.length)
            {
                $scope.albumsLoadComplete = true;
                sharedProperties.setHomeAlbums($scope.albumsTab);
                $scope.sharedProperties.homeAlbums = sharedProperties.getHomeAlbums();
            }
        });


        angular.forEach($scope.artistIds, function (value, key)
        {
            artistFactory.get({id: value}).$promise.then(function (data)
                {
                    $scope.artistsTab[key] = data.results[0];
                    //sharedProperties.setTitle($scope.artists[i].artistName);

                    spotifySearchFactory.get({
                        name: $scope.artistsTab[key].artistName,
                        type: 'artist'
                    }).$promise.then(function (data)
                        {
                            spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                            {
                                $scope.artistsTab[key].image = data.images[0];
                                $scope.artistsTab[key].artistPictureLoaded = true;

                                ++$scope.artistsLoadedCount;
                            }, function (err)
                            {
                            });

                        }, function (err)
                        {
                        });
                },
                function (err)
                {
                });
        });

        angular.forEach($scope.albumsIds, function (value, key)
        {
            albumFactory.get({id: value}).$promise.then(function (data)
                {
                    $scope.albumsTab[key] = data.results[0];
                    $scope.albumsTab[key].artworkUrl300 = itunesLinkImageSizeTo($scope.albumsTab[key].artworkUrl100, 300);
                    ++$scope.albumsLoadedCount;
                },
                function (err)
                {
                });
        });

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log('HomeController ChangeSuccess');
            $(document).foundation();


            $('.slider-index').on('click', function(event, slick, direction)
            {
                console.log("CLICK");
            });

            $('.slider-index').on('afterChange', function(event, slick, direction)
            {
                console.log("After Change");
            });
            $('.slider-index').on('init', function(event, slick, direction)
            {
                console.log("Init");
            });

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
                    artistBiographiesFactory.get({
                        artist: ":artist:",
                        id    : data.artists.items[0].id
                    }).$promise.then(function (data)
                        {
                            if (data.response.biographies.length > 0)
                            {
                                $scope.artist.description = getSentencesNb(data.response.biographies[0].text, 3);
                            }
                            else
                            {
                                $scope.artist.description = "Aucune description disponible.";
                            }

                        }, function (err)
                        {
                        });
                    spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                    {
                        $scope.artist.image = data.images[0];
                        $scope.artistPictureLoaded = true;

                        var blur = new Blur({
                            el        : document.querySelector('body'),
                            path      : '',
                            radius    : 50,
                            fullscreen: true
                        });

                        blur.init({el: document.querySelector('.artist-header'), path: $scope.artist.image.url});

                    }, function (err)
                    {
                    });

                }, function (err)
                {
                });
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

            var blur = new Blur({
                el        : document.querySelector('body'),
                path      : '',
                radius    : 50,
                fullscreen: true
            });

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

            $scope.displayPlayButton = function (track)
            {
                track.displayPlayButton = true;
            }

            $scope.hidePlayButton = function (track)
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

    controllers.controller('PlaylistsController', function ($scope, $routeParams, sharedProperties)
    {
        $scope.errorOccured = false;
        $scope.sharedProperties = sharedProperties;

        $scope.addTrack = function(name)
        {

        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            console.log("PlaylistsController ChangeSuccess");
            $(document).foundation();
        });
    });

})();