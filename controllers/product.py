# -*- coding: utf-8 -*-

import json

from odoo import http
from odoo.http import request
from odoo.addons.http_routing.models.ir_http import slug, unslug
from itertools import groupby
from operator import itemgetter
from . import helpers, pagination


class AlkebaB2CProduct(http.Controller):
    @http.route("/products-promo", type='http', auth="public", website=True)
    def products_promo(self, **kwargs):
        # paging params
        page = kwargs.get('page', False)
        limit = kwargs.get('limit', False)
        sort = kwargs.get('sort', False)

        # filter params
        category = kwargs.get('categ', False)
        brand = kwargs.get('brand', False)
        area = kwargs.get('area', False)
        price_min = kwargs.get('price-min', False)
        price_max = kwargs.get('price-max', False)
        search = kwargs.get('search', False)

        values = helpers.get_response_values([{'label': "Products Promo", 'path': 'products-promo', 'active': True}])
        
        is_active_pricelist = helpers._get_pricelist()

        page = int(page) if page else 1
        limit = int(limit) if limit else 20
        sort = sort if sort else None
        category_ids = pagination.unpack_ids_string(category) if category and category != 'all' else []
        brand_ids = pagination.unpack_ids_string(brand) if brand and brand != 'all' else []
        area_ids = pagination.unpack_ids_string(area) if area and area != 'all' else []
        filters = pagination.compose_filters(
            category=category_ids, brand=brand_ids, location=area_ids,
            price_min=price_min, price_max=price_max, search=search
        )

        pager = pagination.paginate(model='product.pricelist.item')
        values['pagination'] = pager
        
        list_product_ids = list()   
        if is_active_pricelist:
            for loop_product_pricelist_id in is_active_pricelist.item_ids:
                list_product_ids.append(loop_product_pricelist_id.product_tmpl_id)

        values['products'] = list_product_ids

        # Categories
        categories, ready_stock_categs = helpers._get_product_category_values()
        values['categories'] = categories
        values['ready_stock_categs'] = ready_stock_categs
        values['all_category_count'] = len(categories)
        # Brands
        brands = request.env['brand.alkeba'].sudo().search([('product_ids', '!=', False)])
        values['brands'] = brands
        values['all_brand_count'] = len(brands)

        return request.render('theme_alkeba.alkeba_product_list', values)

    @http.route("/products", type='http', auth="public", website=True)
    def product_list(self, **kwargs):
        # paging params
        page = kwargs.get('page', False)
        limit = kwargs.get('limit', False)
        sort = kwargs.get('sort', False)

        # filter params
        category = kwargs.get('categ', False)
        brand = kwargs.get('brand', False)
        area = kwargs.get('area', False)
        price_min = kwargs.get('price-min', False)
        price_max = kwargs.get('price-max', False)
        search = kwargs.get('search', False)
        terlaris = kwargs.get('terlaris', False)
        promo_diskon = kwargs.get('prodi', False)

        # response
        values = helpers.get_response_values([{'label': "Products", 'path': 'products', 'active': True}])

        # Products
        page = int(page) if page else 1
        limit = int(limit) if limit else 20
        sort = sort if sort else None
        category_ids = pagination.unpack_ids_string(category) if category and category != 'all' else []
        brand_ids = pagination.unpack_ids_string(brand) if brand and brand != 'all' else []
        area_ids = pagination.unpack_ids_string(area) if area and area != 'all' else []
        filters = pagination.compose_filters(
            category=category_ids, brand=brand_ids, location=area_ids,
            price_min=price_min, price_max=price_max, search=search
        )
        pager = pagination.paginate(model='product.product', filters=filters, page=page, limit=limit, sort=sort, terlaris=terlaris)
        values['pagination'] = pager
        
        values['products'] = pager['data']

        # Categories
        categories, ready_stock_categs = helpers._get_product_category_values()
        values['categories'] = categories
        values['ready_stock_categs'] = ready_stock_categs
        values['all_category_count'] = len(categories)
        # Brands
        brands = request.env['brand.alkeba'].sudo().search([('product_ids', '!=', False)])
        values['brands'] = brands
        values['all_brand_count'] = len(brands)
        # Locations
        stock_location_ids = request.env['stock.location'].sudo().search([('usage', '=', 'internal')])
        all_location = 0
        location_with_stock = {}
        for location in stock_location_ids:
            product_ids = location.quant_ids.mapped('product_id')
            if product_ids:
                product_ids = product_ids.ids
                product_ids = list(set(product_ids))
                all_location += len(product_ids)
                if location.id not in location_with_stock:
                    location_with_stock[location.id] = {
                        'id': location.id, 'name': location.warehouse_id.name, 'product_count': len(product_ids)
                    }
                else:
                    location_with_stock[location.id]['product_count'] = location_with_stock[location.id]['product_count'] + len(product_ids)

        location = [loc for loc in location_with_stock.values()]
        values['locations'] = location
        values['all_location_product_count'] = all_location

        return request.render('theme_alkeba.alkeba_product_list', values)

    @http.route("/product/<product_slug>", type='http', auth="public", website=True)
    def product_detail(self, product_slug):
        unslug_values = unslug(product_slug)

        product_id = int(unslug_values[1])
        # product = request.env['product.product'].sudo().browse(product_id)
        product = request.env['product.product'].sudo().search([("product_tmpl_id","=",product_id)])
        in_wishlist = False
        if request.env.user:
            wishlist_id = request.env['wishlist.alkeba'].sudo().search([
                ('user_id', '=', request.env.user.partner_id.id)])
            for line in wishlist_id.product_wishlist_id:
                if line.product_id.id == product_id:
                    in_wishlist = True

        # Stock
        stock_quant_ids = request.env['stock.quant'].sudo().search([
            ('product_id', '=', product.id), ('location_id.usage', '=', 'internal')
        ])
        stock_by_loc = {}
        for sq in stock_quant_ids:
            if sq.location_id.id not in stock_by_loc:
                stock_by_loc[sq.location_id.id] = {
                    'id': sq.location_id.id, 'name': sq.location_id.warehouse_id.name, 'quantity': sq.quantity
                }
            else:
                stock_by_loc[sq.location_id.id]['quantity'] = stock_by_loc[sq.location_id.id]['quantity'] + sq.quantity

        stocks = [location for location in stock_by_loc.values()]

        # Values
        values = helpers.get_response_values([
            {'label': "Shop", 'path': '/products', 'active': False},
            {'label': product.name, 'path': '/product/{}'.format(product.website_url), 'active': True}
        ])
        values['product'] = product
        values['discount_value'] = helpers.get_product_discount(product)
        values['in_wishlist'] = in_wishlist
        values['stocks'] = stocks
        values['number_of_stock_location'] = len(stocks)

        # Product Recomendations: get product by same category
        values['recomended_products'] = helpers.get_recommended_products(product)

        return request.render('theme_alkeba.alkeba_product_detail', values)

    @http.route("/json-product/<product_slug>", type='json', auth="public", methods=['POST'], website=True)
    def get_product_detail(self, product_slug):
        unslug_values = unslug(product_slug)
        product_id = int(unslug_values[1])
        product = request.env['product.product'].sudo().browse(product_id)
        product_data = {
            'id': product.id
        }
        return json.dumps(product_data)

    @http.route("/brand-product", type='json', auth="user", website=True)
    def brand_product(self, **kwargs):
        user = request.env.user
        brand_model = request.env['brand.alkeba'].sudo()
        brand_ids = brand_model.search([])
        host_url = request.httprequest.host_url

        list_brand = list()
        for loop_brands in brand_ids:
            # list_brand.append(loop_brands.name)
            list_brand.append({
                "id":loop_brands.id, 
                "name":loop_brands.name, 
                "url": host_url + "products?page=1&limit=20&sort=latest&brand="+ str(loop_brands.id) +"&categ=all"
            })
            
        # data_brand = {k: list(v) for k, v in groupby(sorted(list_brand), lambda s: s[0])}
        datas = sorted(list_brand, key=itemgetter('name')) 
        data_brand = {k: list(v) for k, v in groupby(datas, lambda s: s["name"][0])}

        return json.dumps(data_brand)