/**
 * Created by blackwires on 03/03/2015.
 */

(function ()
{
    var ubeatApp = angular.module('directives', ['homeDirectives', 'albumDirectives']);

    ubeatApp.directive('navBar', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/navbar.html'
        };
    });

    ubeatApp.directive('footerBar', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/playbar.html'
        };
    });

    ubeatApp.directive('loader', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/loading.html'
        };
    })

    ubeatApp.directive('errorMsg', function ()
    {
        return {
            restrict   : 'E',
            scope      : {
                errorNb: '@',
                msg: '@'
            },
            templateUrl: './views/templates/error-template.html'
        };
    });

    ubeatApp.directive('notfound', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/notfound.html'
        };
    });

    ubeatApp.directive('itunesLink', function ()
    {
        return {
            restrict   : 'E',
            scope      : {
                url: '@'
            },
            templateUrl: './views/templates/itunes-link.html'
        };
    });

    ubeatApp.directive('backImg', function ()
    {
        return function (scope, element, attrs)
        {
            attrs.$observe('backImg', function (value)
            {
                element.css({
                    'background-image': 'url(' + value + ')',
                    'background-size' : 'cover'
                });
            });
        };
    });
})();