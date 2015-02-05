/**
 * Created by BlackWires on 27/01/2015.
 */

var canvas = document.getElementById("topCanvas");
var canvasContext = canvas.getContext("2d");
var canvasBackground = new Image();

canvasBackground.onload = function ()
{
    drawBlur();
}

var drawBlur = function ()
{
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight;
    // Store the width and height of the canvas for below
    var w = canvas.width;
    var h = canvas.height;

    // This draws the image we just loaded to our canvas
    canvasContext.drawImage(canvasBackground, 0, 0, w, h);
    // This blurs the contents of the entire canvas
    stackBlurCanvasRGBA("topCanvas", 0, 0, w, h, 100);
};