# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import datetime
import json
import requests
from . import helpers
from . import constants as const


class AlkebaB2COrder(http.Controller):
    @http.route("/checkprofile/<int:id>", type='json', auth="user", website=True)
    def check_profile(self, **kwargs):

        user_model = request.env["res.users"].sudo()
        get_user_id = user_model.browse(kwargs.get('id'))
        list_data_check = [
            get_user_id.partner_id.name,
            get_user_id.partner_id.email,
            get_user_id.partner_id.gender,
            get_user_id.partner_id.mobile,
            get_user_id.partner_id.date_birth,
        ]

        if "" in list_data_check or False in list_data_check:
            res = {"status":"error"}
            return json.dumps(res)
        else:
            res = {"status":"ok"}
            return json.dumps(res)

    @http.route("/cart-users-update-profile", type='json', auth="user", website=True)
    def users_update_profile_cart(self):
        user = request.env.user
        res = user.partner_id

        date_birth = str()
        if res.date_birth:
            date_birth = res.date_birth.strftime("%Y-%m-%d")
        else:
            date_birth = ""

        vals = {
            'name': res.name,
            'email': res.email,
            'date_birth': date_birth,
            'mobile': res.mobile,
            'gender': res.gender
        }

        return json.dumps(vals)
        # return request.render('theme_alkeba.users_update_profile', values)

    @http.route("/doneOrder/<int:id>", type='json', auth="user", website=True)
    def done_order(self, **kwargs):
        mail_message_id = request.env["mail.message"].sudo().search([("res_id","=",kwargs.get('id'))], limit=1)
        mail_notif_id = request.env["mail.notification"].sudo().search([("mail_message_id","=",mail_message_id.id)])
        if mail_notif_id:
            mail_notif_id.sudo().write({"is_read":True})
        
        get_so_id = request.env["sale.order"].sudo().browse(kwargs.get('id'))
        new_point = get_so_id.partner_id.point + get_so_id.point

        get_so_id.write({
            "delivery_state":"received",
            "point":new_point
        })

        return

    @http.route("/receiveOrder/<int:id>", type='json', auth="user", website=True)
    def receive_order(self, **kwargs):
        mail_message_id = request.env["mail.message"].sudo().search([("res_id","=",kwargs.get('id'))], limit=1)
        mail_notif_id = request.env["mail.notification"].sudo().search([("mail_message_id","=",mail_message_id.id)])
        if mail_notif_id:
            mail_notif_id.sudo().write({"is_read":True})

        get_so_id = request.env["sale.order"].sudo().browse(kwargs.get('id'))
        new_point = get_so_id.partner_id.point + get_so_id.point

        get_so_id.write({
            "delivery_state":"received",
            "point":new_point
        })

        return

    @http.route("/cancel-order", type='json', auth="user", website=True)
    def cancel_order(self):
        req_dict = request.jsonrequest
        params = req_dict['params']
        order_model = request.env['sale.order'].sudo()
        order_id = order_model.browse([int(params['order_id'])])
        
        if order_id:
            order_id.action_cancel()

        return json.dumps({'result': 200})

    @http.route("/order/<int:id>", type='http', auth="user", website=True)
    def order_detail(self, **kwargs):
        values = helpers.get_response_values(
            [
                {'label': "Pesanan Saya", 'path': '/my-orders', 'active': False},
                {'label': "Detail Pesanan", 'path': '', 'active': True},
            ],
            active_menu='my_order', user=True
        )

        mail_message_id = request.env["mail.message"].sudo().search([("res_id","=",kwargs.get('id'))], limit=1)
        mail_notif_id = request.env["mail.notification"].sudo().search([("mail_message_id","=",mail_message_id.id)])
        if mail_notif_id:
            mail_notif_id.sudo().write({"is_read":True})

        get_so_id = request.env["sale.order"].sudo().browse(kwargs.get('id'))

        values["order_id"] = get_so_id.id  
        values["number_so"] = get_so_id.name  
        values["payment_date"] = get_so_id.payment_date  
        values["date_order"] = get_so_id.date_order  
        values["date_receive"] = get_so_id.date_order + datetime.timedelta(days=3)

        if get_so_id.payment_option == 'shop': 
            values["payment_option"] = 'Bayar Ditoko'
        if get_so_id.payment_option == 'cod': 
            values["payment_option"] = 'COD'
        if get_so_id.payment_option in const.VIRTUAL_ACCOUNT_CODE:
            if get_so_id.payment_option == 'va_bni':
                values["payment_option"] = "VA BNI" 
            if get_so_id.payment_option == 'va_bca':
                values["payment_option"] = "VA BCA" 
            if get_so_id.payment_option == 'va_bri':
                values["payment_option"] = "VA BRI" 
            if get_so_id.payment_option == 'va_per':
                values["payment_option"] = "VA PERMATA" 
            if get_so_id.payment_option == 'va_man':
                values["payment_option"] = "VA MANDIRI" 
            # values["payment_option"] = get_so_id.payment_option 

            
        values["amount_total"] = get_so_id.amount_total
        values["total_product_order"] = len(list(check_products.id for check_products in get_so_id.order_line if check_products.product_id.detailed_type != 'service'))
        # get_expedition_id = len(list(check_products.id for check_products in get_so_id.order_line if check_products.product_id.detailed_type == 'service'))
        get_expedition_name = str()
        for loop_order_line in get_so_id.order_line:
            if loop_order_line.product_id.detailed_type == 'service':
                get_expedition_name = loop_order_line.product_id.name

        values["expedition_name"] = get_expedition_name
        
        if get_so_id.payment_state == "waiting":
            values["payment_state"] = "Menunggu Pembayaran"
        if get_so_id.payment_state == "paid":
            values["payment_state"] = "Lunas"
        
        values["delivery_state"] = get_so_id.delivery_state
        values["products_ids"] = get_so_id.order_line

        if get_so_id.payment_date:
            payment_date_conv = datetime.datetime.strptime(get_so_id.payment_date, '%m/%d/%Y, %H:%M:%S').strftime('%Y-%m-%d, %H:%M:%S')
            values["payment_date"] = payment_date_conv
        else:
            values["payment_date"] = "-"

        if get_so_id.virtual_acc:
            values["va_number"] = get_so_id.virtual_acc
        else:
            values["va_number"] = ''

        if get_so_id.state == 'cancel':
            values["is_canceled_order"] = True
        else:
            values["is_canceled_order"] = False

        # users data 
        values["delivery_destination"] = get_so_id.partner_shipping_id.city_ids.name 
        values["address_destination"] = get_so_id.partner_shipping_id.street 
        values["mobile_number"] = get_so_id.partner_shipping_id.parent_id.mobile

        if get_so_id.payment_state == "draft":
            return request.render('theme_alkeba.alkeba_dashboard_detail_order_draft', values)
        elif values["delivery_state"] == "waiting" or values["delivery_state"] == "draft":
            return request.render('theme_alkeba.alkeba_dashboard_detail_order_waiting_payment', values)
        elif values["delivery_state"] == "process":
            return request.render('theme_alkeba.alkeba_dashboard_detail_order_process', values)
        elif values["delivery_state"] == "deliver":
            return request.render('theme_alkeba.alkeba_dashboard_detail_order_deliver', values)
        elif values["delivery_state"] == "received":
            return request.render('theme_alkeba.alkeba_dashboard_detail_order_received', values)
        elif values["delivery_state"] == "done":
            return request.render('theme_alkeba.alkeba_dashboard_detail_order_done', values)

        # KANG DEDEN CODE
        # ==============================================================================================
        # TODO: get order by id and check the state
        # order = {'state': 'returned'}  # this order is dummy

        # Return template based on order state
        # if order['state'] == 'waiting_payment':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_waiting_payment', values)
        # elif order['state'] == 'packing':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_packing', values)
        # elif order['state'] == 'shipped':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_shipped', values)
        # elif order['state'] == 'received':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_received', values)
        # elif order['state'] == 'done':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_done', values)
        # elif order['state'] == 'returned':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_returned', values)
        # elif order['state'] == 'cancel':
        #     return request.render('theme_alkeba.alkeba_dashboard_detail_order_cancel', values)
