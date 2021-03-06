/**
 * Created by blackwires on 02/03/2015.
 */

(function ()
{
    var factories = angular.module('factories', ['ngResource']);

    factories.ubeatBaseUnsecureUrl = 'https://ubeat.herokuapp.com/unsecure/';
    factories.ubeatBaseSecureUrl = 'https://ubeat.herokuapp.com/';
    factories.localSecureUbeatUrl = "http://localhost:3000/";
    factories.localUnsecureUbeatUrl = "http://localhost:3000/unsecure/";
    factories.isSecure = false;
    factories.isLocal = false;
    factories.ubeatBaseUrl = factories.isSecure ? factories.ubeatBaseSecureUrl : factories.ubeatBaseUnsecureUrl;
    factories.spotifyUrl = 'https://api.spotify.com/v1/';

    factories.getUbeatApiURL = function (session)
    {
        return session.isConnected() ? factories.ubeatBaseSecureUrl : factories.ubeatBaseUnsecureUrl;
    }

    factories.resolveUbeatApiURL = function (url, isOnlySecure)
    {
        if (factories.isLocal)
        {
            if (isOnlySecure)
            {
                return factories.localSecureUbeatUrl;
            }
            else
            {
                return factories.isSecure ? factories.localSecureUbeatUrl : factories.localUnsecureUbeatUrl;
            }
        }
        return url;
    }

    factories.generateHttpReq = function (method, url, header, data)
    {
        return {
            method : method,
            url    : url,
            headers: {'Authorization': header},
            data   : data
        }
    }

    factories.httpReq = function ($http, req, successCallback, errorCallback)
    {
        $http(req).success(function (data)
        {
            if (successCallback)
            {
                successCallback(data);
            }
        }).error(function (err)
        {
            if (errorCallback)
            {
                errorCallback(err);
            }
        });
    }

    factories.factory('playStates', function ()
    {
        return {
            play : 'play',
            pause: 'pause',
            idle : 'idle'
        };
    });

    factories.factory('searchFactory', function ($http, $resource, session)
    {
        return {
            get: function (token, element, maxItems, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.getUbeatApiURL(session)) + 'search/?q=' + element + '&limit=' + maxItems, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('searchUsersFactory', function ($http, $resource, session)
    {
        return {
            get: function (token, element, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.getUbeatApiURL(session)) + 'search/users?q=' + element, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('loginFactory', function ($http)
    {
        return {
            post: function (token, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('POST', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'login', token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('logoutFactory', function ($http)
    {
        return {
            get: function (token, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'logout', token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('signupFactory', function ($http)
    {
        return {
            post: function (token, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('POST', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'signup', token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('albumFactory', function ($http, $resource, session)
    {
        return {
            get: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.getUbeatApiURL(session)) + 'albums/' + id, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('albumTracksFactory', function ($http, $resource, session)
    {
        return {
            get: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.getUbeatApiURL(session)) + 'albums/' + id + '/tracks', token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('artistFactory', function ($http, $resource, session)
    {
        return {
            get: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.getUbeatApiURL(session)) + 'artists/' + id, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('artistAlbumsFactory', function ($http, $resource, session)
    {
        return {
            get: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.getUbeatApiURL(session)) + 'artists/' + id + '/albums', token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('artistBiographiesFactory', function ($http, $resource)
    {
        return $resource('https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=:name&lang=fr&api_key=96e32d771a05237e0a77d0fd3f4b2401&format=json');
    });

    factories.factory('spotifyArtistFactory', function ($http, $resource)
    {
        return $resource(factories.spotifyUrl + 'artists/:id');
    });

    factories.factory('spotifySearchFactory', function ($http, $resource)
    {
        return $resource(factories.spotifyUrl + 'search?query=:name&type=:type');
    });

    factories.factory('totalPlaylistsFactory', function ($http)
    {
        return {
            get : function (token, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists', token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            },
            post: function (token, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('POST', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists', token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('singlePlaylistFactory', function ($http)
    {
        return {

            get: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + id, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            },

            put: function (token, id, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('PUT', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + id, token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            },

            delete: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('DELETE', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + id, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('singlePlaylistTracksFactory', function ($http)
    {
        return {
            post: function (token, id, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('POST', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + id + "/tracks", token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('singlePlaylistSingleTrackFactory', function ($http)
    {
        return {
            get: function (token, id, trackId, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + id + "/tracks/" + trackId, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            },

            put: function (token, id, trackId, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('PUT', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + id + "/tracks/" + trackId, token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            },

            delete: function (token, playlistId, trackId, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('DELETE', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'playlists/' + playlistId + "/tracks/" + trackId, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('tokenInfoFactory', function ($http)
    {
        return {
            get: function (token, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'tokenInfo', token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('usersFactory', function ($http)
    {
        return {
            get: function (token, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'users', token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    })

    factories.factory('singleUserFactory', function ($http)
    {
        return {
            get: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('GET', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'users/' + id, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('followFactory', function ($http)
    {
        return {
            post: function (token, data, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('POST', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'follow', token, data);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

    factories.factory('unfollowFactory', function ($http)
    {
        return {
            delete: function (token, id, successCallback, errorCallback)
            {
                var req = factories.generateHttpReq('DELETE', factories.resolveUbeatApiURL(factories.ubeatBaseSecureUrl, true) + 'follow/' + id, token, null);
                factories.httpReq($http, req, successCallback, errorCallback);
            }
        }
    });

})
();