# -*- coding: utf-8 -*-

import json
import pytz
from datetime import datetime
from pytz import timezone
import requests

from odoo import http
from odoo.http import request

from . import helpers


class AlkebaB2CWarehouse(http.Controller):
    @http.route("/get-warehouse-list", type='json', auth="public", website=True)
    def get_warehouse_code(self):
        warehouse_model = request.env['stock.location'].sudo()
        warehouse_ids = warehouse_model.search([('name', '=', 'Stock')])
        warehouse_list = []

        if warehouse_ids:
            for warehouse in warehouse_ids:
                if warehouse.complete_name == 'WHBDG/Stock':
                    warehouse.is_active_alkeba = False
                else:
                    warehouse.is_active_alkeba = True
                    warehouse_loc = helpers.get_warehouse_aliases(warehouse.complete_name)
                    warehouse_list.append(warehouse_loc)

        return json.dumps({'result': 200, 'warehouse_list': warehouse_list})