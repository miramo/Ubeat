/**
 * Created by blackwires on 04/02/2015.
 */

function displayPlayButton()
{
    var elements = document.getElementsByClassName("music-row");

    for (var i = 0; i < elements.length; ++i)
    {
        elements[i].addEventListener('mouseover', mouseOver, false);
        elements[i].addEventListener('mouseout', mouseOut, false);
    }

    function mouseOver()
    {
        var button = this.getElementsByClassName("hide-play-button")[0];

        button.style.visibility = "visible";
    }

    function mouseOut()
    {
        var button = this.getElementsByClassName("hide-play-button")[0];

        button.style.visibility = "hidden";
    }
}