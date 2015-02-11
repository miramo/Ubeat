/**
 * Created by KOALA on 04/02/2015.
 */

function slickSetCanvasBackgroundSrc(event, slick, direction)
{
    blur.init({ el : document.querySelector('body'), path : this.getElementsByClassName('slick-center')[0].getElementsByTagName('img')[0].src });
}

$(document).ready(function(){
    $('.slider-index').on('afterChange', slickSetCanvasBackgroundSrc);
    $('.slider-index').on('init', slickSetCanvasBackgroundSrc);

    $('#slider-index-artists').slick({
        speed: 300,
        centerMode: true,
        focusOnSelect: true,
        dots: true,
        slidesToShow: 7,
        slidesToScroll: 1,
        swipeToSlide: true,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    autoplay: false,
                    slidesToShow: 5
                }
            },
            {
                breakpoint: 600,
                settings: {
                    autoplay: false,
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 480,
                settings: {
                    autoplay: false,
                    dots: false,
                    slidesToShow: 1
                }
            }
        ]
    });
    $('#slider-index-albums').slick({
        speed: 300,
        centerMode: true,
        focusOnSelect: true,
        dots: true,
        slidesToShow: 7,
        slidesToScroll: 1,
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 480,
                settings: {
                    dots: false,
                    slidesToShow: 1
                }
            }
        ]
    });
});
