/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var factories = angular.module('factories', ['ngResource']);

    factories.ubeatBaseUnsecureUrl = 'http://ubeat.herokuapp.com/unsecure/';
    factories.spotifyUrl = 'https://api.spotify.com/v1/';

    factories.factory('playStates', function ()
    {
        return {
            play : 'play',
            pause: 'pause',
            idle : 'idle'
        };
    });

    factories.factory('albumFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUnsecureUrl + 'albums/:id');
    });

    factories.factory('albumTracksFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUnsecureUrl + 'albums/:id/tracks');
    });

    factories.factory('artistFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUnsecureUrl + 'artists/:id');
    });

    factories.factory('artistAlbumsFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUnsecureUrl + 'artists/:id/albums');
    });

    factories.factory('artistBiographiesFactory', function ($resource)
    {
        return $resource('http://developer.echonest.com/api/v4/artist/biographies?api_key=ATWBC2GU7RT2GCRTE&id=spotify:artist:id&format=json&results=1&start=0&license=cc-by-sa');
    });

    factories.factory('spotifyArtistFactory', function ($resource)
    {
        return $resource(factories.spotifyUrl + 'artists/:id');
    });

    factories.factory('spotifySearchFactory', function ($resource)
    {
        return $resource(factories.spotifyUrl + 'search?query=:name&type=:type');
    });

    factories.factory('trackFactory', function (playStates)
    {
        var newTrack = {};

        newTrack.idInPlaylist = 0;
        newTrack.trackId = 0;
        newTrack.albumId = 0;
        newTrack.artistId = 0;
        newTrack.name = '';
        newTrack.artistName = '';
        newTrack.playState = playStates.idle;
        newTrack.albumName = '';
        newTrack.previewUrl = '';
        newTrack.trackTimeMillis = 0;
        newTrack.artworkUrl100 = '';
        newTrack.number = 0;
        newTrack.playlist = {};

        return newTrack;
    });

    factories.factory('playlistFactory', function (playStates)
    {
        var playlist = {};

        playlist.id = 0;
        playlist.name = '';
        playlist.tracks = [];
        playlist.isEdit = false;
        playlist.isHover = false;
        playlist.getTotalTime = function ()
        {
            var totalTime = 0;
            this.tracks.forEach(function (entry)
            {
                totalTime += entry.trackTimeMillis;
            });
            return totalTime;
        }

        return playlist;
    });
})
();