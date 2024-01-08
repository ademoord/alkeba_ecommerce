# -*- coding: utf-8 -*-

import json
import pytz
from datetime import datetime
from pytz import timezone
import requests

from odoo import http
from odoo.http import request

from . import helpers


class AlkebaB2CShipping(http.Controller):
    @http.route("/check-shipping-price", type='json', auth="user", website=True)
    def check_shipping_price(self):
        req_dict = request.jsonrequest
        params = req_dict['params']
        product_template_model = request.env['product.template'].sudo()

        product_service_id = product_template_model.browse(params['courier_id'])
        courier_object = product_template_model.browse([int(product_service_id.id)])
       
        values = helpers.update_shipping_option(params['location_id'], params['courier_id'])
                
        couriers_data_per_location = values['shipping_price_per_location']
        if couriers_data_per_location:
            for courier_data in couriers_data_per_location:
                if courier_data['location_id'] == int(params['location_id']):
                    courier_data['courier'] = courier_object.name
                    courier_data['price'] = courier_object.list_price

		# set WHTK as WHBDG 
        for loop_ship_location in values["shipping_price_per_location"]:
            if loop_ship_location["area_name"] == "Toko":
                loop_ship_location.update({"area_name":"Bandung"})

        return json.dumps({'result': 200, 'order_summary': values})

    @http.route("/track-order/<int:order_id>", type='http', auth="user", website=True)
    def track_shipment(self, order_id):
        relative_url = '/alkeba/lionparcel/tracking/'
        url = request.env['ir.config_parameter'].sudo().get_param('web.base.url') + relative_url
        order_model = request.env['sale.order'].sudo()
        sale_order_id = order_model.browse([order_id])
        values = dict()
        full_addr = ''

        if sale_order_id:
            user_addr = sale_order_id.partner_id.child_ids.filtered(
                lambda child: child.type == 'delivery' and child.is_primary_address)
            full_addr = f"[{user_addr.name}] - {user_addr.street}, {user_addr.village_ids.name}, {user_addr.districts_ids.name}, {user_addr.city_ids.name}"
            
        if sale_order_id.payment_state != 'paid':
            dummy_history = [
                {
                    "row": 1,
                    "datetime": str(datetime.now(pytz.timezone('Asia/Jakarta'))),
                    "status_code": "",
                    "location": "",
                    "city": "",
                    "remarks": "PAKET BELUM DIPROSES. SILAKAN LAKUKAN PEMBAYARAN TERLEBIH DAHULU.",
                    "attachment": [],
                    "updated_by": "BOOKINGAPI_CORPCGK",
                    "updated_on": "2023-10-20T15:57:48+07:00"
                }
            ]
            values = {
                'sale_order_id': sale_order_id,
                'user': {'name': sale_order_id.partner_id.name},
                'sender': "Alkeba",
                'destination': full_addr,
                'origin': "Alkeba Warehouse",
                'current_status': 'PREPARED',
                'chargeable_weight': 1,
                'history': dummy_history
            }

        else:
            payload = json.dumps({'sale_order_id': order_id})
            headers = {'Content-Type': 'application/json'}

            response = requests.post(url, data=payload, headers=headers)
            if response.status_code == 200:
                response_data = response.json()
                result = response_data.get('result', None)
                if result is None:
                    result = {
                        'stts': [
                            {
                                "current_status": "BKD",
                                "history": [
                                    {
                                        "row": 1,
                                        "datetime": str(datetime.now(pytz.timezone('Asia/Jakarta'))),
                                        "status_code": "",
                                        "location": "",
                                        "city": "",
                                        "remarks": "PAKET BELUM DIPROSES. SILAKAN LAKUKAN PEMBAYARAN TERLEBIH DAHULU.",
                                        "attachment": [],
                                        "updated_by": "BOOKINGAPI_CORPCGK",
                                        "updated_on": "2023-10-20T15:57:48+07:00"
                                    }
                                ]
                            }                        
                        ]
                    }

                
                if isinstance(result, str):
                    # Attempt to load 'result' as JSON
                    try:
                        res_dict = json.loads(result)
                    except json.JSONDecodeError:
                        res_dict = None  
                else:
                    res_dict = result

                tracking_result = res_dict['tracking_result'][0]
                if tracking_result:
                    customer_name = tracking_result['recipient_name']

            # ======= DUMMY LISTS - TEMPORARILY HIDDEN! ======= 
            # Only used to test the shipment status/waybill dynamic update
            # test_list_01 = {
            #     "row": 2,
            #     "datetime": "2024-03-20T15:57:48+07:00",
            #     "status_code": "BKD",
            #     "location": "CGK",
            #     "city": "BANTEN",
            #     "remarks": "PAKETMU TELAH TIBA DI GUDANG TRANSIT",
            #     "attachment": [],
            #     "updated_by": "BOOKINGAPI_CORPCGK",
            #     "updated_on": "2023-10-20T15:57:48+07:00"
            # }

            # test_list_02 = {
            #     "row": 3,
            #     "datetime": "2025-01-20T15:57:48+07:00",
            #     "status_code": "BKD",
            #     "location": "CGK",
            #     "city": "BANDUNG BARAT",
            #     "remarks": "PAKETMU TELAH SAMPAI DI RUMAH MANTAN DAN MANTANMU SUKA. WELL DONE",
            #     "attachment": [],
            #     "updated_by": "BOOKINGAPI_CORPCGK",
            #     "updated_on": "2023-10-20T15:57:48+07:00"
            # }

            # if tracking_result['history']:
            #     tracking_result['history'].append(test_list_01)
            #     tracking_result['history'].append(test_list_02)
            # ======= END OF DUMMY LISTS =======
            
            for history in tracking_result['history']:
                if history['datetime']:
                    tz = timezone('Asia/Jakarta')
                    formatted_date = datetime.strptime(history['datetime'], "%Y-%m-%dT%H:%M:%S%z")
                    formatted_date = formatted_date.astimezone(tz)
                    formatted_date_str = formatted_date.strftime("%d-%m-%Y %H:%M:%S")
                    history['datetime'] = formatted_date_str

            values = {
                'sale_order_id': sale_order_id,
                'user': {'name': customer_name},
                'sender': tracking_result['sender_name'],
                'destination': full_addr,
                'origin': tracking_result['origin'],
                'current_status': tracking_result['current_status'],
                'chargeable_weight': tracking_result['chargeable_weight'],
                'history': tracking_result['history']
            }
        
        return request.render('theme_alkeba.alkeba_tracking_order_shipment_detail', values)