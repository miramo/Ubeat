/**
 * Created by blackwires on 09/03/2015.
 */

(function ()
{
    var controllers = angular.module('templatesControllers', ['directives', 'mediaPlayer', 'services', 'truncate']);

    controllers.controller('NavbarController', function ($scope, $route, $location, sharedPagesStatus, sharedProperties, loginFactory, logoutFactory, signupFactory, localStorageService)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.connectionInfo = {email: "", password: ""};
        $scope.signupInfo = {name: "", email: "", password: "", confirmPassword: ""};

        $scope.login = function ()
        {
            loginFactory.save({email: $scope.connectionInfo.email, password: $scope.connectionInfo.password}).$promise.then(function (data)
                {
                    if (data.email && data.name && data.token && data.id)
                    {
                        sharedProperties.setInfoConnection(data.email, data.name, data.token, data.id);
                        sharedProperties.setConnected(true);
                        localStorageService.cookie.set(sharedProperties.getTokenCookieName(), data.token);
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

    controllers.controller('PlaybarController', function ($scope, sharedPagesStatus, sharedProperties)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;

        $scope.next = function()
        {
            $scope.myAudio.stop();
            //$scope.myAudio.load([{"src": "http://upload.wikimedia.org/wikipedia/en/7/79/Korn_-_Predictable_%28demo%29.ogg",  "type": "audio/ogg"}]);
            $scope.myAudio.playPause();
        }

        $scope.prev = function()
        {
            $scope.myAudio.stop();
            //$scope.myAudio.load([{"src": "http://upload.wikimedia.org/wikipedia/en/7/79/Korn_-_Predictable_%28demo%29.ogg",  "type": "audio/ogg"}]);
            $scope.myAudio.playPause();
        }

        $scope.play = function()
        {
            $scope.myAudio.playPause();
        }

        $scope.$watch('sharedProperties.getCurrentTrack()', function (newVal, oldVal)
        {
            if (oldVal)
                oldVal.playState = sharedProperties.getPlayStates().idle;
            if ($scope.myAudio && newVal)
            {
                $scope.myAudio.stop();
                $scope.myAudio.load([{"src": newVal.previewUrl,  "type": "audio/mp4"}]);
                $scope.myAudio.playPause();
                newVal.playState = sharedProperties.getPlayStates().play;
            }
        });

        $scope.$watch('!myAudio.playing', function (newVal, oldVal)
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

        $scope.switchMute = function ()
        {
            $scope.myAudio.toggleMute();
        }


        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
        });
    });

})();