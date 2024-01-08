odoo.define('theme_alkeba.product-list', function (require) {
	'use strict';

	let session = require('web.session');
	let ajax = require('web.ajax');

	//HIDE MENU CATEGORY
	$('.multilevel .dropdown-category.show').removeClass('show')
	
	//MOBILE JS
	function resizeScreen() {
		var urlPath = window.location.pathname.split("/");
		var len_url = urlPath.filter(item => item.trim() !== '');

		if ($(window).width() < 901) {
			$('.multilevel .dropdown-category').removeClass('show')
			$('.nav-filter').click(function(){
				$('.product-list .left-product').addClass('show')
			})
		} else {
				if (len_url.length > 0){
					$('.multilevel .dropdown-category').removeClass('show')
				} else {
					$('.multilevel .dropdown-category').addClass('show')
				}
			}
		};
	  
		$('.close-nav-filter').click(function(){
			$('.product-list .left-product').removeClass('show')
		})
	
	resizeScreen(); // on load
	$(window).resize(resizeScreen); // on window resize


	//DROPDOWN SORTING & ShOW
	$(function(){
		$(".dropdown-sorting .dropdown-menu").on('click', 'li a', function(){
			$('.dropdown-sorting .dropdown-menu li a').removeClass('active')
			$(this).addClass('active')
			$(".dropdown-sorting .btn:first-child").text($(this).text());
			$(".dropdown-sorting .btn:first-child").val($(this).text());
		});
	});

	$(function(){
		$(".dropdown-show .dropdown-menu").on('click', 'li a', function(){
			$('.dropdown-show .dropdown-menu li a').removeClass('active')
			$(this).addClass('active')
		  $(".dropdown-show .btn:first-child").text($(this).text());
		  $(".dropdown-show .btn:first-child").val($(this).text());
	   });
	});

	//MODE PRODUCT
	$('.mode-product li a').click(function(){
		if (!$(this).hasClass("list-views")) {
			$('.mode-product li a').removeClass('active')
			$(this).addClass('active')
			$('.list-product').removeClass('list-view-block')
		}else if ($(this).hasClass("list-views")){
			$('.mode-product li a').removeClass('active')
			$(this).addClass('active')
			$('.list-product').addClass('list-view-block')
		}
	})

	// shop by brand
	$('a#shopbybrandBtn').on('click', function () {
		let brandProductUrl = `/brand-product`;
		$('#brandListAlphabets a').remove();
		$('#brandListAlphabets').append('<a href=javascript:void(0)>Semua</a>');
	  
		ajax.jsonRpc(brandProductUrl, 'call').then(function (data) {
			let resDataBrand = JSON.parse(data);
			// for (const loop_brands of Object.entries(conv_data["city"])) {
			for (const [key, value] of Object.entries(resDataBrand)) {
				// for (const data of Object.entries(resDataBrand)) {
				// $('#brandList').append('<h6>' + key + '</h6>');
				$('#brandListAlphabets').append('<a href=javascript:void(0)>' + key + '</a>');

				var list_vals = []
				for (const loop_brands of value) {
					// $('#brandList').append('<li><a href=' + loop_brands + '>' + loop_brands + '</a></li>');
			
					list_vals.push('<li><a href=' + loop_brands.url + '>' + loop_brands.name + '</a></li>');
				}
				$('#brandList').append('<div class="brand-box">' + '<h6>' + key + '</h6>' + '<ul>' + list_vals.join("") + '</ul>' + '</div>');
			}
			return;
		});
	});
			
});
