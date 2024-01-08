//HIDE MENU CATEGORY
$('.multilevel .dropdown-category.show').removeClass('show')

$('.filter-order-slider').slick({
         dots: false,
         infinite: false,
         arrows:true,
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
$('#order-tab li').click(function(){
  $('#order-tab li').removeClass('active');
  $(this).addClass('active');
  $('.tabs-content').hide();
  
  var activeTab = $(this).find('a').attr('href');
  $(activeTab).fadeIn();
  return false;
});

$('.retur-options').click(function(){
  $('.retur-options').removeClass('active')
                  $('.radio-orange').removeClass('active')
                  $(this).addClass('active');
                  $('.retur-options').parents('.accordion-item').removeClass('active');
                  $('.retur-options').siblings('.accordion-collapse').removeClass('show');
                  $(this).parents('.accordion-item').addClass('active');
                  $('.retur-options').find('input[type=radio]').prop("checked", false);
                  $(this).find('input[type=radio]').prop("checked", true);
               });

    $(".dropdown-select .dropdown-menu").on('click', 'li a', function(){
        $('.dropdown-select .dropdown-menu li a').removeClass('active')
        $(this).addClass('active')
      $(".dropdown-select .btn:first-child").text($(this).text());
      $(".dropdown-select .btn:first-child").val($(this).text());
   });



