/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('pagesControllers', ['factories', 'directives', 'services', 'truncate']);

    controllers.controller('HomeController', function ($scope, sharedPagesStatus, sharedProperties, session,
                                                       artistFactory, albumFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.artistIds = [115429828, 371362363, 994656, 405129701, 263132120, 285976572, 185933496, 111051];
        $scope.albumsIds = [598997036, 422478077, 266075192, 669445575, 305792965, 289081371, 260725492, 731756766];
        sharedPagesStatus.setTitle('Accueil');

        $scope.artistsLoadedCount = 0;
        $scope.artistsLoadComplete = false;
        $scope.albumsLoadedCount = 0;
        $scope.albumsLoadComplete = false;
        $scope.artistsTab = [];
        $scope.albumsTab = [];
        $scope.sharedProperties = sharedProperties;
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().home);

        angular.forEach($scope.artistIds, function (value, key)
        {
            artistFactory.get(session.getToken(), value, function (data)
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
                                    sharedPagesStatus.setDefaultCriticalError(err);
                                });

                            }, function (err)
                            {
                                // sharedPagesStatus.setCriticalError(0, '');
                            });
                    }
                },
                function (err)
                {
                    sharedPagesStatus.setDefaultCriticalError(err);
                });
        });

        angular.forEach($scope.albumsIds, function (value, key)
        {
            albumFactory.get(session.getToken(), value, function (data)
                {
                    $scope.albumsTab[key] = data.results[0];
                    $scope.albumsTab[key].artworkUrl300 = itunesLinkImageSizeTo($scope.albumsTab[key].artworkUrl100, 300);
                    ++$scope.albumsLoadedCount;
                },
                function (err)
                {
                    //sharedPagesStatus.setDefaultCriticalError(err);
                });
        });

        var blur = new Blur({
            el        : document.querySelector('body'),
            path      : '',
            radius    : 50,
            fullscreen: true
        });

        var albumsSliderChange = function (currentSlide)
        {
            blur.init({
                el  : document.querySelector('body'),
                path: $scope.albumsTab[currentSlide].artworkUrl300
            });
        }

        var artistsSliderChange = function (currentSlide)
        {
            blur.init({
                el  : document.querySelector('body'),
                path: $scope.artistsTab[currentSlide].image.url
            });
        }

        var pageLoaded = function ()
        {
            var artistsSlider = $('#artists-slider');
            var albumsSlider = $('#albums-slider');

            albumsSlider.on('afterChange', function (event, slick, currentSlide, nextSlide)
            {
                albumsSliderChange(currentSlide);
            });

            artistsSlider.on('afterChange', function (event, slick, currentSlide, nextSlide)
            {
                artistsSliderChange(currentSlide);
            });

            artistsSliderChange(0);
            sharedPagesStatus.setIsPageLoaded(true);
            $(document).foundation();
        }

        $scope.$watch('artistsLoadedCount', function (newVal, oldVal)
        {
            if (newVal >= $scope.artistIds.length)
            {
                $scope.artistsLoadComplete = true;
                sharedProperties.setHomeArtists($scope.artistsTab);
                $scope.sharedProperties.homeArtists = sharedProperties.getHomeArtists();

                if ($scope.albumsLoadComplete)
                {
                    pageLoaded();
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
                    pageLoaded();
                }
            }
        });

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            angular.element(document).find('body').backgroundColor = 'white';
            $(document).foundation();
        });
    });

    controllers.controller('ArtistController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties, session, albumTracksFactory,
                                                         artistFactory, artistAlbumsFactory, artistBiographiesFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.artistPictureLoaded = false;
        $scope.isTabletOrDesktop = true;
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().artist);

        var isValidArtist = /^\d+$/.test($routeParams.id);

        if (isValidArtist)
        {
            artistFactory.get(session.getToken(), $routeParams.id, function (data)
                {
                    $scope.artist = data.results[0];
                    if (data && data.results.length > 0)
                    {
                        sharedPagesStatus.setTitle($scope.artist.artistName);

                        spotifySearchFactory.get({
                            name: $scope.artist.artistName,
                            type: 'artist'
                        }).$promise.then(function (data)
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
                                        sharedPagesStatus.setDefaultCriticalError(err);
                                    });
                                spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                                {
                                    $scope.artist.image = data.images[0];
                                    $scope.artistPictureLoaded = true;

                                    var blur = new Blur({
                                        el        : document.querySelector('.artist-header'),
                                        path      : '',
                                        radius    : 50,
                                        fullscreen: true
                                    });

                                    blur.init({
                                        el  : document.querySelector('.artist-header'),
                                        path: $scope.artist.image.url
                                    });

                                }, function (err)
                                {
                                    sharedPagesStatus.setDefaultCriticalError(err);
                                });

                            }, function (err)
                            {
                                sharedPagesStatus.setDefaultCriticalError(err);
                            });
                        artistAlbumsFactory.get(session.getToken(), $routeParams.id, function (data)
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
                                sharedPagesStatus.setDefaultCriticalError(err);
                            });
                    }
                    else
                    {
                        sharedPagesStatus.setCriticalError(404, "Artist not found");
                    }
                },
                function (err)
                {
                    sharedPagesStatus.setDefaultCriticalError(err);
                });
        }
        else
        {
            sharedPagesStatus.setCriticalError(404, "Artist not found");
        }

        $scope.addAlbumToPlayQueue = function (album)
        {
            sharedProperties.addAlbumToPlayQueue(album);
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            angular.element(document).find('body').backgroundColor = 'white';
            $(document).foundation('interchange', 'reflow');
        });
    });


    controllers.controller('AlbumController', function ($scope, $routeParams, session, sharedPagesStatus, sharedProperties,
                                                        albumFactory, artistFactory, albumTracksFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.isResolved = false;
        $scope.sharedProperties = sharedProperties;
        $scope.playStates = sharedProperties.getPlayStates();
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = [];
        $scope.tracks = [[]];
        $scope.album = null;
        $scope.playlits = [];
        $scope.isPageFailedLoad = false
        $scope.isConnected = false;
        $scope.errorTitle = "Erreur 503";
        $scope.errorMsg = "Service temporairement indisponible.";
        var executeSplit = true;
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().album);

        var getPlaylistsCallback = function (playlists)
        {
            if (playlists)
            {
                $scope.playlists = playlists;
            }
        }

        if (session.isConnected())
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
            $scope.isConnected = true;
        }

        var updateTracks = function ()
        {
            var currentTrack = sharedProperties.getCurrentTrack();

            if (currentTrack)
            {
                for (var i = 0; i < $scope.tracks.length; ++i)
                {
                    for (var j = 0; j < $scope.tracks[i].length; ++j)
                    {
                        if (currentTrack.trackId == $scope.tracks[i][j].trackId)
                        {
                            $scope.tracks[i][j].playState = currentTrack.playState;
                        }
                        else
                        {
                            $scope.tracks[i][j].playState = $scope.playStates.idle;
                        }
                    }
                }
            }
        }

        var pageIsLoaded = function ()
        {
            sharedPagesStatus.setIsPageLoaded(true);

            $(document).foundation('dropdown', 'reflow');
        }

        $scope.setCurrentTrack = function(track, tracks, addToPlayQueue, state, setCurrentTrackId)
        {
            sharedProperties.resetPlayQueue();
            sharedProperties.addTrackArrayToPlayQueue(tracks, false);
            sharedProperties.setCurrentTrack(track, false, state, setCurrentTrackId);
        }

        $scope.$watch('sharedProperties.getCurrentTrack()', function (newVal, oldVal)
        {
            updateTracks();
        });
        $scope.$watch('sharedProperties.getCurrentTrack().playState', function (newVal, oldVal)
        {
            updateTracks();
        });

        $scope.executePlayAll = function (isSpan)
        {
            if (isSpan)
            {
                executeSplit = false;
            }
            else if (executeSplit)
            {
                var concatTracks = [];

                for (var i = 0; i < $scope.tracks.length; ++i)
                {
                    concatTracks = concatTracks.concat($scope.tracks[i]);
                }
                sharedProperties.replacePlayQueue(concatTracks, true);
                executeSplit = true;
            }
            else if (!executeSplit)
                executeSplit = true;
        }

        $scope.playAfter = function ()
        {
            sharedProperties.addToPlayQueueAtCurrentTrack($scope.tracks);
        }

        $scope.playInLast = function ()
        {
            sharedProperties.addTrackArrayToPlayQueue($scope.tracks, true);
        }

        $scope.replacePlayQueue = function ()
        {
            sharedProperties.replacePlayQueue();
        }

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

        $scope.getActualPlaylists = function ()
        {
            return $scope.playlists;
        }

        var createPlaylistByTrackCallback = function (data)
        {
            if (data)
            {
                sharedProperties.addTrackToPlaylist($scope.trackToAddToNewPlaylist, data.id);
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylistByTrack = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                sharedProperties.createPlaylist(playlistToAdd, createPlaylistByTrackCallback);

                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        var createPlaylistByTrackArrayCallback = function (data)
        {
            if (data)
            {
                sharedProperties.addTrackArrayToPlaylist($scope.trackArrayToAddToNewPlaylist, data.id);
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylistByTrackArray = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                sharedProperties.createPlaylist(playlistToAdd, createPlaylistByTrackArrayCallback);

                $scope.closeModal(modalId);
                return true;
            }
            return false;
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

        var setTracksData = function (dataTracks)
        {
            var j;
            var index;

            for (var i = 0; i < dataTracks.length; ++i)
            {
                j = dataTracks[i].discNumber - 1;
                if (!$scope.tracks[j])
                    $scope.tracks[j] = [];
                index = $scope.tracks[j].length;
                $scope.tracks[j][index] = dataTracks[i];

                var currentTrack = sharedProperties.getCurrentTrack();

                if (currentTrack && currentTrack.trackId == $scope.tracks[j][index].trackId)
                {
                    $scope.tracks[j][index].playState = currentTrack.playState;
                }
                else
                {
                    $scope.tracks[j][index].playState = sharedProperties.getPlayStates().idle;
                }
                $scope.tracks[j][index].filter = $scope.filter;
                $scope.tracks[j][index].time = millisToTime($scope.tracks[j][index].trackTimeMillis);
                $scope.tracks[j][index].displayPlayButton = false;
            }
        }

        var isAlbumIdValid = /^\d+$/.test($routeParams.id);

        if (isAlbumIdValid)
        {
            albumFactory.get(session.getToken(), $routeParams.id, function (data)
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

                    var blur = new Blur({
                        el        : document.querySelector('.artist-header'),
                        path      : '',
                        radius    : 50,
                        fullscreen: true
                    });

                    blur.init({el: document.querySelector('.artist-header'), path: $scope.album.artworkUrl300});

                    artistFactory.get(session.getToken(), $scope.album.artistId, function (data)
                    {
                        $scope.artist = data.results[0];
                    }, function (err)
                    {
                        sharedPagesStatus.setDefaultCriticalError(err);
                    });

                    albumTracksFactory.get(session.getToken(), $routeParams.id, function (data)
                    {
                        var dataTracks = data.results;

                        setTracksData(dataTracks);

                        pageIsLoaded();
                    }, function (err)
                    {
                        sharedPagesStatus.setDefaultCriticalError(err);
                    });

                    $scope.displayPlayButton = function (track)
                    {
                        track.displayPlayButton = true;
                    }

                    $scope.hidePlayButton = function (track)
                    {
                        track.displayPlayButton = false;
                    }
                }
                else
                {
                    sharedPagesStatus.setCriticalError(404, "Album not found");
                }

            }, function (err)
            {
                sharedPagesStatus.setDefaultCriticalError(err);
            });
        }
        else
        {
            sharedPagesStatus.setCriticalError(404, "Album not found");
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            $(document).foundation('interchange', 'reflow');
            $(document).foundation('tooltip', 'reflow');
            $(document).foundation('reveal', 'reflow');
            $(document).foundation('dropdown', 'reflow');
        });
    });

    controllers.controller('PlaylistsController', function ($scope, $location, $route, $routeParams,
                                                            session, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.playlistToAdd = {};
        $scope.playlistToAdd.defaultName = "Nouvelle playlist";
        $scope.playlistToAdd.name = $scope.playlistToAdd.defaultName;
        $scope.alertMessages = [];
        $scope.defaultPlaylist = {name: "Pas de playlist"};
        $scope.active = $scope.defaultPlaylist;
        $scope.isNewPlaylistClicked = false;
        $scope.playlistCurrentRename = {};
        $scope.playlistCurrentRename.name = '';
        $scope.playStates = sharedProperties.getPlayStates();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().playlist);
        sharedPagesStatus.setTitle('Playlists');

        var isRemovingPlaylist = false;

        if (session.isConnected() == false)
        {
            sharedPagesStatus.redirectToHome();
        }

        $scope.getActualPlaylists = function ()
        {
            if ($scope.playlists && $scope.playlists.length <= 0)
            {
                $scope.active = $scope.defaultPlaylist;
            }
            return $scope.playlists;
        }

        var getPlaylistsCallback = function (playlists, isError)
        {
            if (playlists && playlists.length > 0)
            {
                $scope.active = playlists[playlists.length - 1];
                $scope.playlists = playlists;

                for (var i = 0; i < playlists.length; ++i)
                {
                    playlists[i].isEdit = false;
                }
            }
            else
            {
                $scope.playlists = [];
            }
            sharedPagesStatus.setIsPageLoaded(true);
            if (isError)
            {
                sharedPagesStatus.redirectToHome();
            }
        }

        sharedProperties.getPlaylists(getPlaylistsCallback);

        var refreshPlaylists = function ()
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

        refreshPlaylists();

        $scope.isActivePlaylist = function (playlist)
        {
            if (playlist && $scope.active)
            {
                return playlist.id == $scope.active.id;
            }
            return false;
        }

        $scope.getPlaylistImg = function (playlist, size)
        {
            return sharedProperties.getPlaylistImg(playlist, size);
        }

        var removePlaylistCallback = function ()
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
            isRemovingPlaylist = false;
        }

        $scope.removePlaylist = function (playlistId)
        {
            isRemovingPlaylist = true;
            sharedProperties.removePlaylist(playlistId, removePlaylistCallback);
        }

        $scope.switchNewPlaylistClicked = function ()
        {
            $scope.isNewPlaylistClicked = !$scope.isNewPlaylistClicked;
        }

        $scope.removeAlert = function (id)
        {
            $scope.alertMessages.splice(id, 1);
        }

        $scope.rename = function (playlist, playlistCurrentRename)
        {
            $scope.setEdit(playlist.id, playlist, false);
            $scope.confirmRename(playlist.id, playlist, playlistCurrentRename.name)
        }

        $scope.setEdit = function (id, playlist, isEdit)
        {
            playlist.isEdit = isEdit;

            for (var i = 0; i < $scope.playlists.length; ++i)
            {
                if ($scope.playlists[i].id != id)
                {
                    $scope.playlists[i].isEdit = false;
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

        var removeTrackFromPlaylistCallback = function (data)
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
        }

        $scope.removeTrackFromPlaylist = function (trackId, playlistId)
        {
            sharedProperties.removeTrackFromPlaylist(trackId, playlistId, removePlaylistCallback);
        }

        var confirmRenameCallback = function ()
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
        }

        $scope.confirmRename = function (id, playlist, newName)
        {
            playlist.isEdit = false;
            playlist.isHover = false;
            sharedProperties.renamePlaylist(id, playlist, newName, confirmRenameCallback);
            $scope.setPlaylistCurrentRename(newName);
            $scope.active = playlist;
        }

        var createPlaylistCallback = function (playlist)
        {
            if (playlist)
            {
                $scope.active = playlist;
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylist = function (playlistName)
        {
            if (playlistName && playlistName.length > 0)
            {
                sharedProperties.createPlaylist(playlistName, createPlaylistCallback);
            }
        }

        $scope.createPlaylistUI = function (playlistName)
        {
            $scope.createPlaylist(playlistName);
            $scope.switchNewPlaylistClicked();
        }

        var setPlaylistActiveCallback = function (playlist)
        {
            if (playlist)
            {
                $scope.active = playlist;
            }
        }

        $scope.setPlaylistActive = function (id)
        {
            if (isRemovingPlaylist == false)
            {
                var actualPlaylists = $scope.getActualPlaylists();

                for (var i = 0; i < actualPlaylists.length; ++i)
                {
                    if (actualPlaylists[i].id == id)
                    {
                        $scope.active = actualPlaylists[i];
                        return;
                    }
                }
            }
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            angular.element(document).find('body').backgroundColor = 'white';
            $(document).foundation();
            $(document).foundation('dropdown', 'reflow');
        });
    });

    controllers.controller('ErrorPageController', function ($scope, $routeParams, sharedPagesStatus, session)
    {
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().error);
        sharedPagesStatus.setIsPageLoaded(true);
    })

    controllers.controller('PlayQueueController', function ($scope, $routeParams, session, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.setTitle("File d'attente");
        sharedPagesStatus.resetPageStatus();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().playQueue);
        $scope.sharedProperties = sharedProperties;
        sharedPagesStatus.setIsPageLoaded(true);
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = [];
        $scope.playlists = [];
        $scope.isConnected = false;

        var getPlaylistsCallback = function (playlists)
        {
            if (playlists)
            {
                $scope.playlists = playlists;
            }
        }

        if (session.isConnected())
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
            $scope.isConnected = true;
        }

        $scope.getActualPlaylists = function ()
        {
            return $scope.playlists;
        }

        var createPlaylistByTrackCallback = function (data)
        {
            if (data)
            {
                sharedProperties.addTrackToPlaylist($scope.trackToAddToNewPlaylist, data.id);
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylistByTrack = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                sharedProperties.createPlaylist(playlistToAdd, createPlaylistByTrackCallback);

                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        var createPlaylistByTrackArrayCallback = function (data)
        {
            if (data)
            {
                sharedProperties.addTrackArrayToPlaylist($scope.trackArrayToAddToNewPlaylist, data.id);
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylistByTrackArray = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                sharedProperties.createPlaylist(playlistToAdd, createPlaylistByTrackArrayCallback);

                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        $scope.displayPlayButton = function (track)
        {
            track.displayPlayButton = true;
        }

        $scope.hidePlayButton = function (track)
        {
            track.displayPlayButton = false;
        }

        $scope.addTrackToAdd = function (track)
        {
            $scope.trackToAddToNewPlaylist = track;
        }

        $scope.addTrackArrayToAdd = function (tracks)
        {
            $scope.trackArrayToAddToNewPlaylist = tracks;
        }

        $scope.trackArrayToAddIsValid = function ()
        {
            return ($scope.trackArrayToAddToNewPlaylist && $scope.trackArrayToAddToNewPlaylist.length > 0);
        }

        $scope.closeModal = function (id)
        {
            $(id).foundation('reveal', 'close');
        }
    });

    controllers.controller('SearchController', function ($scope, $routeParams, session, sharedPagesStatus, sharedProperties,
                                                         searchFactory, spotifySearchFactory, spotifyArtistFactory,
                                                         albumFactory, searchUsersFactory)
    {
        sharedPagesStatus.setTitle("Recherche: " + $routeParams.element);
        sharedPagesStatus.resetPageStatus();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().search);
        $scope.userDataConnection = sharedProperties.userDataConnectionObj();
        $scope.elementToSearch = $routeParams.element;
        $scope.tracks = [];
        $scope.artists = [];
        $scope.albums = [];
        $scope.results = [];
        $scope.usersResults = [];
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = null;
        $scope.elementsLoaded = 0;
        $scope.playlists = [];
        $scope.itemsDisplayLimit = 6;
        $scope.isConnected = session.isConnected();

        var updateUserDataConnectionCallback = function (userDataConnection)
        {
            if (userDataConnection)
            {
                $scope.userDataConnection = userDataConnection;
            }

            sharedPagesStatus.setIsPageLoaded(true);
        }

        var updateUserDataConnection = function ()
        {
            if (session.isConnected())
            {
                sharedProperties.getUserDataConnection(updateUserDataConnectionCallback);
            }
        }

        var updateFollowStatus = function (id)
        {
            updateUserDataConnection();
        }

        $scope.activeTab = function (tabName)
        {
            angular.element(tabName).click();
        }

        var getPlaylistsCallback = function (playlists)
        {
            if (playlists)
            {
                $scope.playlists = playlists;
            }

            updateUserDataConnection();
        }

        var createPlaylistByTrackCallback = function (data)
        {
            if (data)
            {
                sharedProperties.addTrackToPlaylist($scope.trackToAddToNewPlaylist, data.id);
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylistByTrack = function (playlistToAdd, modalId)
        {
            if (playlistToAdd)
            {
                sharedProperties.createPlaylist(playlistToAdd, createPlaylistByTrackCallback);

                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        $scope.getActualPlaylists = function ()
        {
            return $scope.playlists;
        }

        var computeIsLengthNull = function ()
        {
            var total = 0;
            for (var i = 0; i < arguments.length; ++i)
            {
                total += arguments[i].length ? 1 : 0;
            }
            return total;
        }

        var setWidthTabs = function (artists, albums, usersResults, tracks)
        {
            var nbShow = 1;
            nbShow += computeIsLengthNull(artists, albums, usersResults, tracks);
            $('.tab-title').width((1 / nbShow) * 100 + '%');
        }

        var searchCallback = function (searchResult)
        {
            if (searchResult)
            {
                $scope.elementsLoaded = searchResult.total;
                $scope.albums = searchResult.albums;
                $scope.artists = searchResult.artists;
                $scope.usersResults = searchResult.users;
                $scope.tracks = searchResult.tracks;

                setWidthTabs($scope.artists, $scope.albums, $scope.usersResults, $scope.tracks);
                angular.forEach($scope.albums, function (value, key)
                {
                    albumFactory.get(session.getToken(), value.collectionId, function (data)
                        {
                            $scope.albums[key].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[key].artworkUrl100, 300);
                        },
                        function (err)
                        {
                            sharedPagesStatus.setDefaultCriticalError(err);
                        });
                });

                angular.forEach($scope.artists, function (value, key)
                {
                    spotifySearchFactory.get({
                        name: value.artistName,
                        type: 'artist'
                    }).$promise.then(function (data)
                        {
                            if (data && data.artists && data.artists.items.length > 0)
                            {
                                spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                                {
                                    value.image = data.images[0];
                                    ++$scope.elementsLoaded;
                                }, function (err)
                                {
                                });
                            }
                            else
                            {
                                ++$scope.elementsLoaded;
                            }

                        }, function (err)
                        {
                        });
                });
                if (session.isConnected())
                {
                    sharedProperties.getPlaylists(getPlaylistsCallback);
                }
                else
                {
                    sharedPagesStatus.setIsPageLoaded(true);
                }
            }
        }

        if ($routeParams.element != null && $routeParams.element != "")
        {
            sharedProperties.executeSearch(searchFactory, searchUsersFactory, searchCallback, 100, $routeParams.element);
        }
        else
        {
            sharedPagesStatus.setIsPageLoaded(true);
        }

        var createPlaylistByTrackCallback = function (data)
        {
            if (data)
            {
                sharedProperties.addTrackToPlaylist($scope.trackToAddToNewPlaylist, data.id);
                sharedProperties.getPlaylists(getPlaylistsCallback);
            }
        }

        $scope.createPlaylistByTrack = function (zzToAdd, modalId)
        {
            if (playlistToAdd)
            {
                sharedProperties.createPlaylist(playlistToAdd, createPlaylistByTrackCallback);

                $scope.closeModal(modalId);
                return true;
            }
            return false;
        }

        $scope.displayPlayButton = function (track)
        {
            track.displayPlayButton = true;
        }

        $scope.hidePlayButton = function (track)
        {
            track.displayPlayButton = false;
        }

        $scope.addTrackToAdd = function (track)
        {
            $scope.trackToAddToNewPlaylist = track;
        }


        $scope.addTrackArrayToAdd = function (tracks)
        {
            $scope.trackArrayToAddToNewPlaylist = tracks;
        }

        $scope.trackArrayToAddIsValid = function ()
        {
            return ($scope.trackArrayToAddToNewPlaylist && $scope.trackArrayToAddToNewPlaylist.length > 0);
        }

        $scope.closeModal = function (id)
        {
            $(id).foundation('reveal', 'close');
        }

        var followCallback = function (id, data)
        {
            if (data)
                updateFollowStatus(id);
        }

        $scope.follow = function (id)
        {
            sharedProperties.follow(id ? id : $routeParams.id, followCallback);
        };

        $scope.unfollow = function (id)
        {
            sharedProperties.unfollow(id ? id : $routeParams.id, followCallback);
        };

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            angular.element('body').backgroundColor = 'white';
            $(document).foundation();
            $(document).foundation('reveal', 'reflow');
            $(document).foundation('dropdown', 'reflow');
        });
    });

    controllers.controller('SingleUserController', function ($location, $scope, $http, $routeParams, session,
                                                             sharedPagesStatus, sharedProperties, singleUserFactory)
    {
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().user);
        sharedPagesStatus.resetPageStatus();
        $scope.sharedPagesStatus = sharedPagesStatus;
        $scope.sharedProperties = sharedProperties;
        $scope.userData = sharedProperties.userDataConnectionObj();
        $scope.userDataConnection = sharedProperties.userDataConnectionObj();
        $scope.gravatarImgUrl = "img/mystery-man-red.png";
        $scope.activePlaylist = 0;
        $scope.isFollowing = false;

        if (session.isConnected() == false)
        {
            sharedPagesStatus.redirectToHome();
        }

        var blur = new Blur({
            el        : document.querySelector('.user-header'),
            path      : '',
            radius    : 50,
            fullscreen: true
        });

        singleUserFactory.get(session.getToken(), $routeParams.id, function (data)
            {
                if (data.email && data.name && data.id && data.following)
                {
                    sharedPagesStatus.setTitle(data.name);
                    sharedPagesStatus.setCurrentIdUser(data.id);
                    $scope.userData = {email: data.email, name: data.name, id: data.id, following: data.following};
                    if (urlExist("http://www.gravatar.com/avatar/" + md5(data.email) + "?s=300&r=pg&d=404"))
                        $scope.gravatarImgUrl = "http://www.gravatar.com/avatar/" + md5(data.email) + "?s=300&r=pg";
                    sharedProperties.getPlaylists(getPlaylistsCallback, data.id);
                    setBlur($scope.gravatarImgUrl);
                    sharedPagesStatus.setIsPageLoaded(true);
                    setIsFollowing();
                    updateUserDataConnection();
                }
            },
            function (err)
            {
                if (err && err.errorCode && err.message)
                    sharedPagesStatus.setCriticalError(err.errorCode, err.message);
            });

        var updateUserDataConnectionCallback = function (userDataConnection)
        {
            if (userDataConnection)
                $scope.userDataConnection = userDataConnection;
        }

        var updateUserDataConnection = function ()
        {
            sharedProperties.getUserDataConnection(updateUserDataConnectionCallback);
        }

        var updateUserData = function ()
        {
            singleUserFactory.get(session.getToken(), $routeParams.id, function (data)
                {
                    if (data.email && data.name && data.id && data.following)
                    {
                        $scope.userData = {email: data.email, name: data.name, id: data.id, following: data.following};
                    }
                },
                function (err)
                {
                    if (err && err.errorCode && err.message)
                        sharedPagesStatus.setCriticalError(err.errorCode, err.message);
                });
        }

        var setIsFollowing = function ()
        {
            singleUserFactory.get(session.getToken(), sharedProperties.getInfoConnection().id, function (data)
                {
                    if (data.following)
                    {
                        $scope.isFollowing = false;
                        data.following.forEach(function (entry)
                        {
                            if (entry.id == $routeParams.id)
                                $scope.isFollowing = true;
                        });
                    }
                },
                function (err)
                {
                    if (err && err.errorCode && err.message)
                        sharedPagesStatus.setCriticalError(err.errorCode, err.message);
                });
        }

        var getPlaylistsCallback = function (playlists, isError)
        {
            if (playlists && playlists.length > 0)
                $scope.playlists = playlists;
            else
                $scope.playlists = [];
        };

        var setBlur = function (path)
        {
            blur.init({
                el  : document.querySelector('.user-header'),
                path: path
            });
        };

        $scope.setActive = function (id)
        {
            $scope.activePlaylist = (id != $scope.activePlaylist) ? id : 0;
        };

        $scope.displayPlayButton = function (track)
        {
            track.displayPlayButton = true;
        };

        $scope.hidePlayButton = function (track)
        {
            track.displayPlayButton = false;
        };

        var updateFollowStatus = function (id)
        {
            if (id)
            {
                updateUserData();
                updateUserDataConnection();
            }
            else
                setIsFollowing();
        }

        var followCallback = function (id, data)
        {
            if (data)
                updateFollowStatus(id);
        }

        $scope.follow = function (id)
        {
            sharedProperties.follow(id ? id : $routeParams.id, followCallback);
        };

        $scope.unfollow = function (id)
        {
            sharedProperties.unfollow(id ? id : $routeParams.id, followCallback);
        };

        $scope.isFollowingId = function (id)
        {
            return sharedProperties.isFollowingUserId($scope.userDataConnection.following, id);
        };
    });
})();