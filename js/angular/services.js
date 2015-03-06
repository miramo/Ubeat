/**
 * Created by blackwires on 04/03/2015.
 */

(function ()
{
    var services = angular.module('services', []);

    services.service('sharedProperties', function ()
    {
        var title = 'Ubeat';
        var homeArtists = [];
        var homeAlbums = [];
        var playlists = [];

        function Track()
        {
            var idInPlaylist = 0;
            var trackId = 0;
            var albumId = 0;
            var artistId = 0;
            var name = '';
            var artistName = '';
            var albumName = '';
            var previewUrl = '';
            var trackTimeMillis = 0;
            var artworkUrl100 = '';
            var number = 0;
        }

        function Playlist()
        {
            var id = 0;
            var name = '';
            var tracks = [];
        }

        return {
            getTitle               : function ()
            {
                return title;
            },
            setTitle               : function (value)
            {
                title = value;
            },
            getHomeArtists         : function ()
            {
                return homeArtists;
            },
            setHomeArtists         : function (artists)
            {
                homeArtists = [];
                angular.copy(artists, homeArtists);
            },
            getHomeAlbums          : function ()
            {
                return homeAlbums;
            },
            setHomeAlbums          : function (albums)
            {
                homeAlbums = [];
                angular.copy(albums, homeAlbums);
            },
            getPlaylists           : function ()
            {
                return playlists;
            },
            setPlaylists           : function (value)
            {
                playlists = [];
                angular.copy(playlists, value)
            },
            addTrackToPlaylist     : function (track, playlistId)
            {
                for (var i = 0; i < playlists.length; ++i)
                {
                    if (playlists[i].id == playlistId)
                    {
                        var playlist = playlists[i];
                        var tracksLength = playlist.tracks.length;
                        for (var j = 0; j < tracksLength; ++j)
                        {
                            if (playlist.tracks[j].id == track.id)
                            {
                                return false;
                            }
                        }
                        playlist.tracks[tracksLength] = track;
                        return true;
                    }
                }
                return false;
            },
            removeTrackFromPlaylist: function (trackIdInPlaylist, playlistId)
            {
                for (var i = 0; i < playlists.length; ++i)
                {
                    if (playlists[i].id == playlistId)
                    {
                        var playlist = playlists[playlistId];
                        for (var j = 0; j < playlist.tracks.length; ++j)
                        {
                            if (playlist.tracks[j].trackIdInPlaylist == trackIdInPlaylist)
                            {
                                playlist.tracks.splice($.inArray(j, playlist.tracks), 1);
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
            addPlaylist            : function (playlist)
            {
                var playlistLength = playlists.length;
                playlists[playlistLength] = playlist;
            },
            removePlaylist         : function (id)
            {
                playlists.splice($.inArray(id, playlist), 1);
            },
            renamePlaylist : function(id, newName)
            {
                for (var i = 0; i < playlists.length; ++i)
                {
                    if (playlists[i].id == id)
                    {
                        var playlist = playlists[id];
                        playlist.name = newName;
                        return true;
                    }
                }
                return false;
            }
        };
    });
})();