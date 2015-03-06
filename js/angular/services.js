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

        return {
            getTitle      : function ()
            {
                return title;
            },
            setTitle      : function (value)
            {
                title = value;
            },
            getHomeArtists: function ()
            {
                return homeArtists;
            },
            setHomeArtists: function (artists)
            {
                homeArtists = [];
                angular.copy(artists, homeArtists);
            },
            getHomeAlbums : function ()
            {
                return homeAlbums;
            },
            setHomeAlbums : function (albums)
            {
                homeAlbums = [];
                angular.copy(albums, homeAlbums);
            }
        };
    });
})();