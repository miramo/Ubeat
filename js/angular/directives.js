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

    ubeatApp.directive('footerBar', function (){
        return {
            restrict: 'E',
            templateUrl: './views/partials/playbar.html'
        };
    });
})();