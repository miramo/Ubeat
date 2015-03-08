/**
 * Created by blackwires on 07/03/2015.
 */

(function ()
{
    var controllers = angular.module('mainControllers', ['factories', 'directives', 'services', 'ngAudio', 'truncate']);

    controllers.controller('MainController', function ($scope, sharedProperties, sharedPagesStatus)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        // $scope.isPageLoaded = sharedPagesStatus.getIsPageLoaded();
        $scope.pageLoaded = true;

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $("body").css("background-image", "none");
            // call your functions here
        });
    });

    controllers.controller('NavbarController', function ($scope, sharedPagesStatus)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            // call your functions here
        });
    });

    controllers.controller('PlaybarController', function ($scope, ngAudio, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.audio = ngAudio.load('');
        $scope.audio.progress = 0;
        $scope.audio.currentTime = 0;

        $scope.$watch('sharedProperties.getCurrentTrack()', function (newVal, oldVal)
        {
            if (oldVal)
                oldVal.playState = sharedProperties.getPlayStates().idle;
            if ($scope.audio && newVal)
            {
                $scope.audio.pause();
                $scope.audio = ngAudio.load(newVal.previewUrl);
                $scope.audio.play();
                newVal.playState = sharedProperties.getPlayStates().play;
            }
        });

        $scope.$watch('audio.paused', function (newVal, oldVal)
        {
            var track = sharedProperties.getCurrentTrack();

            if (track)
            {
                track.playState = (newVal == true ? sharedProperties.getPlayStates().pause : sharedProperties.getPlayStates().play);
            }
        });

        $scope.$watch('sharedProperties.getCurrentTrack().playState', function (newVal, oldVal)
        {
            sharedProperties.updateTrackStates();
        });

        $scope.canPlay = function ()
        {
            if ($scope.audio)
            {
                return $scope.audio.canPlay;
            }
            return false;
        }

        $scope.switchMute = function ()
        {
            if ($scope.audio)
            {
                $scope.audio.muting = $scope.audio.muting;
                if ($scope.audio.muting)
                {

                }
            }
        }

        $scope.getVolume = function ()
        {
            if ($scope.audio)
            {
                if ($scope.audio.muting == false)
                    return 0;
                return $scope.audio.volume * 100;
            }
            return 0;
        }


        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            ;
            $(document).foundation();
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