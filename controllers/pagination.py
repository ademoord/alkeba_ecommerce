# -*- coding: utf-8 -*-

import math

from odoo import http
from odoo.http import request
from . import helpers


def paginate(model, filters=None, page=1, limit=20, sort='latest', terlaris=None):
    if filters is None:
        filters = []

    sort = unpack_sort(sort_key=sort)

    if not terlaris:
        data = request.env[model].sudo().search(filters, offset=(page - 1) * limit, limit=limit, order=sort)
        data_count = data.search_count(filters)
    else:
        data = helpers._filter_product_terlaris()
        data_count = len(data)

    total_pages = math.ceil(data_count / limit)
    current_total_rows = len(data)
    showing = '0 dari 0'
    if current_total_rows > 0:
        if current_total_rows > 1:
            showing = '{}-{} dari {}'.format(1, current_total_rows, data_count)
        else:
            showing = '1 dari {}'.format(data_count)

    sort = pack_sort(sort_key=sort)
    return {
        'data': data,
        'total_rows': data_count,
        'total_pages': total_pages,
        'page': page,
        'limit': limit,
        'sort': sort,
        'showing': showing,
    }


def unpack_sort(sort_key):
    sort = 'create_date desc'
    if sort_key == 'latest':
        sort = 'create_date desc'
    elif sort_key == 'name_az':
        sort = 'name asc'
    elif sort_key == 'name_za':
        sort = 'name desc'
    elif sort_key == 'price_lh':
        sort = 'list_price asc'
    elif sort_key == 'price_hl':
        sort = 'list_price desc'

    return sort


def pack_sort(sort_key):
    sort = 'latest'
    if sort_key == 'create_date desc':
        sort = 'latest'
    elif sort_key == 'name asc':
        sort = 'name_az'
    elif sort_key == 'name desc':
        sort = 'name_za'
    elif sort_key == 'list_price asc':
        sort = 'price_lh'
    elif sort_key == 'list_price desc':
        sort = 'price_hl'

    return sort


def unpack_ids_string(ids_string=False):
    ids = []
    if ids_string:
        ids_string = ids_string.split(',')
        checking_list = list(filter(None, ids_string))
        ids = [int(id_s) for id_s in checking_list]
        ids = list(set(ids))

    return ids


def compose_filters(category=False, brand=False, location=False, price_min=0, price_max=0, search=False):
    domain = [('detailed_type', '=', 'product'), ('show_in_website', '=', True)]
    if category:
        domain.append(('public_categ_ids', 'in', category))
    if brand:
        domain.append(('brand_id', 'in', brand))
    if search:
        domain.append(('name', 'ilike', search))

    return domain
