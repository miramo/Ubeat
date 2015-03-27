/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('pagesControllers', ['factories', 'directives', 'services', 'truncate']);

    controllers.controller('HomeController', function ($scope, sharedPagesStatus, sharedProperties,
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
            artistFactory.get(sharedProperties.getTokenCookie(), value, function (data)
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
                                    sharedPagesStatus.setCriticalError(err.status, err.statusText);
                                });

                            }, function (err)
                            {
                                sharedPagesStatus.setCriticalError(err.status, err.statusText);
                            });
                    }
                },
                function (err)
                {
                    sharedPagesStatus.setCriticalError(err.status, err.statusText);
                });
        });

        angular.forEach($scope.albumsIds, function (value, key)
        {
            albumFactory.get(sharedProperties.getTokenCookie(), value, function (data)
                {
                    $scope.albumsTab[key] = data.results[0];
                    $scope.albumsTab[key].artworkUrl300 = itunesLinkImageSizeTo($scope.albumsTab[key].artworkUrl100, 300);
                    ++$scope.albumsLoadedCount;
                },
                function (err)
                {
                    sharedPagesStatus.setCriticalError(err.status, err.statusText);
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
            $(document).foundation();
        });
    });

    controllers.controller('ArtistController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties,
                                                         artistFactory, artistAlbumsFactory, artistBiographiesFactory, spotifyArtistFactory, spotifySearchFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.artistPictureLoaded = false;
        $scope.isTabletOrDesktop = true;
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().artist);

        var isValidArtist = /^\d+$/.test($routeParams.id);

        if (isValidArtist)
        {
            artistFactory.get(sharedProperties.getTokenCookie(), $routeParams.id, function (data)
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
                                        sharedPagesStatus.setCriticalError(err.status, err.statusText);
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
                                    sharedPagesStatus.setCriticalError(err.status, err.statusText);
                                });

                            }, function (err)
                            {
                                sharedPagesStatus.setCriticalError(err.status, err.statusText);
                            });
                        artistAlbumsFactory.get(sharedProperties.getTokenCookie(), $routeParams.id, function (data)
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
                                sharedPagesStatus.setCriticalError(err.status, err.statusText);
                            });
                    }
                    else
                    {
                        sharedPagesStatus.setCriticalError(404, "Artist not found");
                    }
                },
                function (err)
                {
                    sharedPagesStatus.setCriticalError(err.status, err.statusText);
                });
        }
        else
        {
            sharedPagesStatus.setCriticalError(404, "Artist not found");
        }


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
        $scope.playlits = [];
        $scope.isPageFailedLoad = false;
        $scope.errorTitle = "Erreur 503";
        $scope.errorMsg = "Service temporairement indisponible.";
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().album);

        var getPlaylistsCallback = function (playlists)
        {
            if (playlists)
            {
                $scope.playlists = playlists;
            }
        }

        if (sharedProperties.isConnected())
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
        }

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

        var pageIsLoaded = function ()
        {
            sharedPagesStatus.setIsPageLoaded(true);

            $(document).foundation('dropdown', 'reflow');
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

        var setTracksData = function(dataTracks)
        {
            for (var i = 0; i < dataTracks.length; ++i)
            {
                $scope.tracks[i] = dataTracks[i];

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
        }

        var blur = new Blur({
            el        : document.querySelector('body'),
            path      : '',
            radius    : 50,
            fullscreen: true
        });

        var isAlbumIdValid = /^\d+$/.test($routeParams.id);

        if (isAlbumIdValid)
        {
            albumFactory.get(sharedProperties.getTokenCookie(), $routeParams.id, function (data)
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

                    artistFactory.get(sharedProperties.getTokenCookie(), $scope.album.artistId, function (data)
                    {
                        $scope.artist = data.results[0];
                    }, function(err) { sharedPagesStatus.setCriticalError(err.status, err.statusText); });

                    albumTracksFactory.get(sharedProperties.getTokenCookie(), $routeParams.id, function (data)
                    {
                        var dataTracks = data.results;

                        setTracksData(dataTracks);

                        pageIsLoaded();
                    }, function(err){ sharedPagesStatus.setCriticalError(err.status, err.statusText); });

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

            }, function(err)
            {
                sharedPagesStatus.setCriticalError(err.status, err.statusText);
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

    controllers.controller('PlaylistsController', function ($scope, $location, $route, $routeParams, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.missingImgPlaylist = './img/missing-album.png';
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

        var redirectToHome = function ()
        {
            $location.path("/");
            $route.reload();
        }

        if (sharedProperties.isConnected() == false)
        {
            redirectToHome();
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
                $scope.active = playlists[0];
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
                redirectToHome();
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

        var getTotalTime = function (playlist)
        {
            var totalTime = 0;

            if (playlist && playlist.tracks)
            {
                playlist.tracks.forEach(function (entry)
                {
                    if (entry && entry.trackTimeMillis)
                    {
                        totalTime += entry.trackTimeMillis;
                    }
                });
            }

            return millisToTime(totalTime);
        }

        $scope.getFormatedTotalTime = function (playlist)
        {
            var totalTime = getTotalTime(playlist);
            var formatedStr = "";

            if ((totalTime.Hours + totalTime.Minutes + totalTime.Seconds) <= 0)
            {
                formatedStr += "0 s";
            }
            else
            {
                if (totalTime.Hours > 0)
                    formatedStr += totalTime.Hours + " h ";
                if (totalTime.Minutes > 0)
                    formatedStr += totalTime.Minutes + " min ";
                else if (totalTime.Seconds > 0)
                    formatedStr += totalTime.Seconds + " s ";
            }

            return formatedStr;
        }

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
            sharedProperties.renamePlaylist(id, newName, confirmRenameCallback);
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
            sharedProperties.createPlaylist(playlistName, createPlaylistCallback);
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
            $(document).foundation();
            $(document).foundation('dropdown', 'reflow');
        });
    });

    controllers.controller('ErrorPageController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().error);
        sharedPagesStatus.setIsPageLoaded(true);
    })

    controllers.controller('PlayQueueController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.setTitle("File d'attente");
        sharedPagesStatus.resetPageStatus();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().queue);
        $scope.sharedProperties = sharedProperties;
        sharedPagesStatus.setIsPageLoaded(true);
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = [];
        $scope.playlists = [];

        var getPlaylistsCallback = function (playlists)
        {
            if (playlists)
            {
                $scope.playlists = playlists;
            }
        }

        if (sharedProperties.isConnected())
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
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

    controllers.controller('SearchController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties,
                                                         searchFactory, spotifySearchFactory, spotifyArtistFactory,
                                                         albumFactory)
    {
        sharedPagesStatus.setTitle("Recherche: " + $routeParams.element);
        sharedPagesStatus.resetPageStatus();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().search);
        $scope.elementToSearch = $routeParams.element;
        $scope.tracks = [];
        $scope.artists = [];
        $scope.albums = [];
        $scope.results = [];
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = null;
        $scope.elementsLoaded = 0;
        $scope.playlists = [];
        $scope.artistDisplayLimit = 5;
        $scope.albumDisplayLimit = 5;

        var getPlaylistsCallback = function (playlists)
        {
            if (playlists)
            {
                $scope.playlists = playlists;
            }
        }

        if (sharedProperties.isConnected())
        {
            sharedProperties.getPlaylists(getPlaylistsCallback);
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

        $scope.$watch('elementsLoaded', function (oldVal, newVal)
        {
            if (newVal > 0 && newVal >= ($scope.results.length - 1))
            {
                angular.forEach($scope.albums, function (value, key)
                {
                    albumFactory.get(sharedProperties.getTokenCookie(), value.collectionId, function (data)
                        {
                            $scope.albums[key].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[key].artworkUrl100, 300);
                        },
                        function (err)
                        {
                            sharedPagesStatus.setCriticalError(err.status, err.statusText);
                        });
                });
                sharedPagesStatus.setIsPageLoaded(true);
            }
        });

        searchFactory.get(sharedProperties.getTokenCookie(),
            encodeURIComponent($routeParams.element),
            200,
            function (data)
            {
                if (data && data.results.length > 0)
                {
                    $scope.results = data.results;
                    for (var i = 0; i < data.results.length; ++i)
                    {
                        switch (data.results[i].wrapperType)
                        {
                            case "track":
                                var newElem = data.results[i];
                                $scope.tracks[$scope.tracks.length] = newElem;
                                ++$scope.elementsLoaded;
                                var currentTrack = sharedProperties.getCurrentTrack();

                                if (currentTrack && currentTrack.trackId == newElem.trackId)
                                {
                                    newElem.playState = currentTrack.playState;
                                }
                                else
                                {
                                    newElem.playState = sharedProperties.getPlayStates().idle;
                                }
                                newElem.filter = $scope.filter;
                                newElem.time = millisToTime(newElem.trackTimeMillis);
                                newElem.displayPlayButton = false;
                                break;
                            case "collection":
                                $scope.albums[$scope.albums.length] = data.results[i];
                                ++$scope.elementsLoaded;
                                break;
                            case "artist":
                                var newArtist = data.results[i];
                                spotifySearchFactory.get({
                                    name: newArtist.artistName,
                                    type: 'artist'
                                }).$promise.then(function (data)
                                    {
                                        if (data && data.artists && data.artists.items.length > 0)
                                        {
                                            spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                                            {
                                                newArtist.image = data.images[0];
                                                $scope.artists[$scope.artists.length] = newArtist;
                                                ++$scope.elementsLoaded;
                                            }, function (err)
                                            {
                                                sharedPagesStatus.setCriticalError(err.status, err.statusText);
                                            });
                                        }
                                        else
                                        {
                                            ++$scope.elementsLoaded;
                                        }

                                    }, function (err)
                                    {
                                        sharedPagesStatus.setCriticalError(err.status, err.statusText);
                                    });
                                break;
                        }
                    }
                }
                else
                {
                    sharedPagesStatus.setIsPageLoaded(true);
                }
            }, function (err)
            {
                sharedPagesStatus.setCriticalError(err.status, err.statusText);
            });

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

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
        });
    });

    controllers.controller('SingleUserController', function ($scope, $http, $routeParams, sharedPagesStatus, sharedProperties, singleUserFactory)
    {
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().user);
        sharedPagesStatus.setIsPageLoaded(true);
        $scope.sharedPagesStatus = sharedPagesStatus;
        $scope.sharedProperties = sharedProperties;
        $scope.userData = {email: "", name: "", id: "", following: []};
        $scope.gravatarImgUrl = "img/mystery-man-red.png";
        var blur = new Blur({
            el        : document.querySelector('.user-header'),
            path      : '',
            radius    : 50,
            fullscreen: true
        });

        singleUserFactory.get(sharedProperties.getTokenCookie(), $routeParams.id, function (data)
            {
                if (data.email && data.name && data.id && data.following)
                {
                    sharedPagesStatus.setTitle(data.name);
                    $scope.userData = {email: data.email, name: data.name, id: data.id, following: data.following};
                    if (urlExist("http://www.gravatar.com/avatar/" + md5(data.email) + "?s=300&r=pg&d=404"))
                        $scope.gravatarImgUrl = "http://www.gravatar.com/avatar/" + md5(data.email) + "?s=300&r=pg";
                    setBlur($scope.gravatarImgUrl);
                    //console.log($scope.userData);
                }
            },
            function (err)
            {
                sharedPagesStatus.setCriticalError(err.errorCode, err.message);
            });

        var setBlur = function(path)
        {
            blur.init({
                el  : document.querySelector('.user-header'),
                path: path
            });
        };
    });
})();