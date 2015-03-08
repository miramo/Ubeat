/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('pagesControllers', ['factories', 'directives', 'services', 'ngAudio', 'truncate']);

    controllers.controller('MainController', function ($scope, sharedProperties, sharedPagesStatus)
    {
        $scope.isPageLoaded = sharedPagesStatus.getIsPageLoaded();
        $scope.sharedProperties = sharedProperties;
        $scope.sharedPagesStatus = sharedPagesStatus;

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $("body").css("background-image", "none");
            // call your functions here
        });
    });

    controllers.controller('NavbarController', function ($scope, sharedPagesStatus)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            // call your functions here
        });
    });

    controllers.controller('PlaybarController', function ($scope, ngAudio, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.audio = ngAudio.load('');
        $scope.audio.progress = 0;
        $scope.audio.currentTime = 0;

        $scope.$watch('sharedProperties.getCurrentTrack()', function (newVal, oldVal)
        {
            if (oldVal)
                oldVal.playState = sharedProperties.getPlayStates().idle;
            if ($scope.audio && newVal)
            {
                $scope.audio.pause();
                $scope.audio = ngAudio.load(newVal.previewUrl);
                $scope.audio.play();
                newVal.playState = sharedProperties.getPlayStates().play;
            }
        });

        $scope.$watch('audio.paused', function (newVal, oldVal)
        {
            var track = sharedProperties.getCurrentTrack();

            if (track)
            {
                track.playState = (newVal == true ? sharedProperties.getPlayStates().pause : sharedProperties.getPlayStates().play);
            }
        });

        $scope.$watch('sharedProperties.getCurrentTrack().playState', function (newVal, oldVal)
        {
            sharedProperties.updateTrackStates();
        });

        $scope.canPlay = function ()
        {
            if ($scope.audio)
            {
                return $scope.audio.canPlay;
            }
            return false;
        }

        $scope.switchMute = function ()
        {
            if ($scope.audio)
            {
                $scope.audio.muting = $scope.audio.muting;
                if ($scope.audio.muting)
                {

                }
            }
        }

        $scope.getVolume = function ()
        {
            if ($scope.audio)
            {
                if ($scope.audio.muting == false)
                    return 0;
                return $scope.audio.volume * 100;
            }
            return 0;
        }


        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            ;
            $(document).foundation();
            // call your functions here
        });
    });

    controllers.controller('HomeController', function ($scope, sharedPagesStatus, sharedProperties,
                                                       artistFactory, albumFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.artistIds = [285976572, 185933496, 111051, 371362363, 994656, 405129701, 115429828, 263132120];
        $scope.albumsIds = [289081371, 260725492, 731756766, 422478077, 266075192, 669445575, 598997036, 305792965];
        sharedPagesStatus.setTitle('Accueil');

        $scope.artistsLoadedCount = 0;
        $scope.artistsLoadComplete = false;
        $scope.albumsLoadedCount = 0;
        $scope.albumsLoadComplete = false;
        $scope.artistsTab = [];
        $scope.albumsTab = [];
        $scope.sharedProperties = sharedProperties;

        $scope.albumLoad = function (id)
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

                if ($scope.albumsLoadComplete)
                {
                    sharedPagesStatus.setIsPageLoaded(true);
                }
            }
        });

        $scope.$watch('albumsLoadedCount', function (newVal, oldVal)
        {
            if (newVal >= $scope.albumsIds.length)
            {
                $scope.albumsLoadComplete = true;
                sharedProperties.setHomeAlbums($scope.albumsTab);
                $scope.sharedProperties.homeAlbums = sharedProperties.getHomeAlbums();

                if ($scope.artistsLoadComplete)
                {
                    sharedPagesStatus.setIsPageLoaded(true);
                }
            }
        });


        angular.forEach($scope.artistIds, function (value, key)
        {
            artistFactory.get({id: value}).$promise.then(function (data)
                {
                    $scope.artistsTab[key] = data.results[0];
                    //sharedProperties.setTitle($scope.artists[i].artistName);

                    if ($scope.artistsTab[key] != null)
                    {
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
                    }
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
            $(document).foundation();


            //$('.slider-index').on('click', function(event, slick, direction)
            //{
            //    console.log("CLICK");
            //});
            //
            //$('.slider-index').on('afterChange', function(event, slick, direction)
            //{
            //    console.log("After Change");
            //});
            //$('.slider-index').on('init', function(event, slick, direction)
            //{
            //    console.log("Init");
            //});

        });
    });

    controllers.controller('ArtistController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties,
                                                         artistFactory, artistAlbumsFactory, artistBiographiesFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.artistPictureLoaded = false;
        $scope.isTabletOrDesktop = true;

        artistFactory.get({id: $routeParams.id}).$promise.then(function (data)
            {
                $scope.artist = data.results[0];
                sharedPagesStatus.setTitle($scope.artist.artistName);

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
                        sharedPagesStatus.setIsPageLoaded(true);
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
            $(document).foundation('interchange', 'reflow');
        });
    });

    controllers.controller('AlbumController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties,
                                                        albumFactory, artistFactory, albumTracksFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.isResolved = false;
        $scope.sharedProperties = sharedProperties;
        $scope.playStates = sharedProperties.getPlayStates();
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = [];
        $scope.tracks = [];
        $scope.album = null;
        $scope.isPageFailedLoad = false;

        var updateTracks = function ()
        {
            var currentTrack = sharedProperties.getCurrentTrack();

            if (currentTrack)
            {
                for (var i = 0; i < $scope.tracks.length; ++i)
                {
                    if (currentTrack.trackId == $scope.tracks[i].trackId)
                    {
                        $scope.tracks[i].playState = currentTrack.playState;
                    }
                    else
                    {
                        $scope.tracks[i].playState = $scope.playStates.idle;
                    }
                }
            }
        }

        $scope.$watch('sharedProperties.getCurrentTrack()', function (newVal, oldVal)
        {
            updateTracks();
        });
        $scope.$watch('sharedProperties.getCurrentTrack().playState', function (newVal, oldVal)
        {
            updateTracks();
        });

        $scope.modifyFilter = function (id)
        {
            $scope.filter = $scope.filtersValues[id];
            $scope.currentFilterName = $scope.filtersNames[id]
        }

        $scope.closeModal = function (id)
        {
            $(id).foundation('reveal', 'close');
        }

        $scope.addTrackToAdd = function (track)
        {
            $scope.trackToAddToNewPlaylist = track;
        }

        $scope.addTrackArrayToAdd = function (tracks)
        {
            $scope.trackArrayToAddToNewPlaylist = tracks;
        }

        $scope.createPlaylistByTrack = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                var newPlaylist = sharedProperties.createPlaylist(playlistToAdd);

                sharedProperties.addTrackToPlaylist($scope.trackToAddToNewPlaylist, newPlaylist.id);
                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        $scope.createPlaylistByTrackArray = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                var newPlaylist = sharedProperties.createPlaylist(playlistToAdd);

                sharedProperties.addTrackArrayToPlaylist($scope.trackArrayToAddToNewPlaylist, newPlaylist.id);
                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        $scope.trackArrayToAddIsValid = function ()
        {
            return ($scope.trackArrayToAddToNewPlaylist && $scope.trackArrayToAddToNewPlaylist.length > 0);
        }

        $scope.createPlaylistByAlbum = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                var newPlaylist = sharedProperties.createPlaylist(playlistToAdd);

                sharedProperties.addTrackArrayToPlaylist($scope.trackArrayToAddToNewPlaylist, newPlaylist.id);
                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        var blur = new Blur({
            el        : document.querySelector('body'),
            path      : '',
            radius    : 50,
            fullscreen: true
        });

        var isAlbumIdValid = /^\d+$/.test($routeParams.id);

        var pageFailedLoad = function ()
        {
            sharedPagesStatus.setIsPageError(true);
            sharedPagesStatus.setIsPageLoaded(true);
        }

        if (isAlbumIdValid)
        {
            albumFactory.get({id: $routeParams.id}, function (data)
            {
                if (data && data.results.length > 0)
                {
                    $scope.album = data.results[0];
                    sharedPagesStatus.setTitle($scope.album.collectionName);
                    $scope.album.artworkUrl300 = itunesLinkImageSizeTo($scope.album.artworkUrl100, 300);
                    $scope.album.releaseDateObj = new Date($scope.album.releaseDate);
                    $scope.filtersValues = ['trackNumber', 'trackName', 'artistName', '-time.Minutes', 'time.Minutes'];
                    $scope.filtersNames = ['Numéro de piste', 'Chanson', 'Artiste', 'Durée'];
                    $scope.currentFilterName = $scope.filtersNames[0];
                    $scope.filter = $scope.filtersValues[0];

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
                            var currentTrack = sharedProperties.getCurrentTrack();

                            if (currentTrack && currentTrack.trackId == $scope.tracks[i].trackId)
                            {
                                $scope.tracks[i].playState = currentTrack.playState;
                            }
                            else
                            {
                                $scope.tracks[i].playState = sharedProperties.getPlayStates().idle;
                            }
                            $scope.tracks[i].filter = $scope.filter;
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

                    sharedPagesStatus.setIsPageLoaded(true);
                }
                else
                {
                    pageFailedLoad();
                }

            });
        }
        else
        {
            pageFailedLoad();
        }

        $scope.check = function ()
        {
            console.log("FAIL");
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            $(document).foundation('interchange', 'reflow');
            $(document).foundation('tooltip', 'reflow');
            $(document).foundation('reveal', 'reflow');
        });
    });

    controllers.controller('PlaylistsController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties, localStorageService)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.missingImgPlaylist = 'http://i.imgur.com/mqE4SPZ.png';
        $scope.sharedProperties = sharedProperties;
        $scope.playlistToAdd = {};
        $scope.playlistToAdd.defaultName = "Nouvelle playlist";
        $scope.playlistToAdd.name = $scope.playlistToAdd.defaultName;
        $scope.playlists = sharedProperties.playlists;
        $scope.alertMessages = [];
        $scope.active = sharedProperties.getPlaylist(0);
        $scope.isNewPlaylistClicked = false;
        $scope.playlistCurrentRename = {};
        $scope.playlistCurrentRename.name = '';
        $scope.playStates = sharedProperties.getPlayStates();
        $scope.defaultPlaylist = {};
        $scope.defaultPlaylist.name = "Pas de playlist";

        var refreshPlaylits = function()
        {
            if ($scope.playlists)
            {
                for (var i = 0; i < $scope.playlists.length; ++i)
                {
                    $scope.playlists[i].isEdit = false;
                    $scope.playlists[i].isHover = false;
                }
            }
        }

        console.log("PlaylistsController");

        $scope.$watch('sharedProperties.getPlaylists()', function (newVal, oldVal)
        {
            $scope.playlists = sharedProperties.getPlaylists();

            sharedPagesStatus.setIsPageLoaded(true);
            if (newVal)
            {
                for (var i = 0; i < newVal.length; ++i)
                {
                    newVal[i].id = i;
                }
            }
            if (!$scope.playlists || $scope.playlists.length <= 0)
            {
                $scope.active = $scope.defaultPlaylist;
            }
            else if ($scope.playlists && $scope.playlists.length > 0)
            {
                $scope.active = $scope.playlists[0];
            }
        });

        $scope.getPlaylistImg = function (playlist, size)
        {
            if (playlist && playlist.tracks && playlist.tracks.length > 0)
            {
                var firstTrack = playlist.tracks[0];
                var artwork = firstTrack.artworkUrl100;
                if (size && size != 100)
                {
                    artwork = itunesLinkImageSizeTo(firstTrack.artworkUrl100, size);
                }
                return artwork;
            }
            else
            {
                return $scope.missingImgPlaylist;
            }
        }

        $scope.removePlaylist = function (id)
        {
            sharedProperties.removePlaylist(id);
            $scope.playlists = sharedProperties.getPlaylists();

            if ($scope.playlists.length > 0)
            {
                $scope.active = $scope.playlists[0];
            }
            else
            {
                $scope.active = $scope.defaultPlaylist;
            }
        }

        $scope.switchNewPlaylistClicked = function ()
        {
            $scope.isNewPlaylistClicked = !$scope.isNewPlaylistClicked;
        }

        $scope.removeAlert = function (id)
        {
            $scope.alertMessages.splice(id, 1);
        }

        $scope.rename = function(playlist, playlistCurrentRename)
        {
            $scope.setEdit(playlist.id, playlist, false);
            $scope.confirmRename(playlist.id, playlist, playlistCurrentRename.name)
        }

        $scope.setEdit = function (id, playlist, isEdit)
        {
            playlist.isEdit = isEdit;
            var playlists = sharedProperties.getPlaylists();

            for (var i = 0; i < playlists.length; ++i)
            {
                if (i != id)
                {
                    playlists[i].isEdit = false;
                }
            }
        }

        $scope.setHover = function (playlist, isHover)
        {
            playlist.isHover = isHover;
        }

        $scope.setPlaylistCurrentRename = function (value)
        {
            $scope.playlistCurrentRename.name = value;
        }

        $scope.displayPlayButton = function (track)
        {
            track.displayPlayButton = true;
        }

        $scope.hidePlayButton = function (track)
        {
            track.displayPlayButton = false;
        }

        $scope.confirmRename = function (id, playlist, newName)
        {
            var val = sharedProperties.renamePlaylist(id, newName);
            playlist.isEdit = false;
            playlist.isHover = false;
            $scope.setPlaylistCurrentRename(newName);
            $scope.active = playlist;
        }

        $scope.createPlaylist = function (value)
        {
            $scope.active = sharedProperties.createPlaylist(value);
            $scope.playlistToAdd.name = $scope.playlistToAdd.defaultName;
        }

        $scope.createPlaylistUI = function (value)
        {
            $scope.createPlaylist(value);
            $scope.switchNewPlaylistClicked();
        }

        $scope.setPlaylistActive = function (id)
        {
            //console.log("setPlaylistActive: " + id);
            $scope.active = sharedProperties.getPlaylist(id);
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            $(document).foundation('dropdown', 'reflow');
        });
    });
})();