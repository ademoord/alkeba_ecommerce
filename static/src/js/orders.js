odoo.define('theme_alkeba.orders', function (require) {
    'use strict';

    let ajax = require('web.ajax');
    let session = require('web.session');

    // done order
    let doneOrder = $('a#doneOrder');
    doneOrder.on('click', function (e) {
		let idSOReceived = $('input#idSOReceived').val()
        let doneorder = `/doneOrder/${idSOReceived}`;
        
        ajax.jsonRpc(doneorder, 'call', {'async': false})
        .then(function (data) {
            window.location.href = "";
        });

    });

    // receive order
    let diterimaOrder = $('a#orderDiterima');
    diterimaOrder.on('click', function (e) {
		let idSO = $('input#idSO').val()
        let receiveorder = `/receiveOrder/${idSO}`;
        
        ajax.jsonRpc(receiveorder, 'call', {'async': false})
        .then(function (data) {
            window.location.href = "";
        });

    });

    // filter order by number so or number order
    let searchOrder = $('input#searchOrder');
    searchOrder.on('change', function (e) {
        let searchValue = $(this).val();
        let url = `/my-orders?search=${searchValue}`;
        window.location.href = url;

        // if (e.key === 'Enter' || e.keyCode === 13) {
        //     let searchValue = $(this).val();
        //     let url = `/my-orders?search=${searchValue}`;
        //     window.location.href = url;
        // }
    });

    // filter order by date
    let searchOrderDate = $('input#searchOrderDate');
    // searchOrderDate.on('keyup', function (e) {
    searchOrderDate.change(function (e) {
        let searchValue = $(this).val();
        let url = `/my-orders?search=${searchValue}`;

        window.location.href = url;
        
    });

    // VA Number copy to clipboard handler
    $(document).ready(function() {
        $("#copyButton").click(function() {
            const vaNumber = $("#vaNumber").text().trim();
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(vaNumber)
                    .then(function() {
                        ajax.jsonRpc(AlertCopiedToClipboard, 'call', {'async': false})
                        .then(function (data) {
                            $('#AlertCopiedToClipboard').modal('show');
                        });
                        return;
                    })
                    .catch(function(error) {
                        console.error('Error copying text to clipboard: ', error);
                    });
            } else {
                const dummyTextarea = document.createElement("textarea");
                dummyTextarea.style.position = 'fixed';
                dummyTextarea.style.opacity = 0;
                dummyTextarea.value = vaNumber;
                document.body.appendChild(dummyTextarea);
                dummyTextarea.focus();
                dummyTextarea.select();
                try {
                    document.execCommand('copy');
                    ajax.jsonRpc(AlertCopiedToClipboard, 'call', {'async': false})
                    .then(function (data) {
                        $('#AlertCopiedToClipboard').modal('show');
                    });
                    return;
                } catch (e) {
                    console.error('Error copying text to clipboard: ', e);
                } finally {
                    document.body.removeChild(dummyTextarea);
                }
            }
        });
    });

    $('#cancelOrderBtn').on('click', function () {
        let currentURL = window.location.pathname; 
        let parts = currentURL.split('/'); 
        let orderID = parts[parts.length - 1]; 
    
        let cancelOrder = '/cancel-order';
        let params = {
            'order_id': orderID
        }
        ajax.jsonRpc(cancelOrder, 'call', params, {'async': false})
        .then(function (data) {
            let resData = JSON.parse(data);
            if (resData.result === 200) {
                window.location.href = '/my-orders';
            }
            return;
        });
    });

    
});