odoo.define('theme_alkeba.users-profile', function (require) {
    'use strict';

    let ajax = require('web.ajax');
    let session = require('web.session');

    function stringify(obj) {
        const replacer = [];
        for (const key in obj) {
            replacer.push(key);
        }
        return JSON.stringify(obj, replacer);
    }

    $(".toggle-main-password").click(function() {
        $(this).toggleClass("fa-eye fa-eye-slash");
        // var input = $($(this).attr("toggle"));
        var input = $("input#password");
        if (input.attr("type") == "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });

    $(".toggle-confirm-password").click(function() {
        $(this).toggleClass("fa-eye fa-eye-slash");
        // var input = $($(this).attr("toggle"));
        var input = $("input#confirm_password");
        if (input.attr("type") == "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });

    $('a#UbahProfilCartModal').on('click', function () {
        $('#UbahProfilModal').modal('show'); 
    });

    $('a#updateProfileCart').on('click', function () {
        let valName = $('input#nameProfileCart').val();
        let valPhone = $('input#phoneProfileCart').val();
        let valEmail = $('input#emailProfileCart').val();
        let valDate = $('input#datebirthProfileCart').val();
        
        let cartUserUpdateProfile = '/updated-profile';
        let params = {
            "name": valName,
            "mobile": valPhone,
            "email": valEmail,
            "date_birth": valDate
        };

        $("#nameProfileCart").text(valName);
        $("#phoneProfileCart").text(valPhone);
        $("#emailProfileCart").text(valEmail);

        ajax.jsonRpc(cartUserUpdateProfile, 'call', params, {'async': false})
            .then(function (data) {
                let resData = JSON.parse(data);
                if (resData.result === 200) {
                    window.location.href = '';
                    return;
                }
            });
    });


    // new function to validate the registration form
    function validateForm() {
        var login = document.getElementById("login").value.trim();
        var name = document.getElementById("name").value.trim();
        var password = document.getElementById("password").value.trim();
        var confirm_password = document.getElementById("confirm_password").value.trim();
        var term_condition = document.getElementById("term_condition").checked;

        var submitBtn = document.getElementsByClassName("btn btn-primary btn-block")[0];
        
        // check if the values are properly and completely filled
        if (login === "" || name === "" || password === "" || confirm_password === "" || !term_condition) {
            submitBtn.disabled = true; 
            submitBtn.style.backgroundColor = "#6c6c68"; 
            submitBtn.style.opacity = "0.5";
        } else {
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "";
            submitBtn.style.opacity = "";
        }
    }
    
    // only validate the form in the registration page
    if (window.location.pathname === "/web/signup") {
        // change the function calling from traditional call to 
        // jquery call because the prev one is not executed at all
        $(document).ready(function() {
            $('form').on('input', validateForm);
        });
    }

    $('a#btnUpdateProfileUserAtOrder').on('click', function () {
        var name = document.getElementById("name").value;
        var mobile = document.getElementById("mobile").value;
        var date_birth = document.getElementById("date_birth").value;
        var gender = document.getElementById("gender").value;
        var email = document.getElementById("email").value;
    
        var createUserUpdateProfile = '/updated-profile-payment';
    
        let params = {
            "name": name,
            "date_birth": date_birth,
            "mobile": mobile,
            "gender": gender,
            "email": email
        };

        ajax.jsonRpc(createUserUpdateProfile, 'call', params, {'async': false})
            .then(function (data) {
                let resData = JSON.parse(data);
                if (resData.result === 200) {
                    window.location.href = '';
                }
                return;
            });
    });
    

    $('a#btnUpdateProfileUser').on('click', function () {
        // let mobile = $('#mobile').prop('outerText');
        var name = document.getElementById("name").value;
        var mobile = document.getElementById("mobile").value;
        var date_birth = document.getElementById("date_birth").value;
        var gender = document.getElementById("gender").value;
        var email = document.getElementById("email").value;
        var imageFile = document.getElementById("image").files[0];
    
        var createUserUpdateProfile = '/updated-profile';
    
        if (imageFile) {
            var reader = new FileReader();
            reader.onload = function(event) {
                var imageData = event.target.result;
                let params = {
                    "name": name,
                    "date_birth": date_birth,
                    "mobile": mobile,
                    "gender": gender,
                    "email": email,
                    "image_1920": imageData
                };
    
                ajax.jsonRpc(createUserUpdateProfile, 'call', params, {'async': false})
                    .then(function (data) {
                        let resData = JSON.parse(data);
                        if (resData.result === 200) {
                            window.location.href = '';
                        }
                        return;
                    });
            };
            reader.readAsDataURL(imageFile);
        } else {
            let params = {
                "name": name,
                "date_birth": date_birth,
                "mobile": mobile,
                "gender": gender,
                "email": email,
                "image_1920": null
            };
    
            ajax.jsonRpc(createUserUpdateProfile, 'call', params, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
                    if (resData.result === 200) {
                        window.location.href = '';
                    }
                    return;
                });
        }
    });

    $('a#btnUpdatePasswordUser').on('click', function () {
        var new_passwd = document.getElementById("new_password").value;
        var confirm_passwd = document.getElementById("confirm_new_password").value;
        
        let createUserUpdateProfile = '/updated-passwd';
        let params = {
            "password": new_passwd,
        };

        if (new_passwd == confirm_passwd){
            ajax.jsonRpc(createUserUpdateProfile, 'call', params, {'async': false})
                .then(function (data) {
                    let resData = JSON.parse(data);
                    if (resData.result === 200) {
                        window.location.href = '/account-settings';
                    }
                    return;
                });
        } else {
            ajax.jsonRpc(AlertPasswordNotSame, 'call', {'async': false})
                .then(function (data) {
                    $('#AlertPasswordNotSame').modal('show');
                });
            return;
        }
    });
});
