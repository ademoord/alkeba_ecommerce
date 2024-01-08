odoo.define('theme_alkeba.select-address', function (require) {
	'use strict';

	let ajax = require('web.ajax');
	let session = require('web.session');

	// new two global var to be processed
	// in several/different jquery call
	var globalParams = [];
	let addrValsInOrder = {
		"label": "",
		"street": "",
		"state": "",
		"city": "",
		"district": "",
		"village": "",
		"zip": ""
	}
	
	var $select_isProvince = $(".province");
	var $select_isCity = $(".citylist");
	var $select_isDistrict = $(".districtlist");
	var $select_isVillage = $(".villagelist");

	$select_isProvince.select2();
	$select_isCity.select2();
	$select_isDistrict.select2();
	$select_isVillage.select2();

	$("input.labelAlamat").val("");
	$("#detailAlamat").val("");

	$("#villagelist").select2("val", "");

	$("#province").select2({
		"placeholder":"Pilih Provinsi",
		"allowClear": true
	});
	$( "#province" ).val('').trigger('change');

	$("#citylist").select2({
		"placeholder":"Pilih Kota",
		"allowClear": true
	});

	$("#villagelist").select2({
		"placeholder":"Pilih Desa",
		"allowClear": true
	});

	$("#districtlist").select2({
		"placeholder":"Pilih Kec",
		"allowClear": true
	});

	$('b[role="presentation"]').hide();
	$('span[role="presentation"]').hide();
	$('abbr[class="select2-search-choice-close"]').hide();


	$('a#submitAddress').on('click', function(e) {
		var list_vals = []

		let val1 = $('#labelAlamat').val()
		let val2 = $('#detailAlamat').val()
		let val3 = $('#province :selected').val()
		let val4 = $('#citylist :selected').val()
		let val5 = $('#districtlist :selected').val()
		let val6 = $('#villagelist :selected').val()
		
		let submit1 = $(this).data('value')
		let address_id = $('input#address_id').val()

		list_vals.push(val1);
		list_vals.push(val2);
		list_vals.push(val3);
		list_vals.push(val4);
		list_vals.push(val5);
		list_vals.push(val6);

		for (const res_check of list_vals){
			if (res_check == "" || res_check == undefined && submit1 != "isupdatecart"){
				if (window.location.href.includes('/proceed-checkout?ap=')) {
					continue;
				}
				ajax.jsonRpc(AlertAddresNotFill, 'call', {'async': false})
				.then(function (data) {
					$('#AlertAddresNotFill').modal('show');
					return;
				});
				break;
			}
		}

		let addAdrressUrl = `/add-address`;
		let updateAdrressUrl = `/update-address-in-cart/${address_id}`;
		let vals = {
			"label":val1,
			"street":val2,
			"state":val3,
			"city":val4,
			"district":val5,
			"village":val6,
			"zip":$('input#postcode').val()
		}


		// contoh ajax tanpa refresh, input like this
		$("#nameAddressCart").text(val1);

		if (submit1 == "isupdatecart"){
			ajax.jsonRpc(updateAdrressUrl, 'call', vals)
			.then(function (data) {
				// isProvincewindow.location.href = "";
				return;
			});
		};

		// new variable to store the reduced array
		const convertedParamsObject = globalParams.reduce((result, item) => {
			const key = Object.keys(item)[0];
			result[key] = item[key];
			return result;
		}, {});

		addrValsInOrder = {
			"label": convertedParamsObject.label,
			"street": convertedParamsObject.street,
			"state": convertedParamsObject.province_id,
			"city": convertedParamsObject.city_id,
			"district": convertedParamsObject.district_id,
			"village": convertedParamsObject.village_id,
			"zip": convertedParamsObject.zip,
		}
		

		if (submit1 == "isAddAddress"){
			// new condition to adjust the vals with certain endpoint  
			if (window.location.href.includes('/proceed-checkout?ap=')) {
				ajax.jsonRpc(addAdrressUrl, 'call', addrValsInOrder)
				.then(function (data) {
					window.location.href = "";
					return;
				});
			}
			ajax.jsonRpc(addAdrressUrl, 'call', vals)
			.then(function (data) {
				window.location.href = "";
				return;
			});
		}
	});
	
	// new two jquery call to handle the label
	// and street form in the checkout page
	$('#labelAlamatCheckout').on('change', function() {
		var getLabel = $(this).val();
		var params = {'label': getLabel};

		globalParams.push(params);
	
	});
	
	$('#detailAlamatCheckout').on('change', function() {
		var getStreet = $(this).val();
		var params = {'street': getStreet};

		globalParams.push(params);
	
	});
	
	$select_isProvince.on('change', function() {
		var getProvince = $(this).val();
		var params = {'province_id': getProvince};

		globalParams.push(params);
		var cityUrl = "/city";
	
		$select_isCity.empty();
		$select_isDistrict.empty();
		$select_isVillage.empty();
		$('input#postcode').val('');
	
		ajax.jsonRpc(cityUrl, 'call', params, {'async': false})
			.then(function (data) {
				var conv_data = JSON.parse(data);
				for (const [key, value] of Object.entries(conv_data["city"])) {
					$select_isCity.append('<option value=' + value.id + '>' + value.name + '</option>');
				}
				$select_isCity.trigger('change');
			});
	});
	
	$select_isCity.on('change', function() {
		var getCity = $(this).val();
		var params = {'city_id': getCity};

		globalParams.push(params);
		var districtUrl = "/district";

		$select_isDistrict.empty();
		$select_isVillage.empty();
		$('input#postcode').val('');
	
		ajax.jsonRpc(districtUrl, 'call', params, {'async': false})
			.then(function (data) {
				var conv_data = JSON.parse(data);
				for (const [key, value] of Object.entries(conv_data["district"])) {
					$select_isDistrict.append('<option value=' + value.id + '>' + value.name + '</option>');
				}
				$select_isVillage.empty();
			});
	});
	
	$select_isDistrict.on('change', function() {
		var getDistrict = $(this).val();
		var params = {'district_id': getDistrict};

		globalParams.push(params);
		var villageUrl = "/village";
	
		$select_isVillage.empty();
		$('input#postcode').val('');
	
		ajax.jsonRpc(villageUrl, 'call', params, {'async': false})
			.then(function (data) {
				var conv_data = JSON.parse(data);
				for (const [key, value] of Object.entries(conv_data["village"])) {
					$select_isVillage.append('<option value=' + value.id + '>' + value.name + '</option>');
				}
			});
	});

	$select_isVillage.on('change', function() {
		var getVillage = $(this).val();
		var params = {'village_id': getVillage};
	  
		globalParams.push(params);
		var postcodeUrl = "/postcode";
	  
		// new condition to differentiate the endpoint
		if (window.location.href.indexOf("/proceed-checkout?ap") > -1) {
		  $('input#postcodeCheckout').val('');
		} else {
		  $('input#postcode').val('');
		}
	  
		ajax.jsonRpc(postcodeUrl, 'call', params, {'async': false})
		  .then(function (data) {
			var conv_data = JSON.parse(data);
			// new condition to differentiate the endpoint and
			// push the retrieved values to globalparam
			if (window.location.href.indexOf("/proceed-checkout?ap") > -1) {
			  $('input#postcodeCheckout').val(conv_data["village_postcode"]);
			  globalParams.push({'zip': conv_data["village_postcode"]})
			} else {
			  $('input#postcode').val(conv_data["village_postcode"]);
			}
		  });
	  });
	  
	
	// searchOrderDate.on('keyup', function (e) {
	//   isProvince.change(function (e) {
	//     console.log("MASIUK");
	//     // let searchValue = $(this).val();

	//     // window.location.href = url;
			
	// }); 


	// document.getElementById("fname").onchange = function() {myFunction()};

	// function myFunction() {
	//   var x = document.getElementById("fname");
	//   x.value = x.value.toLowerCase();
	// }
});
