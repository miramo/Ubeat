/**
 * Created by blackwires on 19/03/2015.
 */
(function ()
{
    var ubeatApp = angular.module('albumDirectives', []);

    ubeatApp.directive('albumHeader', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/album/header.html'
        };
    })

    ubeatApp.directive('albumToolbar', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/album/toolbar.html'
        };
    });

    ubeatApp.directive('albumTracks', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/album/tracks.html'
        };
    });

    ubeatApp.directive('albumModals', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/album/modals.html'
        };
    });
})();