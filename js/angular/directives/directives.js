/**
 * Created by blackwires on 03/03/2015.
 */

(function ()
{
    var ubeatApp = angular.module('directives', []);

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
                msg: '@'
            },
            templateUrl: './views/templates/error-template.html'
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

    ubeatApp.directive('customAudio', function ()
    {
        return {
            restrict   : 'E',
            transclude : true,
            scope      : {},
            controller : function ($scope)
            {
                var panes = $scope.panes = [];

                $scope.select = function (pane)
                {
                    angular.forEach(panes, function (pane)
                    {
                        pane.selected = false;
                    });
                    pane.selected = true;
                };

                this.addPane = function (pane)
                {
                    if (panes.length === 0)
                    {
                        $scope.select(pane);
                    }
                    panes.push(pane);
                };
            },
            templateUrl: 'my-tabs.html'
        };
    });

    ubeatApp.directive('myPane', function ()
    {
        return {
            require    : '^customAudio',
            restrict   : 'E',
            transclude : true,
            scope      : {
                title: '@'
            },
            link       : function (scope, element, attrs, tabsCtrl)
            {
                tabsCtrl.addPane(scope);
            },
            templateUrl: 'my-pane.html'
        };
    });
})();