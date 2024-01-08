# -*- coding: utf-8 -*-

import json

from odoo import http
from odoo.http import request
from odoo.addons.http_routing.models.ir_http import slug, unslug

from . import helpers, pagination


class AlkebaB2CWishlist(http.Controller):
    @http.route("/add-to-wishlist/<product_id>/<user_id>", type='json', auth="public", methods=['POST'], website=True)
    def add_to_wishlist(self, product_id, user_id):
        wishlist_model = request.env['wishlist.alkeba'].sudo()
        user = request.env['res.users'].sudo().browse(int(user_id))
        user_wishlist_id = wishlist_model.search([('user_id', '=', user.partner_id.id)])
        if not user_wishlist_id:
            user_wishlist_id = wishlist_model.create({'user_id': user.partner_id.id})

        already_in_wl = False
        for line in user_wishlist_id.product_wishlist_id:
            if line.product_id.id == int(product_id):
                already_in_wl = True

        if not already_in_wl:
            user_wishlist_id.product_wishlist_id = [(0, False, {'product_id': int(product_id)})]

        response = {'result': True}
        return json.dumps(response)

    @http.route("/remove-from-wishlist/<product_id>/<user_id>", type='json', auth="public", methods=['POST'], website=True)
    def remove_from_wishlist(self, product_id, user_id):
        response = {'result': True}
        wishlist_model = request.env['wishlist.alkeba'].sudo()
        user = request.env['res.users'].sudo().browse(int(user_id))
        user_wishlist_id = wishlist_model.search([('user_id', '=', user.partner_id.id)])
        if not user_wishlist_id:
            response['result'] = False
            return json.dumps(response)

        line_id = user_wishlist_id.product_wishlist_id.filtered(lambda l: l.product_id.id == int(product_id))
        user_wishlist_id.product_wishlist_id = [(2, line_id.id)]
        return json.dumps(response)
