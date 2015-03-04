/**
 * Created by blackwires on 02/03/2015.
 */

function httpGetImageDataURI($http, url, callback)
{
    $http.get(url,
        {
            responseType: 'blob'
        }).success(function (data, status, headers, config)
        {
            var reader = new FileReader();

            reader.onload = function()
            {
               callback(reader.result);
            }
            reader.readAsDataURL(data)
        });
}

function millisToTime(s)
{
    function addZ(n)
    {
        if (n < 10)
            n *= 10;
        return n;
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var seconds = s % 60;
    s = (s - seconds) / 60;
    var minutes = s % 60;
    var hours = (s - minutes) / 60;

    seconds = addZ(seconds);
    return {"Hours": hours, "Minutes": minutes, "Seconds": seconds};
}

function itunesLinkImageSizeTo(url, size)
{
    var str1 = url.substring(0, url.lastIndexOf('x') - 3);
    var str2 = url.substring(url.lastIndexOf('x') + 4, url.length);

    return str1 + size + "x" + size + str2;
}

function getSentencesNb(str, nb)
{
    var finalStr = "";
    var consumedStr = str;

    for (var i = 0; i < nb; ++i)
    {
        finalStr += consumedStr.substring(0, consumedStr.indexOf('.')) + '. ';
        consumedStr = consumedStr.substring(consumedStr.indexOf('.') + 1, consumedStr.length);
    }

    return finalStr;
}