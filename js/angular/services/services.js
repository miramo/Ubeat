/**
 * Created by blackwires on 04/03/2015.
 */

(function ()
{
    var services = angular.module('services', ['factories']);

    services.service('sharedProperties', function (ngAudio, localStorageService,
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

        if (playQueue == null)
        {
            playQueue = {queue: [], currentTrackId: 0};
            localStorageService.set(playQueueStorageName, playQueue);
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
                if (currentTrack)
                {
                    if (currentTrack.trackId == playQueue.queue[n].trackId)
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
                localStorageService.set(playQueueStorageName, playQueue);
            }
        }

        this.isConnected = function ()
        {
            var token = localStorageService.cookie.get(tokenCookieName);

            if (token)
            {
                return true;
            }
            return false;
        }

        this.getTokenCookieName = function ()
        {
            return tokenCookieName;
        }

        this.addTrackToPlayQueue = function (track)
        {
            playQueue.queue[playQueue.queue.length] = track;
            playQueue.currentTrackId = playQueue.queue.length - 1;

            localStorageService.set(playQueueStorageName, playQueue);
        }

        this.removeTrackFromPlayQueue = function (id)
        {
            playQueue.queue.splice(id, 1);
            localStorageService.set(playQueueStorageName, playQueue);
        }

        this.getPlayQueue = function ()
        {
            return playQueue;
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

            localStorageService.set(playQueueStorageName, playQueue);
            return track;
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

            localStorageService.set(playQueueStorageName, playQueue);
            return track;
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

        this.getPlaylists = function (callback)
        {
            tokenInfoFactory.get().$promise.then(function (tokenData)
                {
                    if (tokenData)
                    {
                        console.log("Token: " + tokenData);
                        totalPlaylistsFactory.query({}).$promise.then(function (data)
                            {
                                if (data)
                                {
                                    playlists = [];
                                    for (var i = 0; i < data.length; ++i)
                                    {
                                        if (data[i].owner && data[i].owner.email == tokenData.email)
                                        {
                                            var dataPlaylist = data[i];
                                            dataPlaylist.arrayId = i;
                                            playlists[playlists.length] = dataPlaylist;
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
                    console.log("Token Fail: " + err);
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
            singlePlaylistFactory.get({id: playlistId}).$promise.then(function (data)
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
            singlePlaylistTracksFactory.put({id: playlistId, track: trackToAdd}).$promise.then(function(data)
            {

            }, function(err) {});

            return true;
        }

        this.addTrackArrayToPlaylist = function (tracks, playlistId)
        {
            if (tracks)
            {
                for (var i = 0; i < playlists.length; ++i)
                {
                    if (i == playlistId)
                    {
                        var playlist = playlists[i];
                        playlist.tracks = playlist.tracks.concat(tracks);
                        localStorageService.set(playlistsStorageName, playlists);
                        return true;
                    }
                }
            }
            return false;
        }

        this.removeTrackFromPlaylist = function (trackIdInPlaylist, playlistId)
        {
            for (var i = 0; i < playlists.length; ++i)
            {
                if (i == playlistId)
                {
                    var playlist = playlists[playlistId];
                    for (var j = 0; j < playlist.tracks.length; ++j)
                    {
                        if (j == trackIdInPlaylist)
                        {
                            playlist.tracks.splice(j, 1);
                            localStorageService.set(playlistsStorageName, playlists);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        this.createPlaylist = function (name, callback)
        {
            tokenInfoFactory.get().$promise.then(function (tokenData)
            {
                if (tokenData)
                {
                    totalPlaylistsFactory.save({name: name, owner: tokenData}, function (data)
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
            console.log("RemovePlaylist");
            singlePlaylistFactory.delete({id: id}, function (data)
            {
                if (data)
                {
                    console.log("DeletePlaylist[" + id + "]:" + JSON.stringify(data));
                }
                if (callback)
                {
                    callback();
                }
            }, function (err)
            {
            });
        }

        this.renamePlaylist = function (playlistId, newName, callback)
        {
            singlePlaylistFactory.get({id: playlistId}).$promise.then(function(data)
            {
                if (data)
                {
                    data.name = newName;
                    singlePlaylistFactory.put({id: playlistId, 'name': newName}).$promise.then(function (data)
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

        this.getCurrentTrack = function ()
        {
            return currentTrack;
            updateTrackStates();
        }

        this.setCurrentTrack = function (track, addToPlayQueue, state)
        {
            currentTrack = track;
            if (state)
            {
                currentTrack.playState = state;
            }

            if (addToPlayQueue)
            {
                this.addTrackToPlayQueue(currentTrack);
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
    });

    services.service('sharedPagesStatus', function ($location)
    {
        var pageTitle = 'Ubeat';
        var isCriticalError = false;
        var isPageLoaded = false;
        var errorMessage = '';
        var pageErrorUrl = '/notfound/';
        var pageEnum = {
            home     : 'home',
            artist   : 'artist',
            albums   : 'albums',
            playlist : 'playlist',
            error    : 'error',
            playQueue: 'queue',
            search   : 'search',
            user     : 'user'
        };
        var currentPage = pageEnum.home;

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

        this.getIsCriticalError = function ()
        {
            return isCriticalError;
        }

        this.setIsCriticalError = function (val)
        {
            isCriticalError = val;
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

        this.pageCriticFailure = function ()
        {
            this.setIsCriticalError(true);
            this.setIsPageLoaded(true);
        }
    });
})();