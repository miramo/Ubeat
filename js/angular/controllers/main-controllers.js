/**
 * Created by blackwires on 07/03/2015.
 */

(function ()
{
    var controllers = angular.module('mainControllers', ['factories', 'directives', 'services', 'truncate']);

    controllers.controller('MainController', function ($scope, $http, sharedProperties, sharedPagesStatus, tokenInfoFactory, localStorageService)
    {
        $scope.isPageLoaded = sharedPagesStatus.getIsPageLoaded();
        $scope.sharedProperties = sharedProperties;
        $scope.sharedPagesStatus = sharedPagesStatus;

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $("body").css("background-image", "none");
        });

        $(document).ready(function ()
        {
            var token = localStorageService.cookie.get('token');

            if (token)
            {
                tokenInfoFactory.get(token, function (data)
                    {
                        if (data.email && data.name && data.token && data.id)
                        {
                            sharedProperties.setInfoConnection(data.email, data.name, data.token, data.id);
                            sharedProperties.setConnected(true);
                        }
                    },
                    function (err)
                    {
                        sharedProperties.setConnected(false);
                    });
            }
        });
    });

    controllers.controller('ErrorPageController', function ($scope, sharedPagesStatus)
    {
        $scope.sharedPagesStatus = sharedPagesStatus;
        sharedPagesStatus.setTitle('404');

        $scope.$watch('sharedPagesStatus.getIsPageLoaded()', function (oldVal, newVal)
        {
            if (!oldVal || !newVal)
            {
                sharedPagesStatus.setIsPageLoaded(true);
            }
        });

        sharedPagesStatus.setIsPageLoaded(true);
    });
})();