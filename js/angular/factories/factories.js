/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var factories = angular.module('factories', ['ngResource']);

    factories.ubeatBaseUnsecureUrl = 'http://ubeat.herokuapp.com/unsecure/';
    factories.ubeatBaseSecureUrl = 'http://ubeat.herokuapp.com/';
    factories.localSecureUbeatUrl = "http://localhost:3000/";
    factories.localUnsecureUbeatUrl = "http://localhost:3000/unsecure/";
    factories.isSecure = false;
    factories.isLocal = true;
    factories.ubeatBaseUrl = factories.isSecure ? factories.ubeatBaseSecureUrl : factories.ubeatBaseUnsecureUrl;
    factories.spotifyUrl = 'https://api.spotify.com/v1/';

    factories.getUbeatApiURL = function(sharedProperties)
    {
        return sharedProperties.isConnected() ? factories.ubeatBaseSecureUrl : factories.ubeatBaseUnsecureUrl;
    }

    {
        if (factories.isLocal)
        {
        }
        return url;
    }

    factories.factory('playStates', function ()
    {
        return {
            play : 'play',
            pause: 'pause',
            idle : 'idle'
        };
    });

    factories.factory('searchFactory', function ($resource, sharedProperties)
    {
        return $resource(factories.resolveUbeatApiURL(factories.getUbeatApiURL(sharedProperties)) + 'search/?q=:element&limit=:maxItems');
    });

    factories.factory('loginFactory', function ($resource)
    {
    });

    factories.factory('logoutFactory', function ($resource)
    {
    });

    factories.factory('signupFactory', function ($resource)
    {
    });

    factories.factory('albumFactory', function ($resource, sharedProperties)
    {
        return $resource(factories.resolveUbeatApiURL(factories.getUbeatApiURL(sharedProperties)) + 'albums/:id');
    });

    factories.factory('albumTracksFactory', function ($resource, sharedProperties)
    {
        return $resource(factories.resolveUbeatApiURL(factories.getUbeatApiURL(sharedProperties)) + 'albums/:id/tracks');
    });

    factories.factory('artistFactory', function ($resource, sharedProperties)
    {
        return $resource(factories.resolveUbeatApiURL(factories.getUbeatApiURL(sharedProperties)) + 'artists/:id');
    });

    factories.factory('artistAlbumsFactory', function ($resource, sharedProperties)
    {
        return $resource(factories.resolveUbeatApiURL(factories.getUbeatApiURL(sharedProperties)) + 'artists/:id/albums');
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

    factories.factory('totalPlaylistsFactory', function($resource)
    {
    });

    factories.factory('singlePlaylistFactory', function($resource)
    {
    });

    factories.factory('singlePlaylistTracksFactory', function($resource)
    {
    });

    factories.factory('singlePlaylistSingleTrackFactory', function($resource)
    {
    });

    factories.factory('tokenInfoFactory', function ($resource)
    {
    });

    factories.factory('usersFactory', function ($resource)
    {
    })

    factories.factory('singleUserFactory', function ($resource)
    {
    });
})
();