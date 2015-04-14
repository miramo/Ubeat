/**
 * Created by blackwires on 09/03/2015.
 */

(function ()
{
    var controllers = angular.module('templatesControllers', ['directives', 'mediaPlayer', 'services', 'truncate']);

    angular.module('templatesControllers')
        .value('mp.throttleSettings', {
            enabled: true,
            time   : 1
        });

    controllers.controller('NavbarController', function ($scope, $route, $location, sharedPagesStatus, sharedProperties, loginFactory, logoutFactory, signupFactory, localStorageService)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.connectionInfo = {email: "", password: ""};
        $scope.signupInfo = {name: "", email: "", password: "", confirmPassword: ""};
        $scope.errorMsg = "";

        $scope.login = function ()
        {
            loginFactory.post(sharedProperties.getTokenCookie(), {
                    email   : $scope.connectionInfo.email,
                    password: $scope.connectionInfo.password
                }, function (data)
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
                    $('#sign-in-modal').addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function ()
                    {
                        $(this).removeClass('animated shake');
                    });
                    $scope.errorMsg = "Adresse e-mail ou mot de passe incorrect.";
                    $('#error-msg-sign-in').removeClass('hide');
                    sharedProperties.setConnected(false);
                });
        }

        $scope.logout = function ()
        {
            logoutFactory.get(sharedProperties.getTokenCookie(), function (data)
                {
                    localStorageService.cookie.remove('token');
                    sharedProperties.setConnected(false);
                    $location.path('/');
                    $(document).foundation('topbar', 'reflow');
                    Foundation.libs.topbar.toggle($('.top-bar'));
                    $route.reload();
                },
                function (err)
                {
                    console.log(err);
                });
        }

        $scope.signup = function ()
        {
            signupFactory.post(sharedProperties.getTokenCookie(), {
                    name    : $scope.signupInfo.name,
                    email   : $scope.signupInfo.email,
                    password: $scope.signupInfo.password
                }, function (data)
                {
                    if (data.email && data.name && data.id)
                    {
                        loginFactory.post(sharedProperties.getTokenCookie(), {
                                email   : $scope.signupInfo.email,
                                password: $scope.signupInfo.password
                            }, function (data)
                            {
                                if (data.email && data.name && data.token && data.id)
                                {
                                    sharedProperties.setInfoConnection(data.email, data.name, data.token, data.id);
                                    sharedProperties.setConnected(true);
                                    localStorageService.cookie.set(sharedProperties.getTokenCookieName(), data.token);
                                    $('#sign-up-modal').foundation('reveal', 'close');
                                    $(document).foundation('topbar', 'reflow');
                                    Foundation.libs.topbar.toggle($('.top-bar'));
                                    $route.reload();
                                }
                            },
                            function (err)
                            {
                                sharedProperties.setConnected(false);
                                //console.log(err);
                            });
                    }
                },
                function (err)
                {
                    $('#sign-up-modal').addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function ()
                    {
                        $(this).removeClass('animated shake');
                    });
                    $scope.errorMsg = "Cette adresse de courriel est deja utilisee.";
                    $('#error-msg-sign-up').removeClass('hide');
                    $scope.signupInfo.email = "";
                    $scope.signupInfo.password = "";
                    $scope.signupInfo.confirmPassword = "";
                    //console.log(err);
                });
        }

        $scope.search = function (str)
        {
            $location.path('search/' + str);
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
        });
    });

    controllers.controller('PlaybarController', function ($scope, $route, $location, localStorageService, sharedPagesStatus, sharedProperties)
    {
        var queuePage = sharedPagesStatus.getPageEnum().playQueue;
        var queuePageUrl = "/queue/";
        var slideMove = false;
        var audioType = "audio/mp4";
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.myAudio = {};
        $scope.speed = 1000000;
        $scope.isPlayQueue = false;
        $scope.playQueue = sharedProperties.getPlayQueue().queue;
        $scope.volume = localStorageService.get("volume");
        $scope.isLooping = localStorageService.get("isLooping");
        var currentTrackTime = localStorageService.get("currentTrackTime");
        var currentTrackId = localStorageService.get("currentTrackId");
        //$scope.volume = localStorageService.get("volume");
        //$scope.isLooping = localStorageService.get("isLooping");
        //var currentTrackTime = localStorageService.get("currentTrackTime");
        //var currentTrackId = localStorageService.get("currentTrackId");

        $scope.switchIsLooping = function ()
        {
            $scope.isLooping = !$scope.isLooping;
            localStorageService.set("isLooping", $scope.isLooping);
        }

        $scope.switchIsRandom = function ()
        {
            $scope.isRandom = !$scope.isRandom;
            localStorageService.set("isRandom", $scope.isRandom);
        }

        //$scope.disabled = !sharedProperties.getCurrentTrack();

        angular.element(document).keydown(function (evt)
        {
            evt.preventDefault();
            if (evt.keyCode == 32 && sharedProperties.getPlayQueueLength() > 0)
            {
                $scope.play();
            }
        });

        $scope.currentTrack =
        {
            currentTime: 0,
            duration   : 30
        };
        $scope.sliderPlayer =
        {
            'options': {
                orientation: 'horizontal',
                range      : 'min',
                start      : function (event, ui)
                {
                    sliderPlayerStart();
                },
                stop       : function (event, ui)
                {
                    sliderPlayerStop();
                }
            }
        };
        $scope.sliderVolume =
        {
            'options': {
                orientation: 'horizontal',
                range      : 'min',
                start      : function (event, ui)
                {
                    sliderVolumeStart();
                },
                stop       : function (event, ui)
                {
                    sliderVolumeStop();
                }
            }
        };

        var sliderPlayerStart = function ()
        {
            slideMove = true;
        }

        var sliderPlayerStop = function ()
        {
            $scope.myAudio.seek($scope.currentTrack.currentTime / $scope.speed);
            slideMove = false;
        }

        var sliderVolumeStart = function ()
        {
            $("#slider-wrapper").addClass('ui-slider-active');
        }

        var sliderVolumeStop = function ()
        {
            $("#slider-wrapper").removeClass('ui-slider-active');
        }

        var loadTrack = function (track, playTrack)
        {
            if (track != null && $scope.myAudio != null)
            {
                $scope.myAudio.stop();
                $scope.myAudio.load([{"src": track.previewUrl, "type": audioType}]);

                if (playTrack)
                    $scope.myAudio.playPause();
            }
        }

        $scope.next = function ()
        {
            var track = null;

            if ($scope.isRandom)
                track = sharedProperties.getRandomQueueTrack($scope.isRandom && $scope.isLooping);
            else
                track = sharedProperties.getPlayQueueNextTrack(true);

            loadTrack(track, true);
        }

        $scope.prev = function ()
        {
            var track = null;

            $scope.myAudio.stop();
            if (track = sharedProperties.getPlayQueuePreviousTrack(true))
                $scope.myAudio.load([{"src": track.previewUrl, "type": audioType}]);
            $scope.myAudio.playPause();
        }

        $scope.$watch('myAudio.ended', function (value)
        {
            if (value == true
                && ($scope.isLooping == false && sharedProperties.isLastSongInQueue() == false))
            {
                $scope.next();
            }
        });

        $scope.$watch('sharedPagesStatus.getCurrentPage()', function (value)
        {
            if (value == 'queue')
                $scope.isPlayQueue = true;
            else
                $scope.isPlayQueue = false;
        });

        //$scope.$watch('sharedProperties.addTrackArrayToPlayQueue()', function (newVal, oldVal)
        //{
        //    loadTrack(sharedProperties.getCurrentTrack(), true);
        //});
        //
        //$scope.$watch('sharedProperties.addTrackToPlayQueue()', function (newVal, oldVal)
        //{
        //    loadTrack(sharedProperties.getCurrentTrack(), true);
        //});

        $scope.clickOnPlayQueue = function ()
        {
            var queuePreviousPage = sharedProperties.getSaveQueuePreviousPage();
            var currentPage = sharedPagesStatus.getCurrentPage();

            if (currentPage != queuePage)
            {
                sharedProperties.setSaveQueuePreviousPage(currentPage, $location.url());
                $location.path(queuePageUrl);
                $route.reload();
            }
            else
            {
                if (queuePreviousPage.pageUrl == "#/")
                {
                    $location.path("/");
                }
                else
                {
                    $location.path(queuePreviousPage.pageUrl);
                }
                $route.reload();
                sharedProperties.setSaveQueuePreviousPage(sharedPagesStatus.getCurrentPage(), $location.url());
            }
        }

        $scope.play = function ()
        {
            $scope.myAudio.playPause();
        }

        $scope.switchMute = function ()
        {
            $scope.myAudio.toggleMute();
        }

        $scope.$watch('volume', function (value)
        {
            localStorageService.set("volume", value);

            $scope.myAudio.setVolume(value / 100);
        });

        $scope.$watch('myAudio.currentTime', function (value)
        {
            if (!slideMove)
                $scope.currentTrack.currentTime = value * $scope.speed;
            currentTrackTime = value;
            localStorageService.set('currentTrackTime', currentTrackTime);
        });

        $scope.$watch('myAudio.duration', function (value)
        {
            $scope.currentTrack.duration = value;
        });

        $scope.$watch('sharedProperties.getPlayQueueLength()', function (val)
        {
            if (val <= 0)
            {
                $scope.myAudio.stop();
            }
        });

        $scope.$watch('sharedProperties.getCurrentTrack()', function (newVal, oldVal)
        {
            if (oldVal)
                oldVal.playState = sharedProperties.getPlayStates().idle;
            if ($scope.myAudio && newVal != oldVal)
            {
                $scope.myAudio.stop();
                $scope.myAudio.load([{"src": newVal.previewUrl, "type": audioType}])
                $scope.myAudio.playPause();
                newVal.playState = sharedProperties.getPlayStates().play;
            }
        });

        $scope.$watch('!myAudio.playing', function (newVal, oldVal)
        {
            var track = sharedProperties.getCurrentTrack();
            if (track)
                track.playState = (newVal == true ? sharedProperties.getPlayStates().pause : sharedProperties.getPlayStates().play);
        });

        $scope.$watch('sharedProperties.getCurrentTrack().playState', function (newVal, oldVal)
        {
            sharedProperties.updateTrackStates();
        });

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
        });

        angular.element(document).ready(function ()
        {
            if (currentTrackTime == null)
                currentTrackTime = 0;
            console.log(currentTrackTime);
            $scope.currentTrack.currentTime = currentTrackTime * $scope.spzeed;
        });
    });

})();