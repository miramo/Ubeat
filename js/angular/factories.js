/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var factories = angular.module('factories', ['ngResource']);

    factories.factory('albumFactory', function ($resource)
    {
        return $resource('http://ubeat.herokuapp.com/unsecure/albums/:id');
    });

    factories.factory('albumTracksFactory', function ($resource)
    {
        return $resource('http://ubeat.herokuapp.com/unsecure/albums/:id/tracks');
    });

    factories.factory('artistFactory', function ($resource)
    {
        return $resource('http://ubeat.herokuapp.com/unsecure/artists/:id');
    });

    factories.factory('artistAlbumsFactory', function ($resource)
    {
        return $resource('http://ubeat.herokuapp.com/unsecure/artists/:id/albums');
    });
})();