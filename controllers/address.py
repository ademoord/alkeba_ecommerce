# -*- coding: utf-8 -*-

import json
import datetime

from odoo import http
from odoo.http import request

from . import helpers


class AlkebaB2CAddress(http.Controller):    
    @http.route("/city", type='json', auth="user", website=True)
    def choose_city(self):
        req_dict = request.jsonrequest
        params = req_dict['params']
        city_model = request.env['city.address.alkeba'].sudo()
        city_list = list()

        city_ids = city_model.search([
            ("state_id","=",int(params["province_id"]))
        ])

        for loop_citys in city_ids:
            city_list.append({
                "id":loop_citys.id,
                "name":loop_citys.name,
            })

        response = {'status': 200, "city":city_list}
        return json.dumps(response)

    @http.route("/district", type='json', auth="user", website=True)
    def choose_district(self):
        req_dict = request.jsonrequest
        params = req_dict['params']
        district_model = request.env['districts.address.alkeba'].sudo()
        district_list = list()

        district_ids = district_model.search([
            ("city_id","=",int(params["city_id"]))
        ])

        for loop_districts in district_ids:
            district_list.append({
                "id":loop_districts.id,
                "name":loop_districts.name,
            })

        response = {'status': 200, "district":district_list}
        return json.dumps(response)

    @http.route("/village", type='json', auth="user", website=True)
    def choose_village(self):
        req_dict = request.jsonrequest
        params = req_dict['params']
        village_model = request.env['village.address.alkeba'].sudo()
        village_list = list()

        village_ids = village_model.search([
            # ("disctrict_id","=",int(params["district_id"]))
            ("disctrict_id","=",int(params["district_id"]))
        ])

        for loop_villages in village_ids:
            village_list.append({
                "id":loop_villages.id,
                "name":loop_villages.name,
                "district_id":loop_villages.disctrict_id.id,
            })

        response = {'status': 200, "village":village_list}
        return json.dumps(response)

    @http.route("/postcode", type='json', auth="user", website=True)
    def get_postcode(self):
        req_dict = request.jsonrequest
        params = req_dict['params']
        village_model = request.env['village.address.alkeba'].sudo()

        village_id = village_model.search([
            ("id","=",int(params["village_id"]))
        ])
        
        response = {'status': 200, "village_postcode":village_id.postcode}
        return json.dumps(response)