/**
 * Created by blackwires on 09/03/2015.
 */

(function ()
{
    var controllers = angular.module('templatesControllers', ['directives', 'services', 'ngAudio', 'truncate']);

    controllers.controller('NavbarController', function ($scope, $route, $location, sharedPagesStatus, sharedProperties, loginFactory, logoutFactory, signupFactory, localStorageService)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.connectionInfo = {email: "", password: ""};
        $scope.signupInfo = {name: "", email: "", password: ""};

        $scope.login = function ()
        {
            loginFactory.save({email: $scope.connectionInfo.email, password: $scope.connectionInfo.password}).$promise.then(function (data)
                {
                    if (data.email && data.name && data.token && data.id)
                    {
                        sharedProperties.setInfoConnection(data.email, data.name, data.token, data.id);
                        sharedProperties.setConnected(true);
                        localStorageService.cookie.set('token', data.token);
                        $('#sign-in-modal').foundation('reveal', 'close');
                        $(document).foundation('topbar', 'reflow');
                        Foundation.libs.topbar.toggle($('.top-bar'));
                        $route.reload();
                    }
                },
                function (err)
                {
                    sharedProperties.setConnected(false);
                    console.log(err);
                });
        }

        $scope.logout = function ()
        {
            logoutFactory.get().$promise.then(function (data)
                {
                    localStorageService.cookie.remove('token');
                    sharedProperties.setConnected(false);
                    $location.path('/');
                    $(document).foundation('topbar', 'reflow');
                    Foundation.libs.topbar.toggle($('.top-bar'));
                },
                function (err)
                {
                    console.log(err);
                });
        }

        $scope.signup = function ()
        {
            signupFactory.save({name: $scope.signupInfo.name, email: $scope.signupInfo.email, password: $scope.signupInfo.password}).$promise.then(function (data)
                {
                    if (data.email && data.name && data.id)
                    {
                        console.log(data);
                    }
                },
                function (err)
                {
                    console.log(err);
                });
        }

        $scope.search = function(str)
        {
            $location.path('search/' + str);
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
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
            $(document).foundation();
        });
    });

})();