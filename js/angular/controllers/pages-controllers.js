/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var controllers = angular.module('pagesControllers', ['factories', 'directives', 'services', 'ngAudio', 'truncate']);

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
                    console.log("Album Err: " + err);
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
            artistFactory.get({id: $routeParams.id}).$promise.then(function (data)
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

                                    blur.init({
                                        el  : document.querySelector('.artist-header'),
                                        path: $scope.artist.image.url
                                    });

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
                    }
                    else
                    {
                        sharedPagesStatus.pageCriticFailure();
                    }
                },
                function (err)
                {
                });
        }
        else
        {
            sharedPagesStatus.pageCriticFailure();
        }


        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation('interchange', 'reflow');
        });
    });

    controllers.controller('AlbumController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties,
                                                        albumFactory, artistFactory, albumTracksFactory, trackFactory)
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
        $scope.errorTitle = "Erreur 503";
        $scope.errorMsg = "Service temporairement indisponible.";
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().album);

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
                    $scope.filtersValues = ['number', 'name', 'artistName', '-time.Minutes', 'time.Minutes'];
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
                        var dataTracks = data.results;

                        for (var i = 0; i < dataTracks.length; ++i)
                        {
                            var trackFacto = new trackFactory();
                            trackFacto.fillFromData(dataTracks[i]);
                            $scope.tracks[i] = trackFacto;

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

                        sharedPagesStatus.setIsPageLoaded(true);
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
                    sharedPagesStatus.pageCriticFailure();
                }

            });
        }
        else
        {
            sharedPagesStatus.pageCriticFailure();
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

    controllers.controller('PlaylistsController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.missingImgPlaylist = './img/missing-album.png';
        $scope.sharedProperties = sharedProperties;
        $scope.playlistToAdd = {};
        $scope.playlistToAdd.defaultName = "Nouvelle playlist";
        $scope.playlistToAdd.name = $scope.playlistToAdd.defaultName;
        $scope.playlists = sharedProperties.getPlaylists();
        $scope.alertMessages = [];
        $scope.active = sharedProperties.getPlaylist(0);
        $scope.isNewPlaylistClicked = false;
        $scope.playlistCurrentRename = {};
        $scope.playlistCurrentRename.name = '';
        $scope.playStates = sharedProperties.getPlayStates();
        $scope.defaultPlaylist = {};
        $scope.defaultPlaylist.name = "Pas de playlist";
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().playlist);
        sharedPagesStatus.setTitle('Playlists');

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

            playlist.tracks.forEach(function (entry)
            {
                totalTime += entry.trackTimeMillis;
            });
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
                $scope.active = $scope.playlists[$scope.playlists.length - 1];
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

        $scope.rename = function (playlist, playlistCurrentRename)
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

    controllers.controller('ErrorPageController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().error);
    })

    controllers.controller('PlayQueueController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.setTitle("File d'attente");
        sharedPagesStatus.resetPageStatus();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().queue);
        $scope.sharedProperties = sharedProperties;
        sharedPagesStatus.setIsPageLoaded(true);
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist;

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
    });

    controllers.controller('SearchController', function ($scope, $routeParams, sharedPagesStatus, sharedProperties,
                                                         searchFactory, trackFactory, spotifySearchFactory, spotifyArtistFactory,
                                                         albumFactory)
    {
        sharedPagesStatus.setTitle("Recherche: " + $routeParams.element);
        sharedPagesStatus.resetPageStatus();
        sharedPagesStatus.setCurrentPage(sharedPagesStatus.getPageEnum().search);
        $scope.elementToSearch = $routeParams.element;
        $scope.tracks = [];
        $scope.artists = [];
        $scope.albums = [];
        $scope.trackToAddToNewPlaylist = null;
        $scope.trackArrayToAddToNewPlaylist = null;

        searchFactory.get({element: encodeURIComponent($routeParams.element), maxItems: 20}).$promise.then(function (data)
        {
            if (data && data.results.length > 0)
            {
                console.log(data.results.length);
                for (var i = 0; i < data.results.length; ++i)
                {
                    switch (data.results[i].wrapperType)
                    {
                        case "track":
                            var newElem = new trackFactory();
                            newElem.fillFromData(data.results[i]);
                            $scope.tracks[$scope.tracks.length] = newElem;
                            break;
                        case "collection":
                            $scope.albums[$scope.albums.length] = data.results[i];
                            break;
                        case "artist":
                            var newArtist = data.results[i];
                            spotifySearchFactory.get({
                                name: newArtist.artistName,
                                type: 'artist'
                            }).$promise.then(function (data)
                                {
                                    spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                                    {
                                        newArtist.image = data.images[0];
                                        $scope.artists[$scope.artists.length] = newArtist;
                                    }, function (err)
                                    {
                                    });

                                }, function (err)
                                {
                                });
                            break;
                    }
                }

                angular.forEach($scope.albums, function (value, key)
                {
                    albumFactory.get({id: value.collectionId}).$promise.then(function (data)
                        {
                            $scope.albums[key].artworkUrl300 = itunesLinkImageSizeTo($scope.albums[key].artworkUrl100, 300);
                        },
                        function (err)
                        {
                            console.log("Album Err: " + err);
                        });
                });
                sharedPagesStatus.setIsPageLoaded(true);
            }
            else
            {
                sharedPagesStatus.setIsPageLoaded(true);
            }
        }, function(err)
        {
            console.log("Search Error: " + err);
            sharedPagesStatus.pageCriticFailure();
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
})();