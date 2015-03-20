/**
 * Created by blackwires on 19/03/2015.
 */
(function ()
{
    var ubeatApp = angular.module('homeDirectives', []);

    ubeatApp.directive('homeArtistSlider', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/home/artist-slick.html'
        };
    });

    ubeatApp.directive('homeAlbumSlider', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/home/album-slick.html'
        };
    });
})();