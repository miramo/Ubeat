/**
 * Created by blackwires on 04/03/2015.
 */

(function ()
{
    var services = angular.module('services', []);

    services.service('sharedProperties', function ()
    {
        var title = 'Ubeat';

        return {
            getTitle: function ()
            {
                return title;
            },
            setTitle: function (value)
            {
                title = value;
            }
        };
    });
})();