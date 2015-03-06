/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var factories = angular.module('factories', ['ngResource']);

    factories.ubeatBaseUnsecureUrl = 'http://ubeat.herokuapp.com/unsecure/';
    factories.spotifyUrl = 'https://api.spotify.com/v1/';

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
})();