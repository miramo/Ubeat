/**
 * Created by blackwires on 09/03/2015.
 */

(function ()
{
    var controllers = angular.module('templatesControllers', ['factories', 'directives', 'services', 'ngAudio', 'truncate']);

    controllers.controller('NavbarController', function ($scope, $route, $location, sharedPagesStatus, sharedProperties, connectionFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.connection = function()
        {
            this.email = "";
            this.password = "";
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
        });

        $scope.login = function ()
        {
            connectionFactory.save({email: $scope.connection.email, password: $scope.connection.password}).$promise.then(function (data)
                {
                    if (data.email && data.name && data.token && data.id)
                    {
                        sharedProperties.setConnection(data.email, data.name, data.token, data.id);
                        sharedProperties.setConnected(true);
                        console.log(sharedProperties.getConnection());
                        $('#sign-in-modal').foundation('reveal', 'close');
                    }
                },
                function (err)
                {
                    console.log(err);
                    sharedProperties.setConnected(false);
                });
        }

        $scope.search = function(str)
        {
            $location.path('search/' + str);
        }
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
            $(document).foundation();
        });
    });

})();