
odoo.define('theme_alkeba.livechat', function (require) {
    'use strict';

    let ajax = require('web.ajax');
    let session = require('web.session');   

    let chat = $('a#chat_button');
    
    chat.on('click', function (e) {
        if ($(".o_livechat_button").is(":hidden")){
            $(".o_livechat_button").css({"display":""});
        }

        if ($(".o_livechat_button").is(":visible")){
            $('.o_livechat_button').trigger('click');
        } else {
            $(".o_thread_window").css(
                {
                    "bottom": "0px",
                    "height": "400px",
                }
            );
        }
    });

});