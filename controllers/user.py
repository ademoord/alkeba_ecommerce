# -*- coding: utf-8 -*-

import json

from odoo import http
from odoo.http import request
from datetime import datetime
import io, base64
from PIL import Image
from . import helpers
import imghdr


class AlkebaB2CUser(http.Controller):
    @http.route("/dashboard", type='http', auth="user", website=True)
    def customer_dashboard(self):
        values = helpers.get_response_values(
            [{'label': "Dashboard", 'path': 'dashboard/', 'active': True}],
            active_menu='dashboard', user=True
        )
        user = request.env.user
        values['user'] = user
        values['partner'] = user.partner_id

        address_id = request.env.user.partner_id.child_ids.filtered(
            lambda child: child.type == 'delivery' and child.is_primary_address)
        values['address'] = address_id
        values['address_values'] = helpers.get_address_values()
        values['order_ids'] = helpers.get_orders(values)

        return request.render('theme_alkeba.alkeba_dashboard_customer', values)

    @http.route("/my-orders", type='http', auth="user", website=True)
    def customer_my_orders(self, **kwargs):
        search = kwargs.get('search', False)
        values = helpers.get_response_values(
            [{'label': "Pesanan Saya", 'path': 'my-orders/', 'active': True}],
            active_menu='my_order', user=True
        )

        user = request.env.user
        values['partner'] = user.partner_id

        if search:
            values["search"] = search
            values = helpers.get_spesific_orders(values)
            return request.render('theme_alkeba.alkeba_dashboard_my_order', values)

        if search == False or search == "":
            values = helpers.get_orders(values)
            return request.render('theme_alkeba.alkeba_dashboard_my_order', values)

    @http.route("/address-settings", type='http', auth="user", website=True)
    def customer_address_setting(self, **kwargs):
        values = helpers.get_response_values(
            [{'label': "Pengaturan Alamat", 'path': 'address-settings/', 'active': True}],
            active_menu='address_setting', user=True
        )

        user_address_ids = request.env.user.partner_id.child_ids.filtered(lambda child: child.type == 'delivery' and child.activate_address)

        list_primary_address = []
        for loop_address in user_address_ids:
            list_primary_address.append(loop_address.is_primary_address)

        if list_primary_address:
            if True not in list_primary_address:
                user_address_ids[0].write({
                    "is_primary_address":True
                })

        user = request.env.user
        values['partner'] = user.partner_id

        values['addresses'] = user_address_ids
        values['address_values'] = helpers.get_address_values()

        return request.render('theme_alkeba.alkeba_address_settings_customer', values)

    @http.route("/set-primary-address/<address_id>", type='http', auth="user", website=True)
    def set_primary_address(self, address_id):
        partner = request.env['res.partner'].sudo()
        address = partner.browse(int(address_id))
        other_address_ids = partner.search([('parent_id', '=', address.parent_id.id)])
        for other_address in other_address_ids:
            other_address.is_primary_address = False

        address.is_primary_address = True

        return request.redirect('/address-settings')
        

    @http.route("/set-primary-checkout-address/<address_id>/<ap>", type='http', auth="user", website=True)
    def set_primary_checkout_address(self, address_id, ap):
        partner = request.env['res.partner'].sudo()
        address = partner.browse(int(address_id))
        other_address_ids = partner.search([('parent_id', '=', address.parent_id.id)])
        for other_address in other_address_ids:
            other_address.is_primary_address = False

        address.is_primary_address = True
        active_point = ap

        if int(active_point) == 0:
            return request.redirect('/proceed-checkout?ap=0')
        elif int(active_point) == 1:
            return request.redirect('/proceed-checkout?ap=1')

    @http.route("/set-delete-address/<address_id>", type='http', auth="user", website=True)
    def delete_address(self, address_id):
        partner = request.env['res.partner'].sudo()
        address = partner.browse(int(address_id))
        other_address_ids = partner.search([('parent_id', '=', address.parent_id.id)])

        if address.is_primary_address == True:
            address.write({
                "is_primary_address":False,
                "activate_address":False
            })

        if address.is_primary_address == False:
            address.write({
                "activate_address":False
            })

        return request.redirect('/address-settings')

    # @http.route("/add-address", type='http', auth="user", methods=['POST'], website=True)
    @http.route("/add-address", type='json', auth="user", methods=['POST'], website=True)
    def add_address(self, **kwargs):
        user = request.env.user
        partner = request.env['res.partner'].sudo()
        new_address = {
            'parent_id': user.partner_id.id,
            'type': 'delivery',
            'name': kwargs['label'],
            'street': kwargs['street'],
            'state_ids': int(kwargs['state']) if int(kwargs['state']) else False,
            'city_ids': int(kwargs['city']) if int(kwargs['city']) else False,
            'districts_ids': int(kwargs['district']) if int(kwargs['district']) else False,
            'village_ids': int(kwargs['village']) if int(kwargs['village']) else False,
            'zip': kwargs['zip'],
        }
        partner.create(new_address)
        return
        # return request.redirect('/address-settings')

    @http.route("/update-address/<address_id>", type='http', auth="user", methods=['POST'], website=True)
    def update_address(self, address_id, **kwargs):
        partner = request.env['res.partner'].sudo()
        address = partner.browse(int(address_id))
        values = {
            'name': kwargs['label'],
            'street': kwargs['street'],
            'state_ids': int(kwargs['state']) if int(kwargs['state']) else False,
            'city_ids': int(kwargs['city']) if int(kwargs['city']) else False,
            'districts_ids': int(kwargs['district']) if int(kwargs['district']) else False,
            'village_ids': int(kwargs['village']) if int(kwargs['village']) else False,
            'zip': kwargs['zip'],
        }
        address.write(values)

        return request.redirect('/address-settings')

    # @http.route("/update-address-in-cart/<address_id>", type='http', auth="user", methods=['POST'], website=True)
    @http.route("/update-address-in-cart/<address_id>", type='json', auth="user", methods=['POST'], website=True)
    def update_address_in_cart(self, address_id, **kwargs):
        partner = request.env['res.partner'].sudo()
        address = partner.browse(int(address_id))
        values = {
            'name': kwargs['label'],
            'street': kwargs['street'],
            'state_ids': int(kwargs['state']) if int(kwargs['state']) else False,
            'city_ids': int(kwargs['city']) if int(kwargs['city']) else False,
            'districts_ids': int(kwargs['district']) if int(kwargs['district']) else False,
            'village_ids': int(kwargs['village']) if int(kwargs['village']) else False,
            'zip': kwargs['zip'],
        }
        address.write(values)

        # return request.redirect('/address-settings')
        return json.dumps({'result': 200})


    @http.route("/delete-address/<address_id>", type='http', auth="user", website=True)
    def update_address(self, address_id):
        partner = request.env['res.partner'].sudo()
        address = partner.with_context(active_test=False).browse(int(address_id))
        address.sudo().unlink()
        return request.redirect('/address-settings')

    @http.route("/my-reviews", type='http', auth="user", website=True)
    def customer_my_reviews(self, **kwargs):
        values = helpers.get_response_values(
            [{'label': "Ulasan Saya", 'path': 'my-reviews/', 'active': True}],
            active_menu='my_review', user=True
        )

        values['reviews'] = {
            'waiting_review': False,
            'reviewed': False,
        }
        user = request.env.user
        values['partner'] = user.partner_id

        return request.render('theme_alkeba.alkeba_dashboard_my_review', values)

    @http.route("/wishlist", type='http', auth="user", website=True)
    def customer_wishlist(self, **kwargs):
        values = helpers.get_response_values(
            [{'label': "Wishlist", 'path': 'wishlist/', 'active': True}],
            active_menu='wishlist', user=True
        )

        user = request.env.user
        values['partner'] = user.partner_id

        wishlist_id = request.env['wishlist.alkeba'].sudo().search([('user_id', '=', request.env.user.partner_id.id)])

        values['wishlist'] = wishlist_id

        return request.render('theme_alkeba.alkeba_dashboard_wishlist', values)

    @http.route("/account-settings", type='http', auth="user", website=True)
    def customer_account_setting(self):
        values = helpers.get_response_values(
            [{'label': "Pengaturan Akun", 'path': 'account-settings/', 'active': True}],
            active_menu='account_setting', user=True
        )
        user = request.env.user
        values['user'] = user
        values['partner'] = user.partner_id

        return request.render('theme_alkeba.alkeba_account_settings_customer', values)

    @http.route("/my-notif", type='http', auth="user", website=True)
    def customer_notifications(self):
        values = helpers.get_response_values(
            [{'label': "Notifikasi Saya", 'path': 'my-notif/', 'active': True}], user=True
        )

        current_date = datetime.now()
        current_month = current_date.strftime("%Y-%m")

        user = request.env.user

        notif_model = request.env["mail.notification"].sudo()
        user_notif_ids = notif_model.search([("res_partner_id", "=", user.partner_id.id)])

        notifications = []
        for loop_notif in user_notif_ids:
            if loop_notif.is_read == False:
                date_month = loop_notif.mail_mail_id.date.strftime("%Y-%m") if loop_notif.mail_mail_id.date else None
                if date_month and date_month == current_month:
                    # loop_notif.mail_mail_id.date = loop_notif.mail_mail_id.date.strftime("%d %B %Y")
                    notifications.append(loop_notif)

        values['partner'] = user.partner_id
        values['current_month'] = current_month
        values['notifications'] = notifications

        return request.render('theme_alkeba.alkeba_customer_notifications', values)

    @http.route("/order-shipment-tracking", type='http', auth="user", website=True)
    def customer_order_shipment_tracking(self, **kwargs):
        search = kwargs.get('search', False)
        values = helpers.get_response_values(
            [{'label': "Lacak Pesanan Saya", 'path': 'order-shipment-tracking/', 'active': True}],
            active_menu='my_order', user=True
        )

        user = request.env.user
        values['partner'] = user.partner_id

        if search:
            values["search"] = search
            values = helpers.get_spesific_orders(values)
            return request.render('theme_alkeba.alkeba_tracking_order_shipment', values)

        if search == False or search == "":
            values = helpers.get_orders(values)
            return request.render('theme_alkeba.alkeba_tracking_order_shipment', values)

    @http.route("/users-update-profile", type='http', auth="user", website=True)
    def users_update_profile(self):
        values = helpers.get_response_values(
            [{'label': "Pengaturan Update Akun", 'path': 'users-update-profile/', 'active': True}],
            active_menu='account_setting', user=True
        )
        user = request.env.user

        values['user'] = user
        values['partner'] = user.partner_id

        return request.render('theme_alkeba.users_update_profile', values)

    @http.route("/updated-profile-payment", type='json', auth="user", website=True)
    def updated_profile_payment(self):
        req_dict = request.jsonrequest
        params = req_dict['params']

        if params["date_birth"] != "":
            params["date_birth"] = datetime.strptime(params["date_birth"], '%Y-%m-%d').date()

        helpers.update_users_profile(params)

        return json.dumps({'result': 200})

    @http.route("/updated-profile", type='json', auth="user", website=True)
    def updated_profile(self):
        req_dict = request.jsonrequest
        params = req_dict['params']

        if 'image_1920' in request.httprequest.files:
            image_file = request.httprequest.files['image_1920']
            image_data = image_file.read()

            # check if the image file is a valid image
            if imghdr.what(None, image_data) is not None:
                # encode the data
                params['image_1920'] = base64.b64encode(image_data)
            else:
                # handle the case when the uploaded file is not a valid image file
                return json.dumps({'result': 400, 'error': 'Invalid image file'})

        if params["date_birth"] != "":
            params["date_birth"] = datetime.strptime(params["date_birth"], '%Y-%m-%d').date()

        helpers.update_users_profile(params)

        return json.dumps({'result': 200})

    @http.route("/updated-passwd", type='json', auth="user", website=True)
    def updated_passwd(self):
        req_dict = request.jsonrequest
        params = req_dict['params']

        helpers.update_users_passwd(params)

        return json.dumps({'result': 200})

    @http.route("/set-notif-read/<notif_id>", type='http', auth="user", website=True)
    def set_notif_read(self, notif_id):
        notif_model = request.env['mail.notification'].sudo()
        notification = notif_model.browse(int(notif_id))

        if notification.is_read == False:
            notification.write({'is_read':True})
        
        return request.redirect('/my-notif')