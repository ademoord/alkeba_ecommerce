# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request

from odoo.addons.web.controllers import main
from odoo.addons.website.controllers.main import Website

from . import helpers


class HomeInherit(main.Home):
    def _login_redirect(self, uid, redirect=None):
        if not redirect and not request.env['res.users'].sudo().browse(uid).has_group('base.group_user'):
            redirect = '/dashboard'
        return super(HomeInherit, self)._login_redirect(uid, redirect=redirect)


class AlkebaB2C(http.Controller):
    @http.route("/", type='http', auth="public", website=True)
    # def index(self, **kwargs):
    def index(self):
        # values = helpers.get_response_values([])
        # values = helpers.get_home_values(values)
    
        # return request.render('theme_alkeba.alkeba_index', values)
        return

    @http.route("/about-us", type='http', auth="public", website=True)
    def about_us(self):
        values = helpers.get_response_values([{'label': "Tentang Kami", 'path': 'about-us', 'active': True}])

        return request.render('theme_alkeba.alkeba_about_us', values)

    @http.route("/under_maintenance", type='http', auth="public", website=True)
    def under_maintenance(self):
        values = helpers.get_response_values([{'label': "Under Maintenance", 'path': 'under_maintenance', 'active': True}])

        return request.render('theme_alkeba.alkeba_under_maintenance', values)

    @http.route("/contact-us", type='http', auth="public", website=True)
    def contact_us(self):
        values = helpers.get_response_values([{'label': "Hubungi Kami", 'path': 'contact-us', 'active': True}])

        return request.render('theme_alkeba.alkeba_contact_us', values)

    @http.route("/faq", type='http', auth="public", website=True)
    def faq(self):
        values = helpers.get_response_values([{'label': "FAQ", 'path': 'faq', 'active': True}])

        return request.render('theme_alkeba.alkeba_faq', values)

    @http.route("/payment-instructions", type='http', auth="public", website=True)
    def payment_instructions(self):
        values = helpers.get_response_values(
            [{'label': "Cara Pembayaran", 'path': 'payment-instructions', 'active': True}])

        return request.render('theme_alkeba.alkeba_payment_instructions', values)

    # @http.route("/terms-and-conditions", type='http', auth="public", website=True)
    # def terms_and_conditions(self):
    #     values = helpers.get_response_values(
    #         [{'label': "Syarat dan Ketentuan", 'path': 'terms-and-conditions', 'active': True}])

    #     return request.render('theme_alkeba.alkeba_t_and_c', values)

    # SINGLE PAGE 
    # @http.route("/terms_condition", type='http', auth="public", website=True)
    # def terms_condition(self, **kwargs):
    #     return request.render('theme_alkeba.term_condition_alkeba')

    @http.route("/privacy-policy", type='http', auth="public", website=True)
    def privacy_policy(self):
        values = helpers.get_response_values(
            [{'label': "Kebijakan Privasi", 'path': 'privacy-policy', 'active': True}])

        return request.render('theme_alkeba.alkeba_privacy_policy', values)
    
