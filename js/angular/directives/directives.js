/**
 * Created by blackwires on 03/03/2015.
 */

(function ()
{
    var ubeatApp = angular.module('directives', []);

    ubeatApp.directive('backimg', function ($http)
    {
        function link(scope, element, attrs)
        {
            var imgUrl = attrs.backimg;

            httpGetImageDataURI($http, imgUrl, function (result)
            {
                element.css(
                    {
                        'background-image': 'url(' + result + ')'
                    });
            });
        }

        return {
            restrict: 'A',
            link    : link
        };
    });

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

    ubeatApp.directive('notfound', function ()
    {
        return {
            restrict   : 'E',
            templateUrl: './views/templates/notfound.html'
        };
    });
})();