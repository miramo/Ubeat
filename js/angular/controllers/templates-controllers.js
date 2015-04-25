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

    controllers.controller('NavbarController', function ($scope, $route, $location, session,
                                                         sharedPagesStatus, sharedProperties, loginFactory,
                                                         logoutFactory, signupFactory, localStorageService, searchFactory, searchUsersFactory,
                                                         spotifySearchFactory, spotifyArtistFactory)
    {
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.session = session;
        $scope.connectionInfo = {email: "", password: ""};
        $scope.signupInfo = {name: "", email: "", password: "", confirmPassword: ""};
        $scope.errorMsg = "";
        $scope.searchesResult = sharedProperties.getSearchResultObj();
        $scope.sharedPagesStatus = sharedPagesStatus;
        $scope.itemLimit = 3;
        $scope.isSearching = false;
        $scope.isInputFocused = false;
        var searchValue = "";
        var searches = [];
        var currentSearchDone = true;
        var autoCompletDropdownElement = null;
        var searchInputRow = null;

        $scope.setInputFocus = function(val)
        {
            $scope.isInputFocused = val;
            if (autoCompletDropdownElement && searchInputRow)
            {
                if ($scope.isInputFocused)
                {
                    autoCompletDropdownElement.css('left', searchInputRow.offset().left);
                    autoCompletDropdownElement.css('top', searchInputRow.offset().bottom - 20);
                    autoCompletDropdownElement.css('display', 'initial');
                }
                else
                {
                    autoCompletDropdownElement.css('display', 'none');
                }
            }
        }

        $scope.login = function ()
        {
            loginFactory.post(session.getToken(), {
                    email   : $scope.connectionInfo.email,
                    password: $scope.connectionInfo.password
                }, function (data)
                {
                    if (data.email && data.name && data.token && data.id)
                    {
                        sharedProperties.setInfoConnection(data.email, data.name, data.token, data.id);
                        sharedProperties.setConnected(true);
                        localStorageService.cookie.set(session.getTokenCookieName(), data.token);
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
            logoutFactory.get(session.getToken(), function (data)
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
                });
        }

        var searchCallback = function (searchResult)
        {
            if (searchValue && searchValue != "")
            {
                $scope.searchesResult = searchResult;

                angular.forEach($scope.searchesResult.artists, function (value, key)
                {
                    spotifySearchFactory.get({
                        name: value.artistName,
                        type: 'artist'
                    }).$promise.then(function (data)
                        {
                            if (data && data.artists && data.artists.items.length > 0)
                            {
                                spotifyArtistFactory.get({id: data.artists.items[0].id}).$promise.then(function (data)
                                {
                                    value.image = data.images[0];
                                    ++$scope.elementsLoaded;
                                }, function (err)
                                {
                                });
                            }
                            else
                            {
                                ++$scope.elementsLoaded;
                            }

                        }, function (err)
                        {
                        });
                });
                $scope.isSearching = false;
                currentSearchDone = true;

                if (searches.length > 0)
                {
                    sharedProperties.executeSearch(searchFactory, searchUsersFactory, searchCallback, 20, searches[searches.length - 1]);
                }
                searches = [];
            }
        }

        $scope.$watch('searchElement', function (value)
        {
            searchValue = value;
            if (value && value != "")
            {
                if (!$scope.isSearching && currentSearchDone)
                {
                    $scope.isSearching = true;
                    currentSearchDone = false;
                    sharedProperties.executeSearch(searchFactory, searchUsersFactory, searchCallback, 20, value);
                }
                else if ($scope.isSearching)
                {
                    searches[searches.length] = value;
                }
            }
            else
            {
                searches = [];
                $scope.searchesResult = {};
                $scope.searchesResult = sharedProperties.getSearchResultObj();
                $scope.isSearching = false;
                currentSearchDone = true;
            }
        });

        $scope.signup = function ()
        {
            signupFactory.post(session.getToken(), {
                    name    : $scope.signupInfo.name,
                    email   : $scope.signupInfo.email,
                    password: $scope.signupInfo.password
                }, function (data)
                {
                    if (data.email && data.name && data.id)
                    {
                        loginFactory.post(session.getToken(), {
                                email   : $scope.signupInfo.email,
                                password: $scope.signupInfo.password
                            }, function (data)
                            {
                                if (data.email && data.name && data.token && data.id)
                                {
                                    sharedProperties.setInfoConnection(data.email, data.name, data.token, data.id);
                                    sharedProperties.setConnected(true);
                                    localStorageService.cookie.set(session.getToken(), data.token);
                                    $('#sign-up-modal').foundation('reveal', 'close');
                                    $(document).foundation('topbar', 'reflow');
                                    Foundation.libs.topbar.toggle($('.top-bar'));
                                    $route.reload();
                                }
                            },
                            function (err)
                            {
                                sharedProperties.setConnected(false);
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
                });
        }

        $scope.search = function (str)
        {
            $scope.searchesResult = sharedProperties.getSearchResultObj();
            $scope.isSearching = false;
            currentSearchDone = true;
            $location.path('search/' + str);
        }

        $scope.$on('$routeChangeSuccess', function (next, current)
        {
            $(document).foundation();
            $(document).foundation('dropdown', 'reflow');
        });

        angular.element(document).ready(function()
        {
            autoCompletDropdownElement = $('#auto-completion');
            searchInputRow = $('#search-input-row');
        });
    });

    controllers.controller('PlaybarController', function ($scope, $route, $location,
                                                          localStorageService, sharedPagesStatus, sharedProperties)
    {
        var slideMove = false;
        var audioType = "audio/mp4";
        sharedPagesStatus.resetPageStatus();
        $scope.sharedProperties = sharedProperties;
        $scope.myAudio = {};
        $scope.speed = 1000000;
        $scope.playQueue = sharedProperties.getPlayQueue().queue;
        $scope.volume = localStorageService.get("volume");
        $scope.isLooping = localStorageService.get("isLooping");
        $scope.repeatStatesEnum = {none : 1, repeat : 2, repeatOne : 3};
        $scope.repeatState = $scope.repeatStatesEnum.none;

        var currentTrackTime = localStorageService.get("currentTrackTime");
        var currentTrackId = localStorageService.get("currentTrackId");
        var isFirstLoad = true;

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
                track = sharedProperties.getRandomQueueTrack($scope.isRandom);
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
            if (value == true)
            {
                if (($scope.isLooping == false && sharedProperties.isLastSongInQueue() == false)
                    || ($scope.isLooping))
                    $scope.next();
            }
        });

        $scope.$watch('sharedPagesStatus.getCurrentPage', function (value)
        {
            if (value == 'queue')
                $scope.isPlayQueue = true;
            else
                $scope.isPlayQueue = false;
        });

        $scope.clickOnPlayQueue = function ()
        {
            sharedPagesStatus.togglePlayQueue();
        }

        $scope.play = function ()
        {
            $scope.myAudio.playPause();
        }

        sharedProperties.setPlayCallback($scope.play);

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
            if ($scope.myAudio && newVal)
            {
                $scope.myAudio.stop();
                $scope.myAudio.load([{"src": newVal.previewUrl, "type": audioType}])
                if (isFirstLoad)
                    isFirstLoad = false;
                else
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
            $scope.currentTrack.currentTime = currentTrackTime * $scope.spzeed;
        });
    });

})();