/**
 * Created by KOALA on 04/02/2015.
 */

function slickSetCanvasBackgroundSrc(event, slick, direction)
{
    blur.init({
        el  : document.querySelector('body'),
        path: this.getElementsByClassName('slick-center')[0].getElementsByTagName('img')[0].src
    });
}

function initSlider()
{
    $('.slider-index').on('afterChange', slickSetCanvasBackgroundSrc);
    $('.slider-index').on('init', slickSetCanvasBackgroundSrc);
};
