/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var factories = angular.module('factories', ['ngResource']);

    factories.ubeatBaseUnsecureUrl = 'http://ubeat.herokuapp.com/unsecure/';
    factories.ubeatBaseSecureUrl = 'http://ubeat.herokuapp.com/';
    factories.isSecure = false;
    factories.ubeatBaseUrl = factories.isSecure ? factories.ubeatBaseSecureUrl : factories.ubeatBaseUnsecureUrl;
    factories.spotifyUrl = 'https://api.spotify.com/v1/';

    factories.factory('playStates', function ()
    {
        return {
            play : 'play',
            pause: 'pause',
            idle : 'idle'
        };
    });

    factories.factory('searchFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUrl + 'search/?q=:element&limit=:maxItems');
    });

    factories.factory('loginFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseSecureUrl + 'login');
    });

    factories.factory('logoutFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseSecureUrl + 'logout');
    });

    factories.factory('signupFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseSecureUrl + 'signup');
    });

    factories.factory('tokenInfoFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseSecureUrl + 'tokenInfo');
    });

    factories.factory('albumFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUrl + 'albums/:id');
    });

    factories.factory('albumTracksFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUrl + 'albums/:id/tracks');
    });

    factories.factory('artistFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUrl + 'artists/:id');
    });

    factories.factory('artistAlbumsFactory', function ($resource)
    {
        return $resource(factories.ubeatBaseUrl + 'artists/:id/albums');
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
        var newTrack = function ()
        {
            this.idInPlaylist = 0;
            this.trackId = 0;
            this.albumId = 0;
            this.artistId = 0;
            this.name = '';
            this.artistName = '';
            this.playState = playStates.idle;
            this.albumName = '';
            this.previewUrl = '';
            this.trackTimeMillis = 0;
            this.artworkUrl100 = '';
            this.number = 0;
            this.playlist = {};

            this.fillFromData = function (data)
            {
                this.trackId = data.trackId;
                this.albumId = data.collectionId;
                this.artistId = data.artistId;
                this.name = data.trackName;
                this.artistName = data.artistName;
                this.playState = playStates.idle;
                this.albumName = data.collectionName;
                this.previewUrl = data.previewUrl;
                this.trackTimeMillis = data.trackTimeMillis;
                this.artworkUrl100 = data.artworkUrl100;
                this.number = data.trackNumber;
                this.time = millisToTime(this.trackTimeMillis);
            }
        }

        return newTrack;
    });

    factories.factory('playlistFactory', function (playStates)
    {
        var playlist = function ()
        {
            this.id = 0;
            this.name = '';
            this.tracks = [];
            this.isEdit = false;
            this.isHover = false;
        }

        return playlist;
    });
})
();