/**
 * Created by blackwires on 07/03/2015.
 */

(function ()
{
    var controllers = angular.module('mainControllers', ['factories', 'directives', 'services', 'ngAudio', 'truncate']);

    controllers.controller('MainController', function ($scope, sharedProperties, sharedPagesStatus)
    {
        $scope.isPageLoaded = sharedPagesStatus.getIsPageLoaded();
        $scope.sharedProperties = sharedProperties;
        $scope.sharedPagesStatus = sharedPagesStatus;

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $("body").css("background-image", "none");
            // call your functions here
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