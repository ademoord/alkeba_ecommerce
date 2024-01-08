odoo.define('theme_alkeba.wishlist', function (require) {
    'use strict';

    let session = require('web.session');
    let ajax = require('web.ajax');

    $(document).ready(function () {
        let url = window.location;
        let urlPathList = url.pathname.split('/')
        let productSlug;
        if (urlPathList[1] === 'product' && urlPathList.length === 3) {
            productSlug = urlPathList[2];
        }
        let getProductDetailUrl = "/json-product/" + productSlug;

        $('a#addToCartWishlist').on('click', function () {
            let Productid = $(this).data('id');

            let addToCartUrl = '/add-to-cart';
            let params = {
                'product_id': Productid,
                'quantity': 1,
                'location': 18, //Default Gudang Bandung
            };
            ajax.jsonRpc(addToCartUrl, 'call', params, {'async': false})
                .then(function (data) {
                    let response = JSON.parse(data);
                    if (response.status === 200) {
                        $('#addToCartWishlistModal').modal('show');
                    }
                    return;
                });
        });


        $('a.add-favorite').on('click', function () {
            ajax.jsonRpc(getProductDetailUrl, 'call', {}, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
                    let addToWishlistUrl = '/add-to-wishlist/' + resData.id + '/' + session.user_id;
                    let removeFromWishlistUrl = '/remove-from-wishlist/' + resData.id + '/' + session.user_id;

                    if ($('a.add-favorite').hasClass('active')) {
                        ajax.jsonRpc(removeFromWishlistUrl, 'call', {}, {'async': false})
                            .then(function (data) {
                                let response = JSON.parse(data);
                                if (response.result) {
                                    $('a.add-favorite').removeClass('active');
                                    $('#unFavouriteModal').modal('show');
                                }
                                return;
                            });
                    } else {
                        ajax.jsonRpc(addToWishlistUrl, 'call', {}, {'async': false})
                            .then(function (data) {
                                let response = JSON.parse(data);
                                if (response.result) {
                                    $('a.add-favorite').addClass('active');
                                    $('#favouriteModal').modal('show');
                                }
                                return;
                            });
                    }
                    return;
                });
        });

        $('a#deleteWishlist').on('click', function () {
            let productId = $(this).data('id');
            let params = {'product_id': productId}
            
            let removeFromWishlistUrl = '/remove-from-wishlist/' + params["product_id"] + '/' + session.user_id;

            ajax.jsonRpc(removeFromWishlistUrl, 'call', {}, {'async': false})
            .then(function (data) {
                let response = JSON.parse(data);
                if (response.result) {
                    $('#HapusFavoriteModal').modal('show');
        			window.location.href = "/wishlist";

                }
                return;
            });
        });


        return false;
    });

});
