/**
 * Created by blackwires on 04/03/2015.
 */

(function ()
{
    var services = angular.module('services', []);

    services.service('sharedProperties', function (ngAudio, localStorageService, trackFactory, playlistFactory)
    {
        var title = 'Ubeat';
        var homeArtists = [];
        var homeAlbums = [];
        var playlists = localStorageService.get('playlists');
        var currentTrack = null;
        var playStates = {play: 'play', pause: 'pause', idle: 'idle'};
        var connection = {email: '', name: '', token: '', id: ''};
        var connected = false;

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
        }

        if (playlists == null)
        {
            playlists = [];
            localStorageService.set('playlists', playlists);
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

        this.getPlaylists = function ()
        {
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
            localStorageService.set('playlists', playlists);
        }

        this.getPlaylist = function (id)
        {
            for (var i = 0; i < playlists.length; ++i)
            {
                playlists[i].id = i;
                if (i == id)
                {
                    return playlists[i];
                }
            }
            return null;
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

        this.addTrackToPlaylist = function (track, playlistId)
        {
            for (var i = 0; i < playlists.length; ++i)
            {
                if (i == playlistId)
                {
                    var playlist = playlists[i];
                    var tracksLength = playlist.tracks.length;
                    //for (var j = 0; j < tracksLength; ++j)
                    //{
                    //    if (playlist.tracks[j].idInPlaylist == track.id)
                    //    {
                    //        return false;
                    //    }
                    //}
                    track.idInPlaylist = tracksLength;
                    playlist.tracks[tracksLength] = track;
                    localStorageService.set('playlists', playlists);
                    return true;
                }
            }
            return false;
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
                        localStorageService.set('playlists', playlists);
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
                            localStorageService.set('playlists', playlists);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        this.createPlaylist = function (name)
        {
            if (name)
            {
                var playlistLength = playlists.length;
                var newPlaylist = new playlistFactory();

                newPlaylist.name = name;
                newPlaylist.id = playlistLength;
                newPlaylist.tracks = [];
                playlists[playlistLength] = newPlaylist;
                localStorageService.set('playlists', playlists);

                return newPlaylist;
            }
            return null;
        }

        this.addExistingPlaylist = function (playlist)
        {
            var playlistLength = playlists.length;
            playlists[playlistLength] = playlist;
            localStorageService.set('playlists', playlists);
        }

        this.removePlaylist = function (id)
        {
            playlists.splice(id, 1);
            localStorageService.set('playlists', playlists);
        }

        this.renamePlaylist = function (id, newName)
        {
            if (newName)
            {
                for (var i = 0; i < playlists.length; ++i)
                {
                    if (i == id)
                    {
                        var playlist = playlists[id];
                        playlist.name = newName;
                        console.log("Rename: " + playlist.name);
                        localStorageService.set('playlists', playlists);
                        return true;
                    }
                }
            }
            return false;
        }

        this.getCurrentTrack = function ()
        {
            return currentTrack;
            updateTrackStates();
        }

        this.setCurrentTrack = function (track, state)
        {
            currentTrack = track;
            if (state)
            {
                currentTrack.playState = state;
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

        this.getConnection = function()
        {
            return connection;
        }

        this.setConnection = function(email, name, token, id)
        {
            connection =
            {
                email: email,
                name: name,
                token: token,
                id: id
            };
        }

        this.getConnected = function()
        {
            return connected;
        }

        this.setConnected = function(val)
        {
            if (val == true || val == false)
                connected = val;
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
            home    : 'home',
            artist  : 'artist',
            albums  : 'albums',
            playlist: 'playlist',
            error   : 'error'
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