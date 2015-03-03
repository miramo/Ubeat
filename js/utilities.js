/**
 * Created by blackwires on 02/03/2015.
 */

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