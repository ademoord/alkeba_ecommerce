odoo.define('theme_alkeba.cart', function (require) {
    'use strict';

    let ajax = require('web.ajax');
    let session = require('web.session');
    
    let currencySettings = {style: 'currency', currency: 'IDR'};
    let plusMinusCounter = 0;
    let globalGrandTotalInt = 0;
    // var locationNames;

    // fetch('/get-warehouse-list', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({})
    // }).then(response => response.json()).then(data => {
    //     const responseData = JSON.parse(data.result);
    //     locationNames = responseData.warehouse_list;
    //     console.log(locationNames);
    //     console.log(typeof(locationNames));
    //     console.log(Array.isArray(locationNames));
    // });

    // ajax.jsonRpc("get-warehouse-list", 'call', {}).then(function (data) {
    //     let resData = JSON.parse(data);
    //     if (resData.result === 200) {
    //         for (let i = 0; i < resData.warehouse_list.length; i++) {
    //             locationNames.push(resData.warehouse_list[i]);
    //         }
    //     }
    // });

    let getUrlParameter = function getUrlParameter(sParam) {
        let sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

    function checkCheatingOngkir() {
        const bandungHiddenText = $('p#courierPriceLocHiddenBandung').text();
        const bandungText = $('p#courierPriceLocBandung').text();
        const jakartaHiddenText = $('p#courierPriceLocHiddenJakarta').text();
        const jakartaText = $('p#courierPriceLocJakarta').text();
        const surabayaHiddenText = $('p#courierPriceLocHiddenSurabaya').text();
        const surabayaText = $('p#courierPriceLocSurabaya').text();
    
        if (
            (bandungHiddenText !== bandungText) ||
            (jakartaHiddenText !== jakartaText) ||
            (surabayaHiddenText !== surabayaText)
        ) {
            // showModal('Anda Melakukan Cheating!');
            return true
        } else {
            return false
        }
    }

    let getWarehouseList = function getWarehouseList() {
        let getWarehouse = "get-warehouse-list";
        let dummyParams = {};
        
        // ajax.jsonRpc(getWarehouse, 'call', dummyParams).then(function (data) {
        //     let resData = JSON.parse(data);
        //     if (resData.result === 200) {
        //         for (let i = 0; i < resData.warehouse_list.length; i++) {
        //             locationNames.push(resData.warehouse_list[i]);
        //         }
        //     }
        // });

        fetch(getWarehouse, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dummyParams)
        }).then(response => response.json()).then(data => {
            const responseData = JSON.parse(data.result);
            locationNames = responseData.warehouse_list;
            // return locationNames;
            // console.log(locationNames);
            // console.log(typeof(locationNames));
            // console.log(Array.isArray(locationNames));
        });

    }

    function copyTextToClipboard() {
        let textToCopy = document.getElementById('cartVANumber').textContent;
        let tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        
        showModal('Nomor Virtual Account Berhasil Disalin');
    }
    
    function showModal(message) {
        let modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-dialog" style="margin-top: 300px;">
                <div class="modal-content">
                    <div class="modal-body text-center p-4">
                        <p>
                            <a href="#">
                                <img src="/theme_alkeba/static/src/images/icon/successful.png" style="width:35px"/>
                            </a>
                            <br/>
                            <strong>
                                ${message}<br/> 
                            </strong>
                        </p>
                    </div>
                </div>
                </div>
                `;
        
        document.body.appendChild(modal);
        
        $(modal).modal('show');
    }
    
    let copyButton = document.getElementById('copyVAButton');
    // copyButton.addEventListener('click', copyTextToClipboard);
    
    $('input#CheckboxPoint').on('click', function () {
        var newData = '<br/><div id="infoOrderUsingPoint"><b>Belanja Dengan Point Aktif</b></div>';
        var pointActive = $('#CheckboxPoint');
        var isTotalPrice = $('p#totalPrice');
        var isGrandTotal = $('p#grandTotal');
        var text = isTotalPrice.text();
        var grandTotalInt;
        let totalPriceInt = 0;
        
        var isCurrentPoint = parseInt($('span#CurrentPoint').text().replace("Poin", '').trim());
        if (pointActive.is(':checked')) {
            if (isCurrentPoint === 0) {
                ajax.jsonRpc(AlertPointless, 'call', {'async': false}).then(function (data) {
                    $('#AlertPointless').modal('show');
                });
                pointActive.prop('checked', false);
            } else {
                if (plusMinusCounter === 0) { 
                    var grandTotalInt = parseFloat(isTotalPrice.text().replace(/[^\d,.]/g, '').replace(/,/g, ''));
                    var nominalPointInt = isCurrentPoint * 1000;
                    var calculationTotal = grandTotalInt - nominalPointInt;
                    isGrandTotal.text(calculationTotal.toLocaleString('id-ID', currencySettings));
                } else {
                    if (text.includes(",00")) {
                        text = text.replace(",00", "");
                        text = text.replace(/[^\d,]/g, '').replace(/,/g, '');
                        grandTotalInt = parseFloat(text);
                    } else if (text.includes(".00")) {
                        text = text.replace(".00", "");
                        text = text.replace(/[^\d,]/g, '').replace(/,/g, '');
                        grandTotalInt = parseFloat(text);
                    } else {
                        grandTotalInt = 0;
                    }
                    var nominalPointInt = isCurrentPoint * 1000;
                    var calculationTotal = grandTotalInt - nominalPointInt;
                    isGrandTotal.text(calculationTotal.toLocaleString('id-ID', currencySettings));
                }
            }
            $('#totalOrder').after(newData);
        } else {
            if (text.includes(",00")) {
                text = text.replace(",00", "");
                text = text.replace(/[^\d,]/g, '').replace(/,/g, '');
                totalPriceInt = parseFloat(text);
            } else if (text.includes(".00")) {
                text = text.replace(".00", "");
                text = text.replace(/[^\d,]/g, '').replace(/,/g, '');
                totalPriceInt = parseFloat(text);
            } else {
                totalPriceInt = 0;
            }
            if (plusMinusCounter === 0) {
                isGrandTotal.text(totalPriceInt.toLocaleString('id-ID', currencySettings));
            } else {
                var grandTotalInt = parseFloat(isTotalPrice.text().replace(/[^\d,.]/g, '').replace(/,/g, ''));
                isGrandTotal.text(totalPriceInt.toLocaleString('id-ID', currencySettings));
            }
            $('#infoOrderUsingPoint').remove();
        }
    });
    
    $('button#addProductToCart').on('click', function () {
        let url = window.location;
        let urlPathList = url.pathname.split('/')
        let productSlug;
        let selectedWarehouse = $('#dropdownMenuButtonWarehouse').val();
        
        if (session.user_id === false || session.user_id === null) {
            // window.location.href = '/web/login';
            // return;
            ajax.jsonRpc(AlertCartNotLogin, 'call', {'async': false})
            .then(function (data) {
                $('#AlertCartNotLogin').modal('show');
                return;
            });
        };

        if (selectedWarehouse === "") {
            ajax.jsonRpc(AlertWarehouseNotSelected, 'call', {'async': false})
            .then(function (data) {
                $('#AlertWarehouseNotSelected').modal('show');
                return;
            });
        } else {
            if (urlPathList[1] === 'product' && urlPathList.length === 3) {
                productSlug = urlPathList[2];
            }
            let getProductDetailUrl = "/json-product/" + productSlug;
    
            ajax.jsonRpc(getProductDetailUrl, 'call', {}, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
    
                    let location = $('a.warehouse-loc.active');
                    let quantity = $('input#quantity').val();
                    let locationId = location.data('loc');
                    let locationStockCount = location.data('qty');
    
                    if (locationId === undefined) {
                        $('#qtyStockEmptyModal').modal('show');
                        return;
                    }
    
                    if (parseFloat(quantity) > locationStockCount) {
                        $('#qtyExceedingStockModal').modal('show');
                        return;
                    }
    
                    let addToCartUrl = '/add-to-cart';
                    let params = {
                        'product_id': resData.id,
                        'quantity': parseFloat(quantity),
                        'location': locationId,
                    };
                    ajax.jsonRpc(addToCartUrl, 'call', params, {'async': false})
                        .then(function (data) {
                            let response = JSON.parse(data);
                            if (response.status === 200) {
                                $('#addToCartModal').modal('show');
                            }
                            return;
                        });
                });
            return false;   
        }
    });

    $('button.deleteAllCart').on('click', function () {
        $('#deleteAllCartModal').modal('show');
    });

    $('a.delete-product').on('click', function () {
        let productId = $(this).data('id');
        let locationId = $(this).data('loc');
        let params = {'product_id': productId, 'location_id': locationId}
        let removeUrl = "/remove-from-cart";

        ajax.jsonRpc(removeUrl, 'call', params, {'async': false})
            .then(function (data) {
                let resData = JSON.parse(data);
                if (resData.status === 200) {
                    $('#removeFromCartModal').modal('show');
                    setTimeout(location.reload.bind(location), 1000);
                }
                return;
            });
    });

    $('input.product-line-qty').on('change keyup mouseup', function () {
        plusMinusCounter++;
        var isTotalPrice = $('p#totalPrice');
        var productId = $(this).data('id');
        var locationId = $(this).data('loc');
        var locationName = $(this).data('locname');
        var quantity = $(this).val();
        var productUnitPrice = $('#productUnitPrice_' + productId + '_' + locationId);
        var productSubtotal = $('#productSubtotal_' + productId + '_' + locationName);
        var totalPrice = $('#totalPrice');
        var grandTotal = $('p#grandTotal');
        
        var params = {'product_id': productId, 'location_id': locationId, 'quantity': quantity};
        var minusUrl = "/pm-product-quantity";
        var locSubTotal = $('#subTots' + locationName);

        ajax.jsonRpc(minusUrl, 'call', params, {'async': false}).then(function (data) {
            var resData = JSON.parse(data);
            if (resData.status === 200) {
                productUnitPrice.text(resData.product.price.toLocaleString('id-ID', currencySettings));
                productSubtotal.text(resData.product.subtotal.toLocaleString('id-ID', currencySettings));
                locSubTotal.text(resData.product.subtotal.toLocaleString('id-ID', currencySettings));
                totalPrice.text(resData.subtotal.toLocaleString('id-ID', currencySettings));
                grandTotal.text(resData.subtotal.toLocaleString('id-ID', currencySettings));
            }
        });
    });

    $('a.save-notes').on('click', function () {
        let productId = $(this).data('id');
        let locationId = $(this).data('loc');
        let notes = $('#notes_' + productId + '_' + locationId).val();
        let params = {'product_id': productId, 'location_id': locationId, 'notes': notes}
        let changeNotesUrl = "/change-notes";

        ajax.jsonRpc(changeNotesUrl, 'call', params, {'async': false})
            .then(function (data) {
                return;
            });
    });

    $('[id^=zanana_]').change(function () {
        let productId = $(this).data('id');
        let locationId = $(this).data('loc');
        let totalPrice = $('#totalPrice');
        let grandTotal = $('#grandTotal');
        let isChecked = false;

        if ($(this).is(':checked')) {
            isChecked = true;
        }

        let params = {'product_id': productId, 'location_id': locationId, 'is_checked': isChecked}
        let checkProductUrl = "/check-product";
        ajax.jsonRpc(checkProductUrl, 'call', params, {'async': false})
            .then(function (data) {
                let resData = JSON.parse(data);

                $('select#pilihPromoGift').empty();
                for (const [key, value] of Object.entries(resData.promo_gift)) {
                    $('select#pilihPromoGift').append('<option value=' + value.code_promo + '>' + value.name + '</option>');
                }

                if (resData.status === 200) {
                    totalPrice.text(resData.subtotal.toLocaleString('id-ID', currencySettings));
                    grandTotal.text(resData.subtotal.toLocaleString('id-ID', currencySettings));
                }
                return;
            });
    });

    $('[id^=checkAll_]').change(function () {
        let locationId = $(this).data('loc');
        let locationIdStr = "input[type='checkbox'][id$=_" + locationId + "]";
        let totalPrice = $('#totalPrice');
        let grandTotal = $('#grandTotal');
        let productLines = $(locationIdStr);

        let params = {'products': []};
        let checkProductsUrl = "/check-products";

        productLines.each(function (line) {
            if (line !== 0) {
                let productId = $(productLines[line]).data('id');
                let locationId = $(productLines[line]).data('loc');

                if ($(productLines[line]).is(':checked')) {
                    params['products'].push({'product_id': productId, 'location_id': locationId, 'is_checked': true})
                } else {
                    params['products'].push({'product_id': productId, 'location_id': locationId, 'is_checked': false})
                }
            }
        });

        ajax.jsonRpc(checkProductsUrl, 'call', params, {'async': false})
            .then(function (data) {
                let resData = JSON.parse(data);

                $('select#pilihPromoGift').empty();
                for (const [key, value] of Object.entries(resData.promo_gift)) {
                    $('select#pilihPromoGift').append('<option value=' + value.code_promo + '>' + value.name + '</option>');
                }

                if (resData.status === 200) {
                    totalPrice.text(resData.subtotal.toLocaleString('id-ID', currencySettings));
                    grandTotal.text(resData.subtotal.toLocaleString('id-ID', currencySettings));
                }
                return;
            });
    });

    $('button.delete-all').on('click', function () {
        let text = "Anda Yakin Hapus Semua Keranjang Anda ?";
        if (confirm(text) == true) {
            let locationId = $(this).data('loc');
            let locationIdStr = "input[type='checkbox'][id$=_" + locationId + "]";
            let productLines = $(locationIdStr);

            let params = {'products': []};
            let bulkRemoveFromCartsUrl = "/bulk-remove-from-cart";
            productLines.each(function (line) {
                if (line !== 0) {
                    let productId = $(productLines[line]).data('id');
                    let locationId = $(productLines[line]).data('loc');

                    if ($(productLines[line]).is(':checked')) {
                        params['products'].push({'product_id': productId, 'location_id': locationId, 'is_checked': true})
                    } else {
                        params['products'].push({'product_id': productId, 'location_id': locationId, 'is_checked': false})
                    }
                }
            });

            ajax.jsonRpc(bulkRemoveFromCartsUrl, 'call', params, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
                    if (resData.status === 200) {
                        $('#removeFromCartModal').modal('show');
                        setTimeout(location.reload.bind(location), 1000);
                    }
                    return;
                });
        } else {
            return;
        }
    });

    // START OF MULTIPLE COURIER SELECTION HANDLER
    // Arranged by Andromeda
    $(document).ready(function () {
        // Static location array. Only used when
        // the one from the API not worked 
        const locationNames = ['Bandung', 'Jakarta', 'Surabaya'];

        // Dynamic location array.
        // Please fix this one sooner.
        // if (locationNames === undefined) {
        //     getWarehouseList();
        // }

        // Using native for loop
        for (let i = 0; i < locationNames.length; i++) {
            const location = locationNames[i];
            console.log(location);
            const selectElement = $('#selectCourier' + location);
        
            selectElement.on('change', function () {
                // debugger;
                // console.log(locationNames);
                let selectedOption = $(this).find('option:selected');
                let locationId = selectedOption.attr('data-loc-id');
                let courier = selectedOption.attr('data-courier');
                let courierId = selectedOption.attr('data-courier-id');
                let currentTotalPrice = $('#totalPrice');
                let totalCourierPrice = 0;
        
                let courierNameLoc = $('p#courierNameLoc' + location);
                let courierPriceLoc = $('p#courierPriceLoc' + location);
                let courierPriceLocHidden = $('p#courierPriceLocHidden' + location);
                let grandTotalEl = $('#grandTotal');
                let grandTotalInt;
                let checkShippingPrice = '/check-shipping-price';
                let checkLionParcelTariff = '/alkeba/lionparcel/tariff';
                let params = {};
        
                if (locationId !== undefined && courierId !== undefined) {
                    params['location_id'] = locationId;
                    params['courier_id'] = courierId;
                }
        
                if (Object.keys(params).length === 0) {
                    courierNameLoc.text('Kurir Belum Dipilih');
                    courierPriceLoc.text('Rp 0.00');
        
                    // Calculate the total price based on location here
                    let courierPriceBandung = $('p#courierPriceLocBandung').text();
                    let courierPriceJakarta = $('p#courierPriceLocJakarta').text();
                    let courierPriceSurabaya = $('p#courierPriceLocSurabaya').text();
                    
                    let courierPriceBandungInt = parseInt(courierPriceBandung.replace(/[^0-9]/g, ''), 10);
                    let courierPriceJakartaInt = parseInt(courierPriceJakarta.replace(/[^0-9]/g, ''), 10);
                    let courierPriceSurabayaInt = parseInt(courierPriceSurabaya.replace(/[^0-9]/g, ''), 10);
                    let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
                    
                    let totalSum = courierPriceBandungInt + courierPriceJakartaInt + courierPriceSurabayaInt + currentTotalPriceInt;
                    let fixedTotalSum = totalSum / 100;
                    let formattedTotalSum = `Rp ${fixedTotalSum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    
                    grandTotalEl.text(formattedTotalSum);
                    return;
                }
        
                if (courier === "Lion Parcel") {
                    $('#selectLionParcelServiceType' + location).show();
                    courierNameLoc.text('Lion Parcel');
                    let lionSelect = $('#selectLionParcelServiceType' + location);
                    ajax.jsonRpc(checkLionParcelTariff, 'call', params, { 'async': false })
                        .then(function (data) {
                            let resData = JSON.parse(data);
                            if (resData.result === 200) {
                                lionSelect.empty();
        
                                // Automatically fill the service options with the parsed JSON
                                let tariffResult = resData.tariff_result;
                                for (let i = 0; i < tariffResult.length; i++) {
                                    let service = tariffResult[i];
                                    if (service.product && service.total_tariff && service.estimasi_sla) {
                                        let optionText = `${service.product}: Rp ${service.total_tariff} (Estimasi: ${service.estimasi_sla})`;
                                        const option = $('<option>', {
                                            value: service.product,
                                            text: optionText
                                        });
        
                                        lionSelect.append(option);
        
                                        if (i === 0) {
                                            option.prop('selected', true);
                                            let price = service.total_tariff;
        
                                            let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
                                            let addedLionPrice = price + currentTotalPriceInt / 100;
        
                                            let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                            let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
                                            courierPriceLoc.text(formattedCourierPrice);
                                            courierPriceLocHidden.text(formattedCourierPrice);
                                            grandTotalEl.text(formattedGrandTotal);
                                        }
                                    }
                                }
        
                                // LionParcel change handler
                                lionSelect.on('change', function () {
                                    let selectedService = $(this).find('option:selected');
                                    let serviceName = selectedService.val();
        
                                    for (let i = 0; i < tariffResult.length; i++) {
                                        let service = tariffResult[i];
                                        if (serviceName === service.product) {
                                            let price = service.total_tariff;
        
                                            let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
                                            let addedLionPrice = price + currentTotalPriceInt / 100;
        
                                            let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                            let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
                                            courierPriceLoc.text(formattedCourierPrice);
                                            courierPriceLocHidden.text(formattedCourierPrice);
                                            grandTotalEl.text(formattedGrandTotal);
                                        }
                                    }
        
                                    totalCourierPrice = 0;
                                    locationNames.forEach(function (locationName) {
                                        let courierPriceLocId = '#courierPriceLoc' + locationName;
                                        let courierPriceText = $(courierPriceLocId).text();
                                        let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
        
                                        if (isNaN(courierPriceValue)) {
                                            totalCourierPrice += 0;
                                        } else {
                                            totalCourierPrice += courierPriceValue;
                                        }
                                    });
        
                                    let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));
                                    let finalSubtotal = grandSubTotal + totalCourierPrice;
                                    let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
                                    grandTotalEl.text(formattedFinalSubtotal);
                                    return;
                                });
                            }
                        });
                } else {
                    $('#selectLionParcelServiceType' + location).hide();
                    ajax.jsonRpc(checkShippingPrice, 'call', params, { 'async': false })
                        .then(function (data) {
                            let resData = JSON.parse(data);
                            if (resData.result === 200) {
                                let courierName;
                                let price = 0;
                                let grandTotal = resData.order_summary.grand_total.toLocaleString('id-ID', currencySettings);
                                grandTotalInt = parseFloat(grandTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
                                let shippingPerLocation = resData.order_summary.shipping_price_per_location;
        
                                for (let i = 0; i < shippingPerLocation.length; i++) {
                                    if (shippingPerLocation[i].area_name === location) {
                                        courierName = courier;
                                        price = shippingPerLocation[i].price;
                                        grandTotalInt += price;
                                    }
                                }
        
                                let formattedGrandTotal = `Rp ${grandTotalInt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                courierNameLoc.text(courierName);
                                courierPriceLoc.text(formattedCourierPrice);
                                courierPriceLocHidden.text(formattedCourierPrice);
                                grandTotalEl.text(formattedGrandTotal);
                            }
        
                            locationNames.forEach(function (name) {
                                let courierPriceLocId = '#courierPriceLoc' + name;
                                let courierPriceText = $(courierPriceLocId).text();
                                let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
        
                                if (isNaN(courierPriceValue)) {
                                    totalCourierPrice += 0;
                                } else {
                                    totalCourierPrice += courierPriceValue;
                                }
                            });
        
                            let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));
                            let finalSubtotal = grandSubTotal + totalCourierPrice;
                            let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
                            grandTotalEl.text(formattedFinalSubtotal);
                            return;
                        });
                }
            });
        }

        // Using forEach loop
        // locationNames.forEach(location => {
        //     const selectElement = $('#selectCourier' + location);
        
        //     selectElement.on('change', function () {
        //         let selectedOption = $(this).find('option:selected');
        //         let locationId = selectedOption.attr('data-loc-id');
        //         let courier = selectedOption.attr('data-courier');
        //         let courierId = selectedOption.attr('data-courier-id');
        //         let currentTotalPrice = $('#totalPrice');
        //         let totalCourierPrice = 0;
        
        //         let courierNameLoc = $('p#courierNameLoc' + location);
        //         let courierPriceLoc = $('p#courierPriceLoc' + location);
        //         let courierPriceLocHidden = $('p#courierPriceLocHidden' + location);
        //         let grandTotalEl = $('#grandTotal');
        //         let grandTotalInt;
        //         let checkShippingPrice = '/check-shipping-price';
        //         let checkLionParcelTariff = '/alkeba/lionparcel/tariff';
        //         let params = {};
        
        //         if (locationId !== undefined && courierId !== undefined) {
        //             params['location_id'] = locationId;
        //             params['courier_id'] = courierId;
        //         }
        
        //         if (Object.keys(params).length === 0) {
        //             courierNameLoc.text('Kurir Belum Dipilih');
        //             courierPriceLoc.text('Rp 0.00');
        
        //             // Calculate the total price based on location here
        //             let courierPriceBandung = $('p#courierPriceLocBandung').text();
        //             let courierPriceJakarta = $('p#courierPriceLocJakarta').text();
        //             let courierPriceSurabaya = $('p#courierPriceLocSurabaya').text();
                    
        //             let courierPriceBandungInt = parseInt(courierPriceBandung.replace(/[^0-9]/g, ''), 10);
        //             let courierPriceJakartaInt = parseInt(courierPriceJakarta.replace(/[^0-9]/g, ''), 10);
        //             let courierPriceSurabayaInt = parseInt(courierPriceSurabaya.replace(/[^0-9]/g, ''), 10);
        //             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
                    
        //             let totalSum = courierPriceBandungInt + courierPriceJakartaInt + courierPriceSurabayaInt + currentTotalPriceInt;
        //             let fixedTotalSum = totalSum / 100;
        //             let formattedTotalSum = `Rp ${fixedTotalSum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    
        //             grandTotalEl.text(formattedTotalSum);
        //             return;
        //         }
        
        //         if (courier === "Lion Parcel") {
        //             $('#selectLionParcelServiceType' + location).show();
        //             courierNameLoc.text('Lion Parcel');
        //             let lionSelect = $('#selectLionParcelServiceType' + location);
        //             ajax.jsonRpc(checkLionParcelTariff, 'call', params, { 'async': false })
        //                 .then(function (data) {
        //                     let resData = JSON.parse(data);
        //                     if (resData.result === 200) {
        //                         lionSelect.empty();
        
        //                         // Automatically fill the service options with the parsed JSON
        //                         let tariffResult = resData.tariff_result;
        //                         for (let i = 0; i < tariffResult.length; i++) {
        //                             let service = tariffResult[i];
        //                             if (service.product && service.total_tariff && service.estimasi_sla) {
        //                                 let optionText = `${service.product}: Rp ${service.total_tariff} (Estimasi: ${service.estimasi_sla})`;
        //                                 const option = $('<option>', {
        //                                     value: service.product,
        //                                     text: optionText
        //                                 });
        
        //                                 lionSelect.append(option);
        
        //                                 if (i === 0) {
        //                                     option.prop('selected', true);
        //                                     let price = service.total_tariff;
        
        //                                     let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
        //                                     let addedLionPrice = price + currentTotalPriceInt / 100;
        
        //                                     let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        //                                     let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        //                                     courierPriceLoc.text(formattedCourierPrice);
        //                                     courierPriceLocHidden.text(formattedCourierPrice);
        //                                     grandTotalEl.text(formattedGrandTotal);
        //                                 }
        //                             }
        //                         }
        
        //                         // LionParcel change handler
        //                         lionSelect.on('change', function () {
        //                             let selectedService = $(this).find('option:selected');
        //                             let serviceName = selectedService.val();
        
        //                             for (let i = 0; i < tariffResult.length; i++) {
        //                                 let service = tariffResult[i];
        //                                 if (serviceName === service.product) {
        //                                     let price = service.total_tariff;
        
        //                                     let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
        //                                     let addedLionPrice = price + currentTotalPriceInt / 100;
        
        //                                     let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        //                                     let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        //                                     courierPriceLoc.text(formattedCourierPrice);
        //                                     courierPriceLocHidden.text(formattedCourierPrice);
        //                                     grandTotalEl.text(formattedGrandTotal);
        //                                 }
        //                             }
        
        //                             totalCourierPrice = 0;
        //                             locationNames.forEach(name => {
        //                                 let courierPriceLocId = '#courierPriceLoc' + name;
        //                                 let courierPriceText = $(courierPriceLocId).text();
        //                                 let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
        
        //                                 if (isNaN(courierPriceValue)) {
        //                                     totalCourierPrice += 0;
        //                                 } else {
        //                                     totalCourierPrice += courierPriceValue;
        //                                 }
        //                             });
        
        //                             let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));
        //                             let finalSubtotal = grandSubTotal + totalCourierPrice;
        //                             let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        //                             grandTotalEl.text(formattedFinalSubtotal);
        //                             return;
        //                         });
        //                     }
        //                 });
        //         } else {
        //             $('#selectLionParcelServiceType' + location).hide();
        //             ajax.jsonRpc(checkShippingPrice, 'call', params, { 'async': false })
        //                 .then(function (data) {
        //                     let resData = JSON.parse(data);
        //                     if (resData.result === 200) {
        //                         let courierName;
        //                         let price = 0;
        //                         let grandTotal = resData.order_summary.grand_total.toLocaleString('id-ID', currencySettings);
        //                         grandTotalInt = parseFloat(grandTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
        //                         let shippingPerLocation = resData.order_summary.shipping_price_per_location;
        
        //                         for (let i = 0; i < shippingPerLocation.length; i++) {
        //                             if (shippingPerLocation[i].area_name === location) {
        //                                 courierName = courier;
        //                                 price = shippingPerLocation[i].price;
        //                                 grandTotalInt += price;
        //                             }
        //                         }
        
        //                         let formattedGrandTotal = `Rp ${grandTotalInt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        //                         let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        //                         courierNameLoc.text(courierName);
        //                         courierPriceLoc.text(formattedCourierPrice);
        //                         courierPriceLocHidden.text(formattedCourierPrice);
        //                         grandTotalEl.text(formattedGrandTotal);
        //                     }
        
        //                     locationNames.forEach(name => {
        //                         let courierPriceLocId = '#courierPriceLoc' + name;
        //                         let courierPriceText = $(courierPriceLocId).text();
        //                         let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
        
        //                         if (isNaN(courierPriceValue)) {
        //                             totalCourierPrice += 0;
        //                         } else {
        //                             totalCourierPrice += courierPriceValue;
        //                         }
        //                     });
        
        //                     let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));
        //                     let finalSubtotal = grandSubTotal + totalCourierPrice;
        //                     let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        //                     grandTotalEl.text(formattedFinalSubtotal);
        //                     return;
        //                 });
        //         }
        //     });
        // });
    });
    // END OF MULTIPLE COURIER SELECTION HANDLER

    // -=-=-=-= START OF STATIC JQUERY COURIER DROPDOWN HANDLER PER LOC =-=-=-=- 
    // -=-=-=-= TEMPORARILY HIDDEN BY ANDROMEDA =-=-=-=- 
    // Courier dropdown change handler for Bandung location
    // $('#selectCourierBandung').on('change', function () {
    //     let selectedOption = $(this).find('option:selected');
    //     let locationId = selectedOption.attr('data-loc-id');
    //     let courier = selectedOption.attr('data-courier');
    //     let courierId = selectedOption.attr('data-courier-id');
    //     let currentTotalPrice = $('#totalPrice');
    //     let totalCourierPrice;
        
    //     let courierNameLoc = $('p#courierNameLocBandung');
    //     let courierPriceLoc = $('p#courierPriceLocBandung');
    //     let courierPriceLocHidden = $('p#courierPriceLocHiddenBandung');
    //     let grandTotalEl = $('#grandTotal');
    //     let grandTotalInt;
    //     let checkShippingPrice = '/check-shipping-price';
    //     let checkLionParcelTariff = '/alkeba/lionparcel/tariff';
    //     let params = {};
        
    //     if (locationId !== undefined && courierId !== undefined) {
    //         params['location_id'] = locationId;
    //         params['courier_id'] = courierId;
    //     }
        
    //     if (Object.keys(params).length === 0) {
    //         // reset the current one    
    //         courierNameLoc.text('Kurir Belum Dipilih');
    //         courierPriceLoc.text('Rp 0.00');

    //         let courierPriceJakarta = $('p#courierPriceLocJakarta').text();
    //         let courierPriceSurabaya = $('p#courierPriceLocSurabaya').text();
            
    //         let courierPriceJakartaInt = parseInt(courierPriceJakarta.replace(/[^0-9]/g, ''), 10);
    //         let courierPriceSurabayaInt = parseInt(courierPriceSurabaya.replace(/[^0-9]/g, ''), 10);
    //         let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
            
    //         let totalSum = courierPriceJakartaInt + courierPriceSurabayaInt + currentTotalPriceInt;
    //         let fixedTotalSum = totalSum/100;
    //         let formattedTotalSum = `Rp ${fixedTotalSum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
    //         grandTotalEl.text(formattedTotalSum);
    //         return;
    //     }
        
    //     // LionParcel Handler
    //     if (courier === "Lion Parcel") {
    //         $('#selectLionParcelServiceTypeBandung').show();
    //         courierNameLoc.text('Lion Parcel')
    //         let lionSelectBDG = $('#selectLionParcelServiceTypeBandung');
    //         ajax.jsonRpc(checkLionParcelTariff, 'call', params, {'async': false})
    //         .then(function (data) {
    //             let resData = JSON.parse(data);
    //             if (resData.result === 200) {
    //                 lionSelectBDG.empty();                 

    //                 // Automatically fill the service option with the parsed JSON  
    //                 let tariffResult = resData.tariff_result;
    //                 for (let i = 0; i < tariffResult.length; i++) {
    //                     let service = tariffResult[i];
    //                     if (service.product && service.total_tariff && service.estimasi_sla) {
    //                         let optionText = `${service.product}: Rp ${service.total_tariff} (Estimasi: ${service.estimasi_sla})`;
    //                         const option = $('<option>', {
    //                             value: service.product,
    //                             text: optionText
    //                         });

    //                         lionSelectBDG.append(option);

    //                         if (i === 0) {
    //                             option.prop('selected', true);
    //                             let price = service.total_tariff;
                                
    //                             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
    //                             let addedLionPrice = price + currentTotalPriceInt/100
                                
    //                             let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                             let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //                             courierPriceLoc.text(formattedCourierPrice);
    //                             courierPriceLocHidden.text(formattedCourierPrice);
    //                             grandTotalEl.text(formattedGrandTotal);
    //                         }
    //                     }
    //                 }
                    
    //                 // LionParcel change handler 
    //                 lionSelectBDG.on('change', function () {
    //                     let selectedService = $(this).find('option:selected');
    //                     let serviceName = selectedService.val();
                        
    //                     for (let i = 0; i < tariffResult.length; i++) {
    //                         let service = tariffResult[i];
    //                         // Confirm selected type of service
    //                         if (serviceName === service.product) {
    //                             let price = service.total_tariff;
                                
    //                             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
    //                             let addedLionPrice = price + currentTotalPriceInt/100
                                
    //                             let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                             let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //                             courierPriceLoc.text(formattedCourierPrice);
    //                             courierPriceLocHidden.text(formattedCourierPrice);
    //                             grandTotalEl.text(formattedGrandTotal);
    //                         }
    //                     }

    //                     totalCourierPrice = 0;
    //                     locationNames.forEach(function(locationName) {
    //                         let courierPriceLocId = '#courierPriceLoc' + locationName;
    //                         let courierPriceText = $(courierPriceLocId).text();
    //                         let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
                            
    //                         // Handle only two WH
    //                         if (isNaN(courierPriceValue)) {
    //                             totalCourierPrice += 0;    
    //                         } else {
    //                             totalCourierPrice += courierPriceValue;
    //                         }
    //                     });
        
    //                     let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));           
    //                     let finalSubtotal = grandSubTotal+totalCourierPrice;
    //                     let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
    //                     grandTotalEl.text(formattedFinalSubtotal);
    //                     return;
    //                 });
    //             }
    //         });

    //     // Another expedition Handler
    //     } else {
    //         $('#selectLionParcelServiceTypeBandung').hide();
    //         ajax.jsonRpc(checkShippingPrice, 'call', params, {'async': false})
    //         .then(function (data) {
    //             let resData = JSON.parse(data);
    //             if (resData.result === 200) {
    //                 let courierName;
    //                 let price = 0;
    //                 let grandTotal = resData.order_summary.grand_total.toLocaleString('id-ID', currencySettings);
    //                 grandTotalInt = parseFloat(grandTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
    //                 let shippingPerLocation = resData.order_summary.shipping_price_per_location;
    
    //                 for (let i = 0; i < shippingPerLocation.length; i++) {
    //                     if (shippingPerLocation[i].area_name === 'Bandung') {
    //                         courierName = courier;
    //                         price = shippingPerLocation[i].price;
    //                         grandTotalInt += price;
    //                     }
    //                 }
    //                 let formattedGrandTotal = `Rp ${grandTotalInt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                 let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                 courierNameLoc.text(courierName);
    //                 courierPriceLoc.text(formattedCourierPrice);
    //                 courierPriceLocHidden.text(formattedCourierPrice);
    //                 grandTotalEl.text(formattedGrandTotal);
    //             }
    
    //             totalCourierPrice = 0;
    //             locationNames.forEach(function(locationName) {
    //                 let courierPriceLocId = '#courierPriceLoc' + locationName;
    //                 let courierPriceText = $(courierPriceLocId).text();
    //                 let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
    
    //                 // handle only two WH
    //                 if (isNaN(courierPriceValue)) {
    //                     totalCourierPrice += 0;    
    //                 } else {
    //                     totalCourierPrice += courierPriceValue;
    //                 }
    
    //             });
    
    //             let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));           
    //             let finalSubtotal = grandSubTotal+totalCourierPrice;
    //             let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    //             grandTotalEl.text(formattedFinalSubtotal);
    //             return;
    //         });
    //     }
    // });

    // Courier dropdown change handler for Jakarta location
    // $('#selectCourierJakarta').on('change', function () {
    //     let selectedOption = $(this).find('option:selected');
    //     let locationId = selectedOption.attr('data-loc-id');
    //     let courier = selectedOption.attr('data-courier');
    //     let courierId = selectedOption.attr('data-courier-id');
    //     let currentTotalPrice = $('#totalPrice');
    //     let totalCourierPrice = 0;
        
    //     let courierNameLoc = $('p#courierNameLocJakarta');
    //     let courierPriceLoc = $('p#courierPriceLocJakarta');
    //     let courierPriceLocHidden = $('p#courierPriceLocHiddenJakarta');
    //     let grandTotalEl = $('#grandTotal');
    //     let grandTotalInt;
    //     let checkShippingPrice = '/check-shipping-price';
    //     let checkLionParcelTariff = '/alkeba/lionparcel/tariff';
    //     let params = {};

    //     if (locationId !== undefined && courierId !== undefined) {
    //         params['location_id'] = locationId;
    //         params['courier_id'] = courierId;
    //     }
        
    //     if (Object.keys(params).length === 0) {
    //         // reset the current one    
    //         courierNameLoc.text('Kurir Belum Dipilih');
    //         courierPriceLoc.text('Rp 0.00');

    //         let courierPriceBandung = $('p#courierPriceLocBandung').text();
    //         let courierPriceSurabaya = $('p#courierPriceLocSurabaya').text();
            
    //         let courierPriceBandungInt = parseInt(courierPriceBandung.replace(/[^0-9]/g, ''), 10);
    //         let courierPriceSurabayaInt = parseInt(courierPriceSurabaya.replace(/[^0-9]/g, ''), 10);
    //         let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
            
    //         let totalSum = courierPriceBandungInt + courierPriceSurabayaInt + currentTotalPriceInt;
    //         let fixedTotalSum = totalSum/100;
    //         let formattedTotalSum = `Rp ${fixedTotalSum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
    //         grandTotalEl.text(formattedTotalSum);
    //         return;
    //     }

    //     // LionParcel Handler
    //     if (courier === "Lion Parcel") {
    //         $('#selectLionParcelServiceTypeJakarta').show();
    //         courierNameLoc.text('Lion Parcel')
    //         let lionSelectJKT = $('#selectLionParcelServiceTypeJakarta');
    //         ajax.jsonRpc(checkLionParcelTariff, 'call', params, {'async': false})
    //         .then(function (data) {
    //             let resData = JSON.parse(data);
    //             if (resData.result === 200) {
    //                 lionSelectJKT.empty();
                    
    //                 // Automatically fill the service option with the parsed JSON  
    //                 let tariffResult = resData.tariff_result;
    //                 for (let i = 0; i < tariffResult.length; i++) {
    //                     let service = tariffResult[i];
    //                     if (service.product && service.total_tariff && service.estimasi_sla) {
    //                         let optionText = `${service.product}: Rp ${service.total_tariff} (Estimasi: ${service.estimasi_sla})`;
    //                         const option = $('<option>', {
    //                             value: service.product,
    //                             text: optionText
    //                         });

    //                         lionSelectJKT.append(option);

    //                         if (i === 0) {
    //                             option.prop('selected', true);
    //                             let price = service.total_tariff;
                                
    //                             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
    //                             let addedLionPrice = price + currentTotalPriceInt/100
                                
    //                             let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                             let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //                             courierPriceLoc.text(formattedCourierPrice);
    //                             courierPriceLocHidden.text(formattedCourierPrice);
    //                             grandTotalEl.text(formattedGrandTotal);
    //                         }
    //                     }
    //                 }
                    
    //                 // LionParcel change handler 
    //                 lionSelectJKT.on('change', function () {
    //                     let selectedService = $(this).find('option:selected');
    //                     let serviceName = selectedService.val();
                        
    //                     for (let i = 0; i < tariffResult.length; i++) {
    //                         let service = tariffResult[i];
    //                         // Confirm selected type of service
    //                         if (serviceName === service.product) {
    //                             let price = service.total_tariff;
                                
    //                             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
    //                             let addedLionPrice = price + currentTotalPriceInt/100
                                
    //                             let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                             let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //                             courierPriceLoc.text(formattedCourierPrice);
    //                             courierPriceLocHidden.text(formattedCourierPrice);
    //                             grandTotalEl.text(formattedGrandTotal);
    //                         }
    //                     }

    //                     totalCourierPrice = 0;
    //                     locationNames.forEach(function(locationName) {
    //                         let courierPriceLocId = '#courierPriceLoc' + locationName;
    //                         let courierPriceText = $(courierPriceLocId).text();
    //                         let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
                            
    //                         // Handle only two WH
    //                         if (isNaN(courierPriceValue)) {
    //                             totalCourierPrice += 0;    
    //                         } else {
    //                             totalCourierPrice += courierPriceValue;
    //                         }
    //                     });
        
    //                     let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));           
    //                     let finalSubtotal = grandSubTotal+totalCourierPrice;
    //                     let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
    //                     grandTotalEl.text(formattedFinalSubtotal);
    //                     return;
    //                 });
    //             }
    //         });
            
    //     // Another expedition Handler
    //     } else {
    //         $('#selectLionParcelServiceTypeJakarta').hide();
    //         ajax.jsonRpc(checkShippingPrice, 'call', params, {'async': false})
    //             .then(function (data) {
    //                 let resData = JSON.parse(data);
    //                 if (resData.result === 200) {
    //                     let courierName;
    //                     let price = 0;
    //                     let grandTotal = resData.order_summary.grand_total.toLocaleString('id-ID', currencySettings);
    //                     grandTotalInt = parseFloat(grandTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
    //                     let shippingPerLocation = resData.order_summary.shipping_price_per_location;
    
    //                     for (let i = 0; i < shippingPerLocation.length; i++) {
    //                         if (shippingPerLocation[i].area_name === 'Jakarta') {
    //                             courierName = courier;
    //                             price = shippingPerLocation[i].price;
    //                             grandTotalInt += price;
    //                         }
    //                     }
    //                     let formattedGrandTotal = `Rp ${grandTotalInt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                     let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                     courierNameLoc.text(courierName);
    //                     courierPriceLoc.text(formattedCourierPrice);
    //                     courierPriceLocHidden.text(formattedCourierPrice);
    //                     grandTotalEl.text(formattedGrandTotal);
    //                 }
            
    //                 locationNames.forEach(function(locationName) {
    //                     let courierPriceLocId = '#courierPriceLoc' + locationName;
    //                     let courierPriceText = $(courierPriceLocId).text();
    //                     let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
                        
    //                     // handle only two WH
    //                     if (isNaN(courierPriceValue)) {
    //                         totalCourierPrice += 0;    
    //                     } else {
    //                         totalCourierPrice += courierPriceValue;
    //                     }
                        
    //                 });
    
    //                 let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));                
    //                 let finalSubtotal = grandSubTotal+totalCourierPrice
    //                 let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    //                 grandTotalEl.text(formattedFinalSubtotal);      
    //                 return;
    //         });
    //     }
    // });

    // Courier dropdown change handler for Surabaya location
    // $('#selectCourierSurabaya').on('change', function () {
    //     let selectedOption = $(this).find('option:selected');
    //     let locationId = selectedOption.attr('data-loc-id');
    //     let courier = selectedOption.attr('data-courier');
    //     let courierId = selectedOption.attr('data-courier-id');
    //     let currentTotalPrice = $('#totalPrice');
    //     let totalCourierPrice = 0;
        
    //     let courierNameLoc = $('p#courierNameLocSurabaya');
    //     let courierPriceLoc = $('p#courierPriceLocSurabaya');
    //     let courierPriceLocHidden = $('p#courierPriceLocHiddenSurabaya');
    //     let grandTotalEl = $('#grandTotal');
    //     let grandTotalInt;
    //     let checkShippingPrice = '/check-shipping-price';
    //     let checkLionParcelTariff = '/alkeba/lionparcel/tariff';
    //     let params = {};

    //     if (locationId !== undefined && courierId !== undefined) {
    //         params['location_id'] = locationId;
    //         params['courier_id'] = courierId;
    //     }
        
    //     if (Object.keys(params).length === 0) {
    //         // reset the current one    
    //         courierNameLoc.text('Kurir Belum Dipilih');
    //         courierPriceLoc.text('Rp 0.00');

    //         let courierPriceJakarta = $('p#courierPriceLocJakarta').text();
    //         let courierPriceBandung = $('p#courierPriceLocBandung').text();
            
    //         let courierPriceJakartaInt = parseInt(courierPriceJakarta.replace(/[^0-9]/g, ''), 10);
    //         let courierPriceBandungInt = parseInt(courierPriceBandung.replace(/[^0-9]/g, ''), 10);
    //         let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
            
    //         let totalSum = courierPriceJakartaInt + courierPriceBandungInt + currentTotalPriceInt;
    //         let fixedTotalSum = totalSum/100;
    //         let formattedTotalSum = `Rp ${fixedTotalSum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
    //         grandTotalEl.text(formattedTotalSum);
    //         return;
    //     }

    //     // LionParcel Handler
    //     if (courier === "Lion Parcel") {
    //         $('#selectLionParcelServiceTypeSurabaya').show();
    //         courierNameLoc.text('Lion Parcel')
    //         let lionSelectSBY = $('#selectLionParcelServiceTypeSurabaya');
    //         ajax.jsonRpc(checkLionParcelTariff, 'call', params, {'async': false})
    //         .then(function (data) {
    //             let resData = JSON.parse(data);
    //             if (resData.result === 200) {
    //                 lionSelectSBY.empty();
                    
    //                 // Automatically fill the service option with the parsed JSON  
    //                 let tariffResult = resData.tariff_result;
    //                 for (let i = 0; i < tariffResult.length; i++) {
    //                     let service = tariffResult[i];
    //                     if (service.product && service.total_tariff && service.estimasi_sla) {
    //                         let optionText = `${service.product}: Rp ${service.total_tariff} (Estimasi: ${service.estimasi_sla})`;
    //                         const option = $('<option>', {
    //                             value: service.product,
    //                             text: optionText
    //                         });

    //                         lionSelectSBY.append(option);

    //                         if (i === 0) {
    //                             option.prop('selected', true);
    //                             let price = service.total_tariff;
                                
    //                             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
    //                             let addedLionPrice = price + currentTotalPriceInt/100
                                
    //                             let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                             let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //                             courierPriceLoc.text(formattedCourierPrice);
    //                             courierPriceLocHidden.text(formattedCourierPrice);
    //                             grandTotalEl.text(formattedGrandTotal);
    //                         }
    //                     }
    //                 }
                    
    //                 // LionParcel change handler 
    //                 lionSelectSBY.on('change', function () {
    //                     let selectedService = $(this).find('option:selected');
    //                     let serviceName = selectedService.val();
                        
    //                     for (let i = 0; i < tariffResult.length; i++) {
    //                         let service = tariffResult[i];
    //                         // Confirm selected type of service
    //                         if (serviceName === service.product) {
    //                             let price = service.total_tariff;
                                
    //                             let currentTotalPriceInt = parseInt(currentTotalPrice.text().replace(/[^0-9]/g, ''), 10);
    //                             let addedLionPrice = price + currentTotalPriceInt/100
                                
    //                             let formattedGrandTotal = `Rp ${addedLionPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                             let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    //                             courierPriceLoc.text(formattedCourierPrice);
    //                             courierPriceLocHidden.text(formattedCourierPrice);
    //                             grandTotalEl.text(formattedGrandTotal);
    //                         }
    //                     }

    //                     totalCourierPrice = 0;
    //                     locationNames.forEach(function(locationName) {
    //                         let courierPriceLocId = '#courierPriceLoc' + locationName;
    //                         let courierPriceText = $(courierPriceLocId).text();
    //                         let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
                            
    //                         // Handle only two WH
    //                         if (isNaN(courierPriceValue)) {
    //                             totalCourierPrice += 0;    
    //                         } else {
    //                             totalCourierPrice += courierPriceValue;
    //                         }
    //                     });
        
    //                     let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));           
    //                     let finalSubtotal = grandSubTotal+totalCourierPrice;
    //                     let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
    //                     grandTotalEl.text(formattedFinalSubtotal);
    //                     return;
    //                 });
    //             }
    //         });
            
    //     // Another expedition Handler
    //     } else {
    //         $('#selectLionParcelServiceTypeSurabaya').hide();
    //         ajax.jsonRpc(checkShippingPrice, 'call', params, {'async': false})
    //             .then(function (data) {
    //                 let resData = JSON.parse(data);
    //                 if (resData.result === 200) {
    //                     let courierName;
    //                     let price = 0;
    //                     let grandTotal = resData.order_summary.grand_total.toLocaleString('id-ID', currencySettings);
    //                     grandTotalInt = parseFloat(grandTotal.replace(/[^0-9,]/g, '').replace(',', '.'));
    //                     let shippingPerLocation = resData.order_summary.shipping_price_per_location;
    
    //                     for (let i = 0; i < shippingPerLocation.length; i++) {
    //                         if (shippingPerLocation[i].area_name === 'Surabaya') {
    //                             courierName = courier;
    //                             price = shippingPerLocation[i].price;
    //                             grandTotalInt += price;
    //                         }
    //                     }
    
    //                     let formattedGrandTotal = `Rp ${grandTotalInt.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                     let formattedCourierPrice = `Rp ${price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    //                     courierNameLoc.text(courierName);
    //                     courierPriceLoc.text(formattedCourierPrice);
    //                     courierPriceLocHidden.text(formattedCourierPrice);
    //                     grandTotalEl.text(formattedGrandTotal);
    //                 }
    
            
    //                 locationNames.forEach(function(locationName) {
    //                     let courierPriceLocId = '#courierPriceLoc' + locationName;
    //                     let courierPriceText = $(courierPriceLocId).text();
    //                     let courierPriceValue = parseFloat(courierPriceText.replace(/[^0-9,]/g, '').replace(',', '.'));
                        
    //                     // handle only two WH
    //                     if (isNaN(courierPriceValue)) {
    //                         totalCourierPrice += 0;    
    //                     } else {
    //                         totalCourierPrice += courierPriceValue;
    //                     }
    
    //                 });
    
    //                 let grandSubTotal = parseFloat(currentTotalPrice.text().replace(/[^\d.]/g, '').replace(/^0+/g, ''));
    //                 let finalSubtotal = grandSubTotal+totalCourierPrice
    //                 let formattedFinalSubtotal = `Rp ${finalSubtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    
    //                 grandTotalEl.text(formattedFinalSubtotal);
    //                 return;
    //         });
    //     }
    // });
    // -=-=-=-= END OF STATIC JQUERY COURIER DROPDOWN HANDLER PER LOC =-=-=-=- 

    $('a#btnProceedToPayment').on('click', function () {
        let locationElements = $('div.location-selected');
        let getPoint = $('#getPoint').data('point');
        let courierNames = [];
        let code_promo = $('input#code_prg');
        let selectionCounter = 0;
        
        // Initialize the service variables
        let lionServiceNameLocBDG = '';
        let lionServiceNameLocJKT = '';
        let lionServiceNameLocSBY = '';
        let priceLionBDG = '';
        let priceLionJKT = '';
        let priceLionSBY = '';
        let priceCourierBDG = '';
        let priceCourierJKT = '';
        let priceCourierSBY = '';

        let deliveryAddress = $('#deliveryAddress').data('delivery-address-id');
        let locations = [];

        let selectedCourierBDG = $('#selectCourierBandung option:selected').attr('data-courier');
        let selectedCourierJKT = $('#selectCourierJakarta option:selected').attr('data-courier');
        let selectedCourierSBY = $('#selectCourierSurabaya option:selected').attr('data-courier');

        // Get the selected service name of LionParcel and their price, else get the price only for other expeditions
        if (selectedCourierBDG === 'Lion Parcel') {
            lionServiceNameLocBDG = $('#selectLionParcelServiceTypeBandung').find('option:selected').val();
            priceLionBDG = $('#courierPriceLocBandung').text();
        } else {
            priceCourierBDG = $('#courierPriceLocBandung').text();
        }
        
        if (selectedCourierJKT === 'Lion Parcel') {
            lionServiceNameLocJKT = $('#selectLionParcelServiceTypeJakarta').find('option:selected').val();
            priceLionJKT = $('#courierPriceLocJakarta').text();
        } else {
            priceCourierJKT = $('#courierPriceLocJakarta').text();
        }
        
        if (selectedCourierSBY === 'Lion Parcel') {
            lionServiceNameLocSBY = $('#selectLionParcelServiceTypeSurabaya').find('option:selected').val();
            priceLionSBY = $('#courierPriceLocSurabaya').text();
        } else {
            priceCourierSBY = $('#courierPriceLocSurabaya').text();
        }

        if (deliveryAddress === undefined) {
            ajax.jsonRpc(AlertAddressPayment, 'call', {'async': false})
            .then(function (data) {
                $('#AlertAddressPayment').modal('show');
                return;
            });
        };
        
        locationElements.each(function (i, loc) {
            let processedAreaName = $(loc).data('loc-name');
            let locationValues;
            selectionCounter++;

            let isCheating = checkCheatingOngkir();
            if (isCheating === true) {
                location.reload();
                return;
            }

            if (processedAreaName === 'Bandung' && selectedCourierBDG !== undefined) { 
                if (selectedCourierBDG === 'Lion Parcel') {
                    locationValues = {
                        'location_id': $(loc).data('loc-id'),
                        'location_name': processedAreaName,
                        'courier': selectedCourierBDG,
                        'service_name': lionServiceNameLocBDG,
                        'list_price': parseInt(priceLionBDG.replace(/[^\d]/g, ''), 10) / 100
                    };
                    courierNames.push(locationValues.courier);
                } else {
                    locationValues = {
                        'location_id': $(loc).data('loc-id'),
                        'location_name': processedAreaName,
                        'courier': selectedCourierBDG,
                        'service_name': "",
                        'list_price': parseInt(priceCourierBDG.replace(/[^\d]/g, ''), 10) / 100
                    };
                    courierNames.push(locationValues.courier);
                }
            }
            else if (processedAreaName === 'Jakarta' && selectedCourierJKT !== undefined) {
                if (selectedCourierJKT === 'Lion Parcel') {
                    locationValues = {
                        'location_id': $(loc).data('loc-id'),
                        'location_name': processedAreaName,
                        'courier': selectedCourierJKT,
                        'service_name': lionServiceNameLocJKT,
                        'list_price': parseInt(priceLionJKT.replace(/[^\d]/g, ''), 10) / 100              
                    };
                    courierNames.push(locationValues.courier);
                } else {
                    locationValues = {
                        'location_id': $(loc).data('loc-id'),
                        'location_name': processedAreaName,
                        'courier': selectedCourierJKT,
                        'service_name': "",
                        'list_price': parseInt(priceCourierJKT.replace(/[^\d]/g, ''), 10) / 100

                    };
                    courierNames.push(locationValues.courier);
                }                
            }
            else if (processedAreaName === 'Surabaya' && selectedCourierSBY !== undefined) {
                if (selectedCourierSBY === 'Lion Parcel') {
                    locationValues = {
                        'location_id': $(loc).data('loc-id'),
                        'location_name': processedAreaName,
                        'courier': selectedCourierSBY,
                        'service_name': lionServiceNameLocSBY,
                        'list_price': parseInt(priceLionSBY.replace(/[^\d]/g, ''), 10) / 100              
                    };
                    courierNames.push(locationValues.courier);
                } else {
                    locationValues = {
                        'location_id': $(loc).data('loc-id'),
                        'location_name': processedAreaName,
                        'courier': selectedCourierSBY,
                        'service_name': "",
                        'list_price': parseInt(priceCourierSBY.replace(/[^\d]/g, ''), 10) / 100
                    };                
                    courierNames.push(locationValues.courier);
                }
            }
            locations.push(locationValues);
        });

        let createUpdateNewOrder = '/create-update-new-order';
        let isUsingPoint = getUrlParameter('ap')

        if (courierNames.length === 0) {
            ajax.jsonRpc(AlertCourier, 'call', {'async': false})
            .then(function (data) {
                return $('#AlertCourier').modal('show');
            });
        } else if (courierNames.length !== selectionCounter) {
            ajax.jsonRpc(AlertCourier, 'call', {'async': false})
            .then(function (data) {
                return $('#AlertCourier').modal('show');
            });
        } else {
            let url = window.location.href;
            let is_ap = url.split('#').pop().split('?').pop();
            let params = {
                'point':getPoint, 
                'delivery_address_id':deliveryAddress, 
                'courier_by_locations':locations,
                'courier': courierNames,
                'code_promo':code_promo.val(),
                'is_using_point':isUsingPoint
            }

            ajax.jsonRpc(createUpdateNewOrder, 'call', params, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
                    if (resData.result === 200) {
                        if (code_promo.val() == undefined) {
                            window.location.href = '/proceed-payment?'+is_ap.toString();
                        } else {
                            window.location.href = '/proceed-payment?'+is_ap.toString()+'&prg='+code_promo.val().toString();
                        }
                    }
                    return;
                });
        }
    });

    // Existing flow of payment with courier in URL
    // Temporarily hidden by Andro
    // $('a#btnProceedToPayment').on('click', function () {
    //     let locationElements = $('div.location-selected');
    //     let getPoint = $('#getPoint').data('point');

    //     let deliveryAddress = $('#deliveryAddress').data('delivery-address-id');
    //     let locations = [];
    //     let courierName = $('input#courierName');
    //     let code_promo = $('input#code_prg');

    //     if (deliveryAddress === undefined) {
    //         ajax.jsonRpc(AlertAddressPayment, 'call', {'async': false})
    //         .then(function (data) {
    //             $('#AlertAddressPayment').modal('show');
    //             return;
    //         });
    //     };

        
    //     locationElements.each(function (i, loc) {
    //         // let locationValues = {'location_id': $(loc).data('loc-id'), 'courier': 'sp'}
    //         let locationValues = {'location_id': $(loc).data('loc-id'), 'courier': courierName.val()}
    //         // let locationValues = {'location_id': $(loc).data('loc-id')}
    //         $('a.courier-option').each(function (i, courier) {
    //             if ($(courier).data('loc-id') === $(loc).data('loc-id') && $(courier).data('courier-selected') === 1) {
    //                 locationValues.courier = $(courier).data('courier');
    //             }
    //         });
    //         locations.push(locationValues);
    //     });

    //     let createUpdateNewOrder = '/create-update-new-order';

    //     let isCurrentAP = getUrlParameter('ap')

    //     if (courierName.val() === "") {
    //         ajax.jsonRpc(AlertCourier, 'call', {'async': false})
    //         .then(function (data) {
    //             return $('#AlertCourier').modal('show');
    //         });
    //     } else {
    //         let url = window.location.href
    //         let is_ap = url.split('#').pop().split('?').pop();
    //         let params = {
    //             'point':getPoint, 
    //             'delivery_address_id': deliveryAddress, 
    //             'courier_by_locations': locations,
    //             'courier': courierName.val(),
    //             'code_promo':code_promo.val(),
    //             'is_current_point':isCurrentAP
    //         }

    //         ajax.jsonRpc(createUpdateNewOrder, 'call', params, {'async': false})
    //             .then(function (data) {
    //                 let resData = JSON.parse(data);
    //                 if (resData.result === 200) {
    //                     if (code_promo.val() == undefined) {
    //                         window.location.href = '/proceed-payment?'+is_ap.toString()+'&cr='+resData.product_courier_id.toString();
    //                     } else {
    //                         window.location.href = '/proceed-payment?'+is_ap.toString()+'&cr='+resData.product_courier_id.toString()+'&prg='+code_promo.val().toString();
    //                     }
    //                 }
    //                 return;
    //             });
    //     }
    // });

    $('a#cartCheckProfile').on('click', function () {
        $('#AlertNotFillProfile').fadeOut('slow');

        let cartUpdateProfile = "/cart-users-update-profile";
        ajax.jsonRpc(cartUpdateProfile, 'call', {'async': false})
        .then(function (data) {
            let conv = JSON.parse(data);

            document.getElementById("name").value = conv.name;
            document.getElementById("email").value = conv.email;
            document.getElementById("date_birth").value = conv.date_birth;
            document.getElementById("gender").value = conv.gender;
            document.getElementById("mobile").value = conv.mobile;
            $('#UpdateProfielModal').modal('show');
            return;
        });
    });


    $('a#btncheckoutprocess').on('click', function () {
        let checkAddress = "/check-address";
        let params = {"user_id":session.user_id}
        let totalPrice = $('#totalPrice').prop('outerText');
        let isValueTotalprice = Number(totalPrice.replace(/[^0-9.-]+/g,""));
        
        if (isValueTotalprice === 0) {
            ajax.jsonRpc(AlertCheckout, 'call', {'async': false})
            .then(function (data) {
                $('#AlertCheckout').modal('show');
                // return;
            });
            return;
        } else if (isValueTotalprice !== 0) {

            let locNames = getWarehouseList();

        }

        let isCurrentPoint = $('input#CheckboxPoint').val();        
        let e = document.getElementById("pilihPromoGift");
        // let SelectedPromovalue = e.options[e.selectedIndex].value;
        let SelectedPromovalue = e.value;

        ajax.jsonRpc(checkAddress, 'call', params, {'async': false})
        .then(function (data) {
            if (data["address_id"] != false) {
                if (SelectedPromovalue == undefined || SelectedPromovalue == false){
                    window.location.href = '/proceed-checkout?ap='+isCurrentPoint.toString();
                    return;
                } else {
                    window.location.href = '/proceed-checkout?ap='+isCurrentPoint.toString()+'&prg='+SelectedPromovalue.toString();
                    return;             
                }
            } else {
                ajax.jsonRpc(AlertAddressPayment, 'call', {'async': false})
                .then(function (data) {
                    $('#AlertAddressPayment').modal('show');
                    return;
                });
            }
        });
    });
    

    $('a#btnConfirmPayment').on('click', function () {
        let paymentOption = $('.pym-opt.active').data('payment-option');
        let promo_code = $('input#code_prg_payment').val();
        
        if (paymentOption === undefined) {
            ajax.jsonRpc(AlertPaymentMethod, 'call', {'async': false})
            .then(function (data) {
                $('#AlertPaymentMethod').modal('show');
                return;
            });
        };
    
        let vaPaymentOptions = ['va_bca', 'va_bri', 'va_bni', 'va_per', 'va_man'];
        let fisicPaymentOptions = ['cod', 'shop'];
    
        let confirmPaymentUrl = '/add-update-payment';
        let params = {
            'payment_option': paymentOption,
            'code_promo':promo_code
        }
    
        let checkProfileUrl = `/checkprofile/${session.user_id}`;
        ajax.jsonRpc(checkProfileUrl, 'call', {'async': false})
        .then(function (data) {
            let conv = JSON.parse(data);
    
            if (conv.status == 'error'){
                $('#AlertNotFillProfile').modal('show');
                return;
            } else {
                ajax.jsonRpc(confirmPaymentUrl, 'call', params, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
                    if (resData.result === 200) {
                        // for (let i = 0; i < resData.order_quotations.length; i++) {
                        let quotation = resData.order_quotations;
                        let createPaymentUrl = '';
                        let createPaymentParam = {};
                        let paymentinstruction = '';
                            
                        // VA Payment
                        if (vaPaymentOptions.includes(quotation.payment_option)) {
                            let currentDate = new Date();
                            currentDate.setTime(currentDate.getTime() + 24 * 60 * 60 * 1000);
                            let iso8601Date = currentDate.toISOString();
                            createPaymentUrl = '/alkeba/create_virtual_account';
                            createPaymentParam = {
                                "external_id": quotation.external_id,
                                "bank_code": quotation.bank_code,
                                "name": quotation.customer_name,
                                "expected_amount": quotation.expected_amount,
                                "expiration_date": iso8601Date
                            }

                            ajax.jsonRpc(createPaymentUrl, 'call', createPaymentParam, {'async': false})
                            .then(function (data) {
                                paymentinstruction = '&popt=' + data.bank_code + '&vanm=' + data.account_number + '&expd=' + data.expiration_date + '&so=' + data.external_id;
                                if (promo_code == undefined){
                                    window.location.href = '/confirm-payment?payment-type=' + paymentOption + paymentinstruction;
                                    return;
                                } else {
                                    window.location.href = '/confirm-payment?payment-type=' + paymentOption + paymentinstruction +'&prg='+promo_code.toString();
                                    return;
                                }
                            });

                        // Non VA Payment
                        } else if (fisicPaymentOptions.includes(quotation.payment_option)) {
                            createPaymentUrl = '/alkeba/fisicPayment';
                            createPaymentParam = {
                                "external_id": quotation.external_id,
                                "name": quotation.customer_name,
                            }

                            ajax.jsonRpc(createPaymentUrl, 'call', createPaymentParam, {'async': false})
                            .then(function (data) {
                                if (promo_code == undefined){
                                    window.location.href = '/confirm-payment?payment-type=' + paymentOption;
                                    return;
                                } else {
                                    window.location.href = '/confirm-payment?payment-type=' + paymentOption+'&prg='+promo_code.toString();
                                    return;
                                }
                            });
                        }

                        // }
                    }
                    return;
                });
    
            }
        });
    
    });

});