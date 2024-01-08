# -*- coding: utf-8 -*-

import json
import odoo
from odoo import http, _
from odoo.http import request
from datetime import datetime
import io, base64
from PIL import Image
from . import helpers
import random

# from odoo.addons.web.controllers.main import Home
import odoo.addons.web.controllers.main as main
import odoo.addons.auth_signup.controllers.main as main_signup

# CLASS LOGIN
class AlkebaWebLogin(main.Home):
    @http.route()
    # @http.route('/web/login', type='http', auth="none")
    def web_login(self, redirect=None, **kw):
        res = super(AlkebaWebLogin, self).web_login()
        values = res.qcontext

        if 'login' in kw:
            if kw["login"].isdigit():
                obj_user = request.env['res.users'].sudo().search([('mobile_login','=',kw['login'])])
                if obj_user.partner_id.mobile == kw["login"]:
                    values['login_success'] = True
                    
                else:
                    values['login_success'] = False
                    values["error"] = "Nomor Login Salah"           
 
        return res

class AlkebaWebSignup(main_signup.AuthSignupHome):
    def _prepare_signup_values(self, qcontext):
        res = super(AlkebaWebSignup, self)._prepare_signup_values(qcontext)
        number = random.randint(1000,9999)

        if res["login"].isdigit():
            obj_user = request.env['res.users'].sudo().search([('mobile_login','=',res['login'])])
            if obj_user:
                res["error"] = "Nomor Telepon Telah Digunakan"           
                return res
            else:
                res["mobile_login"] = res["login"]
                # res["login"] = "temporary@email.com"
                res["login"] = str(res['name'])+str(number)+"@email.com"
        else:
            res["mobile_login"] = False

        return res