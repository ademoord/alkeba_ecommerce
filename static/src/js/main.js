//PRELOADER
(function () {
    function id(v) {
        return document.getElementById(v);
    }

    function loadbar() {
        let ovrl = id("overlay"),
            prog = id("progress"),
            stat = id("progstat"),
            img = document.images,
            c = 0,
            tot = img.length;
        if (tot == 0) return doneLoading();

        function imgLoaded() {
            c += 1;
            let perc = ((100 / tot * c) << 0) + "%";
            prog.style.width = perc;
            stat.innerHTML = '<img src="/theme_alkeba/static/src/images/logo-alkeba-white.svg" >' + '<br/>' + "Selamat datang di Alkeba " + '<br/>' + perc;
            if (c === tot) return doneLoading();
        }

        function doneLoading() {
            ovrl.style.opacity = 0;
            setTimeout(function () {
                ovrl.style.display = "none";
            }, 1200);
        }

        for (let i = 0; i < tot; i++) {
            let tImg = new Image();
            tImg.onload = imgLoaded;
            tImg.onerror = imgLoaded;
            tImg.src = img[i].src;
        }
    }

    document.addEventListener('DOMContentLoaded', loadbar, false);
}());

// disable Bootstrap carousel defaultly
$('#o-carousel-product').carousel('pause');

//HEADER FIXED
$(window).scroll(function () {
    let sticky = $('.header-top'),
        scroll = $(window).scrollTop();

    if (scroll >= 100) {
        sticky.addClass('fixed-header');
    } else {
        sticky.removeClass('fixed-header');
    }
});

//CATEGORY MENU
document.addEventListener("DOMContentLoaded", function () {
    /////// Prevent closing from click inside dropdown
    document.querySelectorAll('.dropdown-menu').forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    })

    // make it as accordion for smaller screens
    if (window.innerWidth < 992) {
        // close all inner dropdowns when parent is closed
        document.querySelectorAll('.navbar .dropdown').forEach(function (everydropdown) {
            everydropdown.addEventListener('hidden.bs.dropdown', function () {
                // after dropdown is hidden, then find all submenus
                this.querySelectorAll('.submenu').forEach(function (everysubmenu) {
                    // hide every submenu as well
                    everysubmenu.style.display = 'none';
                });
            })
        });

        document.querySelectorAll('.dropdown-menu a').forEach(function (element) {
            element.addEventListener('click', function (e) {

                let nextEl = this.nextElementSibling;
                if (nextEl && nextEl.classList.contains('submenu')) {
                    // prevent opening link if link needs to open dropdown
                    e.preventDefault();
                    console.log(nextEl);
                    if (nextEl.style.display == 'block') {
                        nextEl.style.display = 'none';
                    } else {
                        nextEl.style.display = 'block';
                    }

                }
            });
        })
    }
    // end if innerWidth

});

// upload image display instance
 function imageReadURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#is_image')
                .attr('src', e.target.result)
                .width(150)
                .height(170);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

//MOBILE JS
function resizeScreen() {
    if ($(window).width() < 901) {
        // $('.multilevel .dropdown-category.show').removeClass('show')
        $('.close-shop-brand').click(function () {
            $('.dropdown-menu.dropdown-brand').removeClass('show')
            $('.dropdown-toggle').removeClass('show')
        })
        $('.close-category').click(function () {
            $('.dropdown-category.show').removeClass('show')
            $('.dropdown-toggle').removeClass('show')
        })
        $(function () {
            $("#ic-nav-mobile").on("click", function (e) {
                $(".header-info").toggleClass("show");
                e.stopPropagation()
            });
            $(document).on("click", function (e) {
                if ($(e.target).is(".header-info") === false) {
                    $(".header-info").removeClass("show");
                }
            });
        });
        $('.multilevel .dropdown-category div + li.has-submenu').addClass('show')
        $('.multilevel .dropdown-menu li.has-submenu .dropdown-toggle').click(function () {
            $('.multilevel .dropdown-menu li.has-submenu').removeClass('show')
            $(this).parent('.has-submenu').addClass('show')
        })
        // cart
        // $('.header, .footer').hide()
        $('body').addClass('cart-page')
        // product list
        $('.nav-filter').click(function () {
            $('.product-list .left-product').addClass('show')

        // popup filter product
        // new func to handle the x icon click event
        $('.close-filter-modal').click(function () {
            // close the modal/popup
            $('.product-list .left-product').removeClass('show');
        })

        })
        $('.close-nav-filter').click(function () {
            $('.product-list .left-product').removeClass('show')
        })
        // product detail
        $('body').addClass('product-detail-page')
    } else {
        // $('.multilevel .dropdown-category').addClass('show')
        $('.header-info').removeClass('show')
        // cart
        $('.header, .footer').show()
        $('body').removeClass('cart-page')
        // product detail
        $('body').removeClass('product-detail-page')
    }
    ;
}

function resizeScreenDesktop() {
    if ($(window).width() > 1200) {
        $(".floating-share").stick_in_parent({
            offset_top: 100,
        });
    } else {
    }
}

resizeScreen(); // on load
$(window).resize(resizeScreen); // on window resize

$(document).on("keypress", "textarea.auto-grow", function (e) {
    let height = $(this).css("height");
    let iScrollHeight = $(this).prop("scrollHeight");
    $(this).css('height', iScrollHeight);
});

// ACTION ICON EYES PASSWORD
$(".input-password").on('click', '.toggle-password', function() {
    $(this).toggleClass("icon-eye-off");
        var input = $(this).siblings(".pass_log_id");
        if (input.attr("type") === "password") {
        input.attr("type", "text");
        } else {
        input.attr("type", "password");
    }
});

// INIT SLICK
function init_slick(class_init) {
    $(class_init).slick({
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false
    });
}

// After slick initialization, add/remove the aria-hidden attribute to the slides
$('.benefit-slider').on('setPosition', function() {
    $('.benefit-slider .slick-slide').each(function(index, slide) {
      if (index >= $('.benefit-slider .slick-current').data('slick-index') && index < ($('.benefit-slider .slick-current').data('slick-index') + $('.benefit-slider .slick-dots button').length)) {
        $(slide).attr('aria-hidden', 'false');
      } else {
        $(slide).attr('aria-hidden', 'false');
      }
    });
  });

//FILTER SEARCH BRAND
$(".filter-brand a").click(function () {
    let letter = $(this).html();

    let matchText = function () {
        return $(this).text() === letter;
    }

    $('.list-brands').animate({
        scrollTop: $(".brand-box h6").filter(matchText).offset() ?
            $(".brand-box h6").filter(matchText).offset().top : null
    }, 2000);
});

// This line causing error
//$(".select-styled").select2();

//BENEFIT SLIDER
$('.benefit-slider').slick({
    dots: false,
    infinite: false,
    arrows: false,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            }


        }, {
            breakpoint: 800,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: true,
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: true,
            }
        }]
});


// PRODUCT SLIDER
$('.product-slider').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [{
        breakpoint: 992,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
            dots: false,
            infinite: false,

        }


    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: true,
            infinite: false,

        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
        }
    }]
});

// ====================
// Home
// ====================
$('#slick-main').slick({
    slidesToShow: 1,
    dots: true,
    arrows: true,
    infinite: true,
    speed: 300,
    centerMode: false,
    autoplay: true,
    slidesToScroll: 1,
    responsive: [{
        breakpoint: 600,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false,
            infinite: true,
            centerMode: true,
        }
    }]
});

$('.flash-product-slider').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [{
        breakpoint: 992,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: false,
            infinite: true,
        }
    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: false

        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: false
        }
    }]
});

// new variable to count the ongoing swipe
var swipeCount = 0;

// new func to handle the swipe
$('.slider-banner-promo').on('swipe', function(event, slick, direction) {

    // increment the swipe
    swipeCount++;
  
    // condition to change the style margin 
    if (swipeCount == 3) {
        // responsively change the margin to show
        // the 4th img even when infinite property
        // is set to false
        $(this).css({'margin': '-1px -265px'});

    } else if (parseInt($(this).css('margin')) === -1) {
        // trackback to basic margin when it done
        $(this).css({'margin': '0 -5px'});
        // set the counter back to 0
        swipeCount = 0;
    }
});

$('.slider-banner-promo').slick({
    dots: false,
    infinite: false,
    arrows: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
        {
            breakpoint: 980,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                variableWidth: true,
                dots: false,
                infinite: false,
                swipeToSlide: true,
            }
        },

        {
            breakpoint: 800,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                variableWidth: true,
                dots: false,
                infinite: false,
                swipeToSlide: true,
            }
        },
        
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                variableWidth: true,
                dots: false,
                infinite: false,
                swipeToSlide: true,
            }
        }
    ]
});

$('.category-product-event').slick({
    dots: false,
    infinite: false,
    arrows: false,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                dots: false,
            }
        }, {
            breakpoint: 800,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                dots: false,
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                dots: false,
            }
        }]
});

$('.best-product-slider').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [{
        breakpoint: 1024,
        settings: {
            slidesToShow: 5,
            slidesToScroll: 1,
        }
    }, {
        breakpoint: 992,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 2,
            dots: false,
            infinite: false,
        }
    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 2,
            dots: false,
            infinite: false,
        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            infinite: false,
        }
    }]
});

$('.insight-slider').slick({
    dots: false,
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [{
        breakpoint: 1024,
        settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
        }
    }, {
        breakpoint: 992,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: false,
            infinite: false,
        }
    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            infinite: false,
        }
    }, {
        breakpoint: 600,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: false,
            infinite: true,
        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: false,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 2000,
        }
    }]
});

$('.slider-team').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    responsive: [{
        breakpoint: 992,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: false,
            infinite: true,
        }
    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: true
        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: true
        }
    }]
});

$('.slider-berita').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    responsive: [{
        breakpoint: 992,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: false,
            infinite: true,
        }
    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: true
        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: true
        }
    }]
});

$('.slider-promo').slick({
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    responsive: [{
        breakpoint: 992,
        settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            dots: false,
            infinite: true,
        }
    }, {
        breakpoint: 800,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: true
        }
    }, {
        breakpoint: 480,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            arrows: true
        }
    }]
});

// ====================
// Dashboard
// ====================
$('.filter-order-slider').slick({
    dots: false,
    infinite: false,
    arrows: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    responsive: [
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                dots: false,

            }


        }, {
            breakpoint: 800,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                dots: false,

            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                dots: false,
            }
        }]
});
// Show the first tab and hide the rest
$('#order-tab li:first-child').addClass('active');
$('.tabs-content').hide();
$('.tabs-content:first').show();

// Click function
$('#order-tab li').click(function () {
    $('#order-tab li').removeClass('active');
    $(this).addClass('active');
    $('.tabs-content').hide();

    let activeTab = $(this).find('a').attr('href');
    $(activeTab).fadeIn();
    return false;
});

$('.retur-options').click(function () {
    $('.retur-options').removeClass('active')
    $('.radio-orange').removeClass('active')
    $(this).addClass('active');
    $('.retur-options').parents('.accordion-item').removeClass('active');
    $('.retur-options').siblings('.accordion-collapse').removeClass('show');
    $(this).parents('.accordion-item').addClass('active');
    $('.retur-options').find('input[type=radio]').prop("checked", false);
    $(this).find('input[type=radio]').prop("checked", true);
});

$(".dropdown-select .dropdown-menu").on('click', 'li a', function () {
    $('.dropdown-select .dropdown-menu li a').removeClass('active')
    $(this).addClass('active')
    $(".dropdown-select .btn:first-child").text($(this).text());
    $(".dropdown-select .btn:first-child").val($(this).text());
});

// ====================
// Cart
// ====================
$(document).ready(function () {
    $('.minus').click(function () {
        let $input = $(this).parent().find('input');
        let count = parseInt($input.val()) - 1;
        count = count < 1 ? 1 : count;
        $input.val(count);
        $input.change();
        return false;
    });
    $('.plus').click(function () {
        let $input = $(this).parent().find('input');
        $input.val(parseInt($input.val()) + 1);
        $input.change();
        return false;
    });

    $('#see-detail-product').click(function () {
        $('.standard').removeClass('detail-truncate');
        $(this).hide();
    });
})

$('.notes-form').click(function () {
    $(this).addClass('edited');
});

$('.save-notes').click(function () {
    $(this).parents('.notes-form').addClass('saved');
    $(this).parents('.notes-form').find('textarea').prop('disabled', true);
});

$('.edit-notes').click(function () {
    $(this).parents('.notes-form').removeClass('saved');
    $(this).parents('.notes-form').find('textarea').prop('disabled', false);
});

$(function () {
    $('.dropdown-location .dropdown-menu li:nth-child(1) a').addClass('active')
    $(".dropdown-location .dropdown-menu").on('click', 'li a', function () {
        $('.dropdown-location .dropdown-menu li a ').removeClass('active')
        $(this).addClass('active')
        $(".dropdown-location .btn:first-child").text($(this).find('.locations').text());
        $(".dropdown-location .btn:first-child").val($(this).text());
    });
});

$(function () {
    $('.dropdown-courier .dropdown-menu li:nth-child(1) a').addClass('active')
    $(".dropdown-courier .dropdown-menu").on('click', 'li a', function () {
        $('.dropdown-courier .dropdown-menu li a ').removeClass('active')
        $(this).addClass('active')
        let parent_image;
        if ($(this).parents("li").hasClass("dropdown-submenu")) {
            parent_image = $(this).parents(".dropdown-submenu").find("img").clone();
        } else {
            parent_image = $(this).find("img").clone();
        }

        let current_selected = $(this).find('.courier').text();
        $(".dropdown-courier .btn:first-child").html(parent_image).append("<span class='courier-selected'>" + current_selected + "</span>")
        $(".dropdown-courier .btn:first-child, .dropdown-menu").removeClass("show")
    });
});

$(function () {
    $(".dropdown-payment .dropdown-menu").on('click', 'li a', function () {
        $('.dropdown-payment .dropdown-menu li a ').removeClass('active')
        $(this).addClass('active')
        if ($(this).parents("li").hasClass("dropdown-submenu")) {
            parent_image = $(this).parents(".dropdown-submenu").find("img").clone();
        } else {
            parent_image = $(this).find("img").clone();
        }

        let current_selected = $(this).find('.payment-box').text();
        $(".dropdown-payment .btn:first-child").html(parent_image).append("<span class='payment-selected'>" + current_selected + "</span>")
        $(".dropdown-payment .btn:first-child, .dropdown-menu").removeClass("show")
    });
});

$(".voucher-code .form-control").on("input", function () {
    $(this).parents('.voucher-code').addClass('focused')
});
$(".voucher-code .form-control").on("blur", function () {
    if (this.value == "") $(this).parents('.voucher-code.focused').removeClass('focused')
})
$(".voucher-code .form-control").on("focus", function () {
    $(this).parents('.voucher-code').addClass('focused')
})

$('.apply-voucher').click(function () {
    $(this).hide()
    $('.delete-voucher').addClass('active');
});

$('.delete-voucher').click(function () {
    $(this).siblings('.apply-voucher').show()
    $('.delete-voucher').removeClass('active');
});

$('.payment-options').click(function () {
    $('.payment-options').removeClass('active')
    $('.radio-orange').removeClass('active')
    $(this).addClass('active');
    $('.payment-options').parents('.accordion-item').removeClass('active');
    $('.payment-options').siblings('.accordion-collapse').removeClass('show');
    $(this).parents('.accordion-item').addClass('active');
    $('.payment-options').find('input[type=radio]').prop("checked", false);
    $(this).find('input[type=radio]').prop("checked", true);
});

// Set the date we're counting down to
let countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();

// Update the count down every 1 second
let x = setInterval(function () {

    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the count down date
    let distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
//  document.getElementById("countdown-box").innerHTML =  hours + " : "
//  + minutes + " : " + seconds ;

    // If the count down is finished, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("countdown-box").innerHTML = "EXPIRED";
    }
}, 1000);

$(".floating-share").stick_in_parent({
    offset_top: 100,
});

$("[id^=checkAll_]").on('change', function () {
    if ($(this).prop("checked") == true) {
        $(this).parents().siblings('.delete-all').show()
        $(this).parents('.table').find(".checkbox input[type='checkbox']").prop('checked', $(this).is(":checked"));
    } else {
        $(this).parents().siblings('.delete-all').hide()
        $(this).parents('.table').find(".checkbox input[type='checkbox']").prop('checked', $(this).is(" "));
    }
});

$('tbody .checkbox input[type="checkbox"]').click(function () {
    if ($(this).prop("checked") == false) {
        $(this).parents().find('.delete-all').hide()
        $(this).parents('.table').find('[id^=checkAll_]').prop('checked', false);
    }
})

// ====================
// Product List
// ====================
$(function () {
    $(".dropdown-show .dropdown-menu").on('click', 'li a', function () {
        $('.dropdown-show .dropdown-menu li a').removeClass('active')
        $(this).addClass('active')
        $(".dropdown-show .btn:first-child").text($(this).text());
        $(".dropdown-show .btn:first-child").val($(this).text());
    });
});

// ====================
// Product Detail
// ====================
$(document).ready(function () {
    $(".slider-photo-review").slick({
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false
    });
});

init_slick = true
$("#photoModal").on("shown.bs.modal", function () {
    //init_slick(".slider-photo-review")
    if (init_slick) {
        $(".slider-photo-review").slick("refresh");
        init_slick = false;
    }
    $('.wrap-modal-slider').addClass('open');
});

if ($('.product__slider-main').length) {
    let $slider = $('.product__slider-main')
        .on('init', function (slick) {
            $('.product__slider-main').fadeIn(1000);
            clrbx();
        })
        .slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            lazyLoad: 'ondemand',
            autoplaySpeed: 3000,
            asNavFor: '.product__slider-thmb'
        });


    let thumbnailsSlider = $('.product__slider-thmb')
        .on('init', function (slick) {
            $('.product__slider-thmb').fadeIn(1000);
        })
        .slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            lazyLoad: 'ondemand',
            asNavFor: '.product__slider-main',
            dots: false,
            centerMode: false,
            focusOnSelect: true
        });

    //remove active class from all thumbnail slides
    $('.product__slider-thmb .slick-slide').removeClass('slick-active');

    //set active class to first thumbnail slides
    $('.product__slider-thmb .slick-slide').eq(0).addClass('slick-active');

    // On before slide change match active thumbnail to current slide
    $('.product__slider-main').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        let mySlideNumber = nextSlide;
        $('.product__slider-thmb .slick-slide').removeClass('slick-active');
        $('.product__slider-thmb .slick-slide').eq(mySlideNumber).addClass('slick-active');
    });

    // init slider
    //require(['js-sliderWithProgressbar'], function(slider) {
    $('.product__slider-main').each(function () {
        //let sldr = new slider($(this), options, sliderOptions, previewSliderOptions);
    });
    //});

    let options = {
        progressbarSelector: '.bJS_progressbar'
        , slideSelector: '.bJS_slider'
        , previewSlideSelector: '.bJS_previewSlider'
        , progressInterval: ''
        , onCustomProgressbar: function ($slide, $progressbar) {
        }
    }

    let sliderOptions = {
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: true,
        autoplay: true
    }

    let previewSliderOptions = {
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        focusOnSelect: true,
        centerMode: true
    }

    // Colorbox
    function clrbx() {
        /*let $slides = $('.product__slider--lghtbox .slide img');
        console.log($slides);
        $('.product__slider--lghtbox .slide img').colorbox({
          rel: 'cboxElement',
        });*/


        $('.product__slider-main .slick-slide').each(function () {

        });

        //$('.product__slider-main .slick-slide').each()
    }
}

$(document).ready(function () {
    $('#see-detail-product').click(function () {
        $('.detail-truncate').removeClass('detail-truncate');
        $(this).hide();
    });


    // Floating content
    $(window).scroll(function () {
        let scroll = $(window).scrollTop();
        headH = $(".product-about-right").offset().top;
        floating = $(".product-about-right").height();
        // headH2 = $(".edu-detail-content").height() + headH - 250;
        headH2 = $(".product-about-right").height() + headH - floating;


        if (scroll >= headH && scroll <= headH2) {
            $(".product-about-right").addClass("fixed");
        } else {
            $(".product-about-right").removeClass("fixed");
        }
    });
})

$(function () {
    $('.dropdown-location .dropdown-menu li:nth-child(1) a').addClass('active')
    $(".dropdown-location .dropdown-menu").on('click', 'li a', function () {
        $('.dropdown-location .dropdown-menu li a ').removeClass('active')
        $(this).addClass('active')
        $(".dropdown-location .btn:first-child").text($(this).find('.locations').text());
        $(".dropdown-location .btn:first-child").val($(this).text());
    });
});

// ====================
// Ulasan
// ====================
$('.btn-ulasan').click(function () {
    $(this).hide()
    $(this).parents('.ulasan-product').first().find('.form-ulasan').addClass('show')
})

$('.btn-ulasan-batal').click(function () {
    $('.btn-ulasan').show()
    $(this).parents('.ulasan-product').first().find('.form-ulasan').removeClass('show')
})

$(document).ready(function () {
    /* 1. Visualizing things on Hover - See next part for action on click */
    $('#stars li').on('mouseover', function () {
        let onStar = parseInt($(this).data('value'), 10); // The star currently mouse on

        // Now highlight all the stars that's not after the current hovered star
        $(this).parent().children('li.star').each(function (e) {
            if (e < onStar) {
                $(this).addClass('hover');
            } else {
                $(this).removeClass('hover');
            }
        });
    }).on('mouseout', function () {
        $(this).parent().children('li.star').each(function (e) {
            $(this).removeClass('hover');
        });
    });

    /* 2. Action to perform on click */
    $('#stars li').on('click', function () {
        let onStar = parseInt($(this).data('value'), 10); // The star currently selected
        let stars = $(this).parent().children('li.star');

        for (i = 0; i < stars.length; i++) {
            $(stars[i]).removeClass('selected');
        }

        for (i = 0; i < onStar; i++) {
            $(stars[i]).addClass('selected');
        }

        // JUST RESPONSE (Not needed)
        let ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
        let msg = "";
        if (ratingValue > 1) {
            msg = "(" + ratingValue + ")";
        } else {
            msg = "(" + ratingValue + ")";
        }
        responseMessage(msg);
    });
});

function responseMessage(msg) {
    $('.success-box').fadeIn(200);
    $('.success-box div.text-message').html("<span>" + msg + "</span>");
}

$(".imgAdd").click(function () {
    $(this).closest(".row").find('.imgAdd').before('<div class="imgUp"><div class="imagePreview"></div><label class="btn btn-primary">Upload<input type="file" class="uploadFile img" value="Upload Photo" style="width:0px;height:0px;overflow:hidden;"></label><i class="fa fa-times del"></i></div>');
});

$(document).on("click", "i.del", function () {
    //    to remove card
    $(this).parent().remove();
    // to clear image
    // $(this).parent().find('.imagePreview').css("background-image","url('')");
});

$(function () {
    $(document).on("change", ".uploadFile", function () {
        let uploadFile = $(this);
        let files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) return; // no file selected, or no FileReader support

        if (/^image/.test(files[0].type)) { // only image file
            let reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file

            reader.onloadend = function () { // set image data as background of div
                //alert(uploadFile.closest(".upimage").find('.imagePreview').length);
                uploadFile.closest(".imgUp").find('.imagePreview').css("background-image", "url(" + this.result + ")");
            }
        }
    });
});