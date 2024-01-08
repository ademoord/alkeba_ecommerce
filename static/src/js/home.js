
//MOBILE JS UKURAN kurang dari 901
function resizeScreen() {
    if ($(window).width() < 901) {
       

    } else {
        $('.multilevel .dropdown-category').addClass('show')
    };
}
resizeScreen(); // on load
$(window).resize(resizeScreen); // on window resize
 //BANNER TOP HOME
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
         arrows:false,
         infinite: true,
         centerMode:true,
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
          dots:true,
          infinite: false,
          arrows:false
          
         }
         }, {
         breakpoint: 480,
         settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots:true,
          infinite: false,
          arrows:false
         }
         }]
         });
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
          dots:true,
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
         
         $('.slider-banner-promo').slick({
         dots: false,
         infinite: false,
         arrows:false,
         speed: 300,
         slidesToShow: 4,
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
         
         
         $('.category-product-event').slick({
         dots: false,
         infinite: false,
         arrows:false,
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
         