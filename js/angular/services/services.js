/**
 * Created by blackwires on 04/03/2015.
 */

(function ()
{
    var services = angular.module('services', ['factories']);


    services.service('sharedProperties', function (localStorageService, sharedPagesStatus,
                                                   totalPlaylistsFactory, singlePlaylistFactory, singlePlaylistTracksFactory,
                                                   singlePlaylistSingleTrackFactory, tokenInfoFactory)
    {
        var title = 'Ubeat';
        var homeArtists = [];
        var homeAlbums = [];
        var playlistsStorageName = 'playlists';
        var playlists = [];
        var currentTrack = null;
        var playStates = {play: 'play', pause: 'pause', idle: 'idle'};
        var infoConnection = {email: '', name: '', token: '', id: ''};
        var connected = false;
        var playQueueStorageName = 'playQueue';
        var playQueue = localStorageService.get(playQueueStorageName);
        var tokenCookieName = 'token';
        var missingImgPlaylist = './img/missing-album.png';

        //localStorageServiceProvider.setStorageCookie(0.5, '/');

        if (playQueue == null)
        {
            playQueue = {queue: [], currentTrackId: 0};
            localStorageService.set(playQueueStorageName, playQueue);
        }

        var getServiceTokenCookie = function ()
        {
            return localStorageService.cookie.get(tokenCookieName);
        }

        this.getTokenCookie = function ()
        {
            return getServiceTokenCookie();
        }

        var updateTrackStates = function ()
        {
            for (var i = 0; i < playlists.length; ++i)
            {
                var currentPlaylist = playlists[i];
                for (var j = 0; j < currentPlaylist.tracks.length; ++j)
                {
                    if (currentTrack)
                    {
                        if (currentTrack.trackId == currentPlaylist.tracks[j].trackId)
                        {
                            currentPlaylist.tracks[j].playState = currentTrack.playState;
                        }
                        else
                        {
                            currentPlaylist.tracks[j].playState = playStates.idle;
                        }
                    }
                    else
                    {
                        currentPlaylist.tracks[j].playState = playStates.idle;
                    }
                }
            }

            for (var n = 0; n < playQueue.queue.length; ++n)
            {
                playQueue.displayPlayButton = false;

                if (playQueue.queue[n])
                {
                    if (currentTrack)
                    {
                        if (playQueue.currentTrackId == n)
                        {
                            playQueue.queue[n].playState = currentTrack.playState;
                        }
                        else
                        {
                            playQueue.queue[n].playState = playStates.idle;
                        }
                    }
                    else
                    {
                        playQueue.queue[n].playState = playStates.idle;
                    }
                    playQueue.queue[n].time = millisToTime(playQueue.queue[n].trackTimeMillis);
                }
            }
        }

        this.isConnected = function ()
        {
            var token = localStorageService.cookie.get(tokenCookieName);

            if (token)
            {
                tokenInfoFactory.get(token, function (data)
                {
                }, function (err)
                {
                    localStorageService.cookie.remove(tokenCookieName);
                    sharedPagesStatus.redirectToHome();
                });
                return true;
            }
            return false;
        }

        this.getTokenCookieName = function ()
        {
            return tokenCookieName;
        }

        this.getTitle = function ()
        {
            return title;
        }

        this.setTitle = function (value)
        {
            title = value;
        }

        this.getHomeArtists = function ()
        {
            return homeArtists;
        }

        this.setHomeArtists = function (artists)
        {
            homeArtists = [];
            angular.copy(artists, homeArtists);
        }

        this.getHomeAlbums = function ()
        {
            return homeAlbums;
        }

        this.setHomeAlbums = function (albums)
        {
            homeAlbums = [];
            angular.copy(albums, homeAlbums);
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

        this.getFormatedTotalTime = function (playlist)
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

        this.getPlaylistImg = function (playlist, size)
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
                return missingImgPlaylist;
            }
        }

        this.getPlaylists = function (callback, userId)
        {
            tokenInfoFactory.get(getServiceTokenCookie(), function (tokenData)
                {
                    if (tokenData)
                    {
                        totalPlaylistsFactory.get(getServiceTokenCookie(), function (data)
                            {
                                if (data)
                                {
                                    playlists = [];
                                    for (var i = 0; i < data.length; ++i)
                                    {
                                        var idToCheck = userId ? userId : tokenData.id;
                                        if (data[i].owner && data[i].owner.id == idToCheck)
                                        {
                                            var dataPlaylist = data[i];
                                            dataPlaylist.arrayId = i;
                                            playlists[playlists.length] = dataPlaylist;

                                            for (var j = 0; j < dataPlaylist.tracks.length; ++j)
                                            {
                                                dataPlaylist.tracks[j].playState = playStates.idle;
                                                dataPlaylist.tracks[j].displayPlayButton = false;
                                                dataPlaylist.tracks[j].time = millisToTime(dataPlaylist.tracks[j].trackTimeMillis);
                                            }
                                        }
                                    }
                                    if (callback)
                                    {
                                        callback(playlists, false);
                                    }
                                }
                            },
                            function (err)
                            {
                            }
                        );
                    }
                },
                function (err)
                {
                    if (callback)
                    {
                        callback(null, true);
                    }
                }
            );

            if (playlists)
            {
                for (var i = 0; i < playlists.length; ++i)
                {
                    playlists[i].id = i;
                }
            }
            return playlists;
        }

        this.setPlaylists = function (value)
        {
            playlists = [];
            angular.copy(playlists, value);
            localStorageService.set(playlistsStorageName, playlists);
        }

        this.getSinglePlaylist = function (playlistId, callback)
        {
            singlePlaylistFactory.get(getServiceTokenCookie(), playlistId, function (data)
            {
                if (data && callback)
                {
                    callback(data);
                }
            }, function (err)
            {

            });
            return;
        }

        this.getTrackFromPlaylist = function (trackId, playlistId)
        {
            for (var i = 0; i < playlists.length; ++i)
            {
                if (playlists[i].id == id)
                {
                    var playlist = playlists[i];
                    for (var j = 0; j < playlist.tracks.length; ++j)
                    {
                        if (playlist.tracks[j].idInPlaylist == trackId)
                        {
                            return playlist.tracks[j];
                        }
                    }
                }
            }
            return null;
        }

        this.addTrackToPlaylist = function (trackToAdd, playlistId)
        {
            singlePlaylistTracksFactory.post(getServiceTokenCookie(), playlistId, trackToAdd, function (data)
            {

            }, function (err)
            {
            });

            return true;
        }

        this.addTrackArrayToPlaylist = function (tracks, playlistId)
        {
            singlePlaylistFactory.get(getServiceTokenCookie(), playlistId, function (data)
            {
                if (data)
                {
                    data.tracks = data.tracks.concat(tracks);

                    singlePlaylistFactory.put(getServiceTokenCookie(), playlistId, data, function (data)
                    {
                    }, function (err)
                    {
                    });
                }
            }, function (err)
            {

            });
            return true;
        }

        this.removeTrackFromPlaylist = function (trackId, playlistId, callback)
        {
            singlePlaylistSingleTrackFactory.delete(getServiceTokenCookie(), playlistId, trackId,
                function (data)
                {
                    if (callback)
                    {
                        callback(data);
                    }
                }, function (err)
                {
                    if (callback)
                    {
                        callback(null);
                    }
                });

            return true;
        }

        this.createPlaylist = function (name, callback)
        {
            tokenInfoFactory.get(getServiceTokenCookie(), function (tokenData)
            {
                if (tokenData)
                {
                    totalPlaylistsFactory.post(getServiceTokenCookie(), {name: name, owner: tokenData}, function (data)
                    {
                        if (data && data.name == name)
                        {
                            var dataPlaylist = data;
                            dataPlaylist.arrayId = playlists.length - 1;
                            callback(dataPlaylist);
                        }
                        else if (callback)
                        {
                            callback(null);
                        }
                    }, function (err)
                    {
                        if (callback)
                        {
                            callback(null);
                        }
                    });
                }
            }, function (err)
            {
            });
        }

        this.addExistingPlaylist = function (playlist)
        {
            var playlistLength = playlists.length;
            playlists[playlistLength] = playlist;
            localStorageService.set(playlistsStorageName, playlists);
        }

        this.removePlaylist = function (id, callback)
        {
            singlePlaylistFactory.delete(getServiceTokenCookie(), id, function (data)
            {
                if (callback)
                {
                    callback();
                }
            }, function (err)
            {
            });
        }

        this.renamePlaylist = function (id, playlist, newName, callback)
        {
            singlePlaylistFactory.get(getServiceTokenCookie(), id, function (data)
            {
                if (data)
                {
                    data.name = newName;
                    singlePlaylistFactory.put(getServiceTokenCookie(), id, data, function (data)
                    {
                        if (callback)
                        {
                            callback();
                        }
                    }, function (err)
                    {
                    });
                }
            }, function (err)
            {

            });
        }

        this.getSearchResultObj = function()
        {
            return {total: 0, artists: [], albums: [], tracks: [], users: []};
        }

        this.addTrackToPlayQueue = function (track)
        {
            playQueue.queue[playQueue.queue.length] = track;
            playQueue.currentTrackId = playQueue.queue.length - 1;

            localStorageService.set(playQueueStorageName, playQueue);
        }

        this.addToPlayQueueAtCurrentTrack = function(trackArray)
        {
            if (playQueue.currentTrackId < (playQueue.queue.length - 1))
            {
                var leftTracks = playQueue.queue.splice(playQueue.currentTrackId + 1, (playQueue.queue.length - (playQueue.currentTrackId + 1)))

                playQueue.queue = playQueue.queue.concat(trackArray);
                playQueue.queue = playQueue.queue.concat(leftTracks);
            }
            else if (playQueue.currentTrackId >= (playQueue.queue.length - 1))
                this.addTrackArrayToPlayQueue(trackArray, true);
        }

        this.addTrackArrayToPlayQueue = function (trackArray, setCurrentTrack)
        {
            var saveLength = playQueue.queue.length;
            playQueue.queue = playQueue.queue.concat(trackArray);
            playQueue.currentTrackId = saveLength;

            updateTrackStates();

            if (playQueue.queue.length > 0)
            {
                this.setCurrentTrack(playQueue.queue[playQueue.currentTrackId], false, playStates.play);
            }

            localStorageService.set(playQueueStorageName, playQueue);
        }

        this.removeTrackFromPlayQueue = function (id)
        {
            if (id == playQueue.queue.currentTrackId)
            {
                setCurrentTrack(playQueue.queue[0], false, playStates.idle);
            }

            playQueue.queue.splice(id, 1);

            localStorageService.set(playQueueStorageName, playQueue);
        }

        this.getPlayQueue = function ()
        {
            return playQueue;
        }

        this.getPlayQueueLength = function ()
        {
            return playQueue.queue.length;
        }


        this.getRandomQueueTrack = function (isRedundancy)
        {
            if (!isRedundancy)
            {
                var random = playQueue.currentTrackId;
                while (random == playQueue.currentTrackId)
                    random = Math.floor((Math.random() * playQueue.queue.length));

                playQueue.currentTrackId = random;

                var track = playQueue.queue[random];
                if (track != null)
                {
                    playQueue.currentTrackId = random;
                    this.setCurrentTrack(track, false, track.playState);
                }

                return track;
            }
            else
            {
                return null;
            }
        }

        this.resetPlayQueue = function ()
        {
            playQueue.queue = [];
            localStorageService.set(playQueueStorageName, playQueue);
        }

        this.getPlayQueueCurrentTrack = function ()
        {
            return playQueue.queue[playQueue.currentTrackId];
        }

        this.getPlayQueueCurrentTrackId = function ()
        {
            return playQueue.currentTrackId;
        }

        this.getPlayQueueNextTrack = function (setCurrentTrackId)
        {
            var track = null;

            if (playQueue.currentTrackId >= (playQueue.queue.length - 1))
            {
                track = playQueue.queue[0];
                if (setCurrentTrackId)
                    playQueue.currentTrackId = 0;
            }
            else
            {
                track = playQueue.queue[playQueue.currentTrackId + 1];
                if (setCurrentTrackId)
                    playQueue.currentTrackId += 1;
            }

            if (track != null)
            {
                this.setCurrentTrack(track, false, track.playState);
            }

            localStorageService.set(playQueueStorageName, playQueue);
            return track;
        }

        this.isLastSongInQueue = function ()
        {
            if (playQueue.currentTrackId >= playQueue.queue.length - 1)
                return true;
            return false;
        }

        this.getPlayQueuePreviousTrack = function (setCurrentTrackId)
        {
            var track = null;
            if (playQueue.currentTrackId <= 0)
            {
                track = playQueue.queue[playQueue.queue.length - 1];
                if (setCurrentTrackId)
                    playQueue.currentTrackId = playQueue.queue.length - 1;
            }
            else
            {
                track = playQueue.queue[playQueue.currentTrackId - 1];
                if (setCurrentTrackId)
                    playQueue.currentTrackId -= 1;
            }

            if (track != null)
            {
                this.setCurrentTrack(track, false, track.playState);
            }

            localStorageService.set(playQueueStorageName, playQueue);
            return track;
        }


        this.getCurrentTrack = function ()
        {
            if (playQueue.queue.length <= 0)
                return null;
            if (currentTrack == null)
                currentTrack = playQueue.queue[playQueue.currentTrackId];
            updateTrackStates();
            return currentTrack;
        }

        var getTrackInPlayQueue = function (track)
        {
            if (track != null)
            {
                for (var i = 0; i < playQueue.queue.length; ++i)
                {
                    var currentTrackInQueue = playQueue.queue[i];

                    if (currentTrackInQueue.trackId == track.trackId)
                    {
                        return currentTrackInQueue;
                    }
                }
            }
            return null;
        }

        var getTrackIdInPlayQueue = function (track)
        {
            if (track != null)
            {
                for (var i = 0; i < playQueue.queue.length; ++i)
                {
                    var currentTrackInQueue = playQueue.queue[i];

                    if (currentTrackInQueue.trackId == track.trackId)
                    {
                        return i;
                    }
                }
            }
            return -1;
        }

        this.setCurrentTrackById = function(id, state)
        {
            if (id < playQueue.queue.length)
            {
                var track = playQueue.queue[id];

                currentTrack = track;

                if (state)
                currentTrack.playState = state;
                playQueue.currentTrackId = id;
            }
        }

        this.setCurrentTrack = function (track, addToPlayQueue, state, setCurrentTrackId )
        {
            currentTrack = track;
            var trackIdInQueue = -1;
            if (state)
            {
                currentTrack.playState = state;
            }

            if (addToPlayQueue)
            {
                this.addTrackToPlayQueue(currentTrack);
            }
            else if (setCurrentTrackId && (trackIdInQueue = getTrackIdInPlayQueue(track)) > -1)
            {
                playQueue.currentTrackId = trackIdInQueue;
            }

            updateTrackStates();
        }

        this.getPlayStates = function ()
        {
            return playStates;
        }

        this.updateTrackStates = function ()
        {
            updateTrackStates();
        }

        this.getInfoConnection = function ()
        {
            return infoConnection;
        }

        this.setInfoConnection = function (email, name, token, id)
        {
            infoConnection =
            {
                email: email,
                name : name,
                token: token,
                id   : id
            };
        }

        this.getConnected = function ()
        {
            return connected;
        }

        this.setConnected = function (val)
        {
            if (val == true || val == false)
            {
                connected = val;
                services.isSecure = val;
                //factories.isSecure = val;
            }
        }

        this.getGravatar = function (email, size)
        {
            return "http://www.gravatar.com/avatar/" + md5(email) + "?s=" + size + "&r=pg&d=http://glo3102.github.io/team02/img/mystery-man-red.png";
        }

        this.executeSearch = function(searchFactory, searchUsersFactory, callback, maxLimit, searchStr)
        {
            var results;
            var searchResult = this.getSearchResultObj();

            var localSharedProperties = this;

            searchFactory.get(this.getTokenCookie(),
                encodeURIComponent(searchStr),
                maxLimit,
                function (data)
                {
                    if (data && data.results.length > 0)
                    {
                        results = data.results;
                        for (var i = 0; i < data.results.length; ++i)
                        {
                            switch (data.results[i].wrapperType)
                            {
                                case "track":
                                    var newElem = data.results[i];
                                    searchResult.tracks[searchResult.tracks.length] = newElem;
                                    ++searchResult.total;
                                    var currentTrack = localSharedProperties.getCurrentTrack();

                                    if (currentTrack && currentTrack.trackId == newElem.trackId)
                                    {
                                        newElem.playState = currentTrack.playState;
                                    }
                                    else
                                    {
                                        newElem.playState = localSharedProperties.getPlayStates().idle;
                                    }
                                    newElem.time = millisToTime(newElem.trackTimeMillis);
                                    newElem.displayPlayButton = false;
                                    break;
                                case "collection":
                                    searchResult.albums[searchResult.albums.length] = data.results[i];
                                    ++searchResult.total;
                                    break;
                                case "artist":
                                    var newArtist = data.results[i];
                                    ++searchResult.total;
                                    searchResult.artists[searchResult.artists.length] = newArtist;
                                    break;
                            }
                        }

                        if (localSharedProperties.isConnected())
                        {
                            searchUsersFactory.get(localSharedProperties.getTokenCookie(),
                                encodeURIComponent(searchStr), function (data)
                                {
                                    if (data && data.length > 0)
                                    {
                                        searchResult.users = data;
                                        callback(searchResult);
                                    }
                                },
                                function (err)
                                {
                                    callback(searchResult);
                                });
                        }
                        else
                        {
                            callback(searchResult);
                        }
                    }
                    else
                    {
                        sharedPagesStatus.setIsPageLoaded(true);
                        callback(searchResult);
                    }
                }, function (err)
                {
                });
        }

    });

    services.service('sharedPagesStatus', function ($location, $route)
    {
        var pageTitle = 'Ubeat';
        var isCriticalError = false;
        var isPageLoaded = false;
        var errorMessage = '';
        var errorStatus = 0;
        var pageErrorUrl = '/notfound/';
        var pageEnum = {
            home     : 'home',
            artist   : 'artist',
            album    : 'album',
            playlist : 'playlist',
            error    : 'error',
            playQueue: 'queue',
            search   : 'search',
            user     : 'user'
        };
        var currentPage = pageEnum.home;
        var currentIdUser;
        var queuePage = pageEnum.playQueue;
        var queuePageUrl = "/queue/";
        var saveQueuePreviousPage = {pageEnum: pageEnum.home, pageUrl: "#/"};

        this.setSaveQueuePreviousPage = function (pageEnum, url)
        {
            saveQueuePreviousPage.pageEnum = pageEnum;
            saveQueuePreviousPage.pageUrl = url;
        }

        this.getSaveQueuePreviousPage = function ()
        {
            return saveQueuePreviousPage;
        }

        this.redirectToHome = function ()
        {
            $location.path("/");
            $route.reload();
        }

        this.setCurrentIdUser = function (id)
        {
            currentIdUser = id;
        }

        this.getCurrentIdUser = function ()
        {
            return currentIdUser;
        }

        this.isCurrentPage = function (page)
        {
            return page == currentPage;
        }

        this.getCurrentPage = function ()
        {
            return currentPage;
        }

        this.setCurrentPage = function (page)
        {
            currentPage = page;
        }

        this.getPageEnum = function ()
        {
            return pageEnum;
        }

        this.getTitle = function ()
        {
            return pageTitle;
        }

        this.setTitle = function (value)
        {
            pageTitle = value;
        }

        this.getErrorMessage = function ()
        {
            return errorMessage;
        }

        this.setErrorMessage = function (msg)
        {
            errorMessage = msg;
        }

        this.getErrorStatus = function ()
        {
            return errorStatus;
        }

        this.setErrorStatus = function (status)
        {
            errorStatus = status;
        }

        this.getIsCriticalError = function ()
        {
            return isCriticalError;
        }

        this.setIsCriticalError = function (val)
        {
            isCriticalError = val;

            if (val == true)
            {
                this.setIsPageLoaded(true);
            }
        }

        this.getIsPageLoaded = function ()
        {
            return isPageLoaded;
        }

        this.setIsPageLoaded = function (val)
        {
            isPageLoaded = val;
        }

        this.resetPageStatus = function ()
        {
            isCriticalError = false;
            isPageLoaded = false;
        }

        this.setCriticalError = function (status, msg)
        {
            if (status == 0)
            {
                errorStatus = 503;
                errorMessage = "Service unavailable";
            }
            else
            {
                errorStatus = status;
                errorMessage = msg;
            }
            this.setIsCriticalError(true);
        }

        this.setDefaultCriticalError = function (err)
        {
            if (err)
            {
                this.setCriticalError(err.status, err.statusText);
            }
            else
            {
                this.setCriticalError(0, "");
            }
        }

        this.togglePlayQueue = function ()
        {
            var queuePreviousPage = this.getSaveQueuePreviousPage();
            var currentPage = this.getCurrentPage();

            if (currentPage != queuePage)
            {
                this.setSaveQueuePreviousPage(currentPage, $location.url());
                $location.path(queuePageUrl);
                $route.reload();
            }
            else
            {
                if (queuePreviousPage.pageUrl == "#/")
                {
                    $location.path("/");
                }
                else
                {
                    $location.path(queuePreviousPage.pageUrl);
                }
                $route.reload();
                this.setSaveQueuePreviousPage(this.getCurrentPage(), $location.url());
            }
        }

    });
})();