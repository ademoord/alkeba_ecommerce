# -*- coding: utf-8 -*-

from datetime import datetime, date, timedelta
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT as DF
from odoo import http, _
from odoo.http import request
from PIL import Image
from . import constants as const
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import base64, traceback, re
import io
import logging
import pytz
import json

_logger = logging.getLogger(__name__)


def is_base64_image_data_checker(value):
    """
    a simple API to check whether the throwed image data values are base64 data of Python standard 
    """

    # regular expression pattern to match a valid base64-encoded image data string
    pattern = r'^data:image\/(jpeg|png|gif|bmp);base64,([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$'
    
    # check if the given object
    # are an instance of base64
    if isinstance(value, str):
        # removes any leading or trailing whitespaces
        value = value.strip()
        
        # match the value with  the pattern
        if re.match(pattern, value):
            return True
    
    return False

def get_response_promo_values(breadcrumbs, active_menu=False, user=False):
    values = {
        'breadcrumbs': _get_breadcrumb(breadcrumbs),
        'active_menu': active_menu,
    }
    
    return values

def _get_promo_gift_customer():
    user_id = request.env.user
    
    # Option Flow 1 
    # promo_gift_lines_model = request.env["promo.gift.lines.alkeba"].sudo()
    # promo_ids = promo_gift_lines_model.search([
    #     ("customer_id","=",user_id.partner_id.id),
    #     ("state_gift","=","active")
    # ])

    # Option Flow 2
    list_obj = list()

    # initialize promo_gift_model as None
    promo_gift_model = None

    # Check if the 'promo.gift.alkeba' model exists
    try:
        request.env['promo.gift.alkeba']
        promo_gift_model = request.env["promo.gift.alkeba"].sudo()
    except KeyError:
        _logger.warning("The 'promo.gift.alkeba' model does not exist in the database.")

    if promo_gift_model is None:
        return list_obj
    else:
        promo_ids = promo_gift_model.search([])

    for loop in promo_ids:
        if user_id.partner_id.id not in [x.id for x in loop.promo_gift_line_ids.customer_id]:
            list_obj.append(loop)

    return list_obj


def _get_product_terlaris():
    today = datetime.now().replace(microsecond=0)
    yesterday = today - timedelta(days=1)
    # THIS DATA FOR TESTING
    # yesterday = "2023-03-07 03:40:07"
    yesterday = datetime.strptime(str(yesterday), '%Y-%m-%d %H:%M:%S')

    yesterday_data = list()
    is_sale_report = request.env['sale.report'].sudo().search([])
    for loop in is_sale_report:
        if loop.date.date() == yesterday.date() and loop.product_uom_qty >= 1:
            yesterday_data.append(loop)

    return yesterday_data

def _filter_product_terlaris():
    today = datetime.now().replace(microsecond=0)
    yesterday = today - timedelta(days=1)
    # THIS DATA FOR TESTING
    # yesterday = "2023-03-07 03:40:07"
    yesterday = datetime.strptime(str(yesterday), '%Y-%m-%d %H:%M:%S')

    yesterday_data = list()
    is_sale_report = request.env['sale.report'].sudo().search([])
    for loop in is_sale_report:
        if loop.date.date() == yesterday.date() and loop.product_uom_qty >= 5:
            yesterday_data.append(loop.product_tmpl_id.id)
    res = request.env['product.template'].sudo().browse(yesterday_data)

    return res

def get_response_values(breadcrumbs, active_menu=False, user=False):
    get_notif = request.env['mail.notification'].sudo().search([("res_partner_id","=",request.env.user.partner_id.id),("is_read","=",False)])

    detail_notif = list()
    for loop_notif in get_notif:
        detail_notif.append({
            "id":loop_notif.mail_message_id.id,
            "date":loop_notif.mail_message_id.date,
            "subject":loop_notif.mail_message_id.subject,
            "body":loop_notif.mail_message_id.body,
            "res_id":loop_notif.mail_message_id.res_id,
            "model":loop_notif.mail_message_id.model
        })

    product_categories, ready_stock_categs = _get_product_category_values()
    values = {
        'breadcrumbs': _get_breadcrumb(breadcrumbs),
        'product_categories': product_categories,
        'ready_stock_categs': ready_stock_categs,
        'active_menu': active_menu,
        'recomended_products': False,
        'pricelist': _get_pricelist(),
        'product_brands': _get_brand_image(),
        'total_notif':len([is_id.id for is_id in get_notif]),
        'detail_notif':detail_notif
    }

    if values["pricelist"]:
        list_pricelist_product_ids = list()
        for loop_pricelist_product in values["pricelist"].item_ids:
            if len(list_pricelist_product_ids) < 5:
                list_pricelist_product_ids.append(loop_pricelist_product)

        values["list_pricelist_product_ids"] = list_pricelist_product_ids

    # Cart data
    if request.env.user:
        user_id = request.env.user
        cart_model = request.env['cart.alkeba'].sudo()
        cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
        if not cart_id:
            cart_id = cart_model.sudo().create({'user_id': user_id.partner_id.id})

        # values['cart_product_count'] = sum(cart_id.cart_line_ids.mapped('qty'))
        values['cart_product_count'] = len(cart_id.cart_line_ids)

    if user:
        values['user'] = _get_user_info()

    return values


def _get_breadcrumb(paths):
    values = [const.BREADCRUMB_HOME]
    if paths:
        for path in paths:
            values.append(path)

    return values


def _get_product_category_values():
    stock_quant_ids = request.env['stock.quant'].sudo().search([])

    categories_ids = []
    for sq in stock_quant_ids:
        for categ_id in sq.product_id.public_categ_ids:
            categories_ids.append(categ_id.id)

    categories_ids = list(set(categories_ids))
    top_category_id = request.env['product.public.category'].sudo().search([('parent_id', '=', False)], limit=1)
    category_ids = request.env['product.public.category'].sudo().browse(categories_ids)

    top_category_ids = []
    for category in category_ids:
        top_category_ids.append(_get_parent_category(top_category_id, category))

    # product_category_ids = request.env['product.public.category'].sudo().search(
    #     [('id', 'in', top_category_ids)], order='id asc')

    product_category_ids = request.env['product.public.category'].sudo().search(
        [('parent_id', '=', top_category_id.id)], limit=8, order='id asc')

    return product_category_ids, categories_ids


def _get_parent_category(top_category_id, category):
    if category.parent_id and category.parent_id.id != top_category_id.id:
        return _get_parent_category(top_category_id, category.parent_id)
    else:
        return category.id


def _get_pricelist():
    pricelist_id_config = request.env['ir.config_parameter'].sudo().get_param('theme_alkeba.website_pricelist_id')
    pricelist_id = False
    if pricelist_id_config:
        pricelist_id = request.env['product.pricelist'].sudo().browse(int(pricelist_id_config))

    return pricelist_id


def get_recommended_products(product):
    recomended_products = request.env['product.product'].sudo().search([
        ('categ_id', '=', product.categ_id.id), ('id', '!=', product.id), ('show_in_website', '=', True),
    ], limit=10)
    return recomended_products


def _get_brand_image():
    brand_model = request.env['brand.alkeba'].sudo()
    brand_data = brand_model.search([], limit=8)
    # print("Type of image data:", type(brand_data))

    if brand_data:
        return brand_data
    else:
        return None


def _get_user_info():
    user = request.env.user
    user_info = {
        'name': user.name,
        'user': user,
    }

    return user_info

def _get_ap_status():
    ap = request.params["is_using_point"]

    if ap == 1:
        return True
    elif ap == 0:
        return False


def _get_lionparcel_shipping_price(origin, destination, weight, commodity):
    headers = {'Authorization': 'Basic bGlvbnBhcmNlbDpsaW9ucGFyY2VsQDEyMw=='}
    
    origin = urlencode({'origin': origin})
    destination = urlencode({'destination': destination})
    
    is_url = f"https://api-stg-middleware.thelionparcel.com/v3/tariff?{origin}&{destination}&weight={weight}&commodity={commodity}"

    request = Request(is_url, headers=headers)

    response_body = urlopen(request).read()
    response_json = json.loads(response_body)
    # formatted_response = json.dumps(response_json, indent=2)

    result_data = response_json['result']
    if len(result_data) >= 1:
        shipping_price = result_data[0]['total_tariff']

    return shipping_price


def get_home_values(values):
    # home slider
    home_slider = request.env['alkeba.home.slider'].sudo().search([('status', '=', True)], limit=1)
    values['main_banner'] = home_slider

    # Promo
    # initialize is_promo as None
    is_promo = None

    # Check if the 'promo.alkeba' model exists
    try:
        request.env['promo.alkeba']
        is_promo = request.env['promo.alkeba'].sudo().search([('state', '=', 'active')], limit=1)
    except KeyError:
        _logger.warning("The 'promo.alkeba' model does not exist in the database.")
    
    values['promo'] = is_promo

    # product Terlaris
    is_produk_terlaris = _get_product_terlaris()
    values["produk_terlaris"] = is_produk_terlaris

    # promo products ==> Kang Ncep Version
    # ====================================
    # promo_products = []
    # pricelist_id_config = request.env['ir.config_parameter'].sudo().get_param('theme_alkeba.website_pricelist_id')
    # if pricelist_id_config:
    #     pricelist_id = request.env['product.pricelist'].sudo().browse(int(pricelist_id_config))
    #     for item in pricelist_id.item_ids:
    #         # if item.compute_price == 'percentage' and item.applied_on == '1_product':
    #         this_month_promo_product_ids = request.env['product.product'].sudo().search([
    #             ('product_tmpl_id', '=', item.product_tmpl_id.id)
    #         ])
    #         for product_id in this_month_promo_product_ids:
    #             promo_products.append({
    #                 'disc': item.percent_price,
    #                 'product': product_id,
    #                 'price': pricelist_id.sudo().get_product_price(product_id, 1, 3)
    #             })

    # values['this_month_promo_products'] = promo_products[0:5] if len(promo_products) > 6 else promo_products

    # product event
    event_id = request.env['alkeba.home.event'].sudo().search([
        ('active', '=', True)
    ], limit=1)
    values['event'] = event_id

    # popular products ==> By Kang Ncep
    # values['popular_products'] = get_popular_product()

    # new products
    today = datetime.today()
    # back_day_date = today - timedelta(days=60)
    product_ids = request.env['product.product'].sudo().search([
        # ('show_in_website', '=', True), ('detailed_type', '=', 'product'), ('create_date', '>=', back_day_date)
        ('show_in_website', '=', True), ('detailed_type', '=', 'product')
    ], limit=6, order='write_date desc')
    product_tmpl_ids = [
        request.env['product.template'].sudo().search([("id","=",x.product_tmpl_id.id)]) for x in product_ids 
    ]

    for product_tmpl in product_tmpl_ids:
        if product_tmpl.image_256:
            image = Image.open(io.BytesIO(base64.b64decode(product_tmpl.image_256)))
            current_img_size = image.size
            image = image.resize((150, 150))
            buffered = io.BytesIO()
            image.save(buffered, format='PNG')
            product_tmpl.image_256 = base64.b64encode(buffered.getvalue()).decode()
    
    values['new_products'] = product_tmpl_ids

    # featured category
    category_ids = request.env['product.public.category'].sudo().search([
        ('featured', '=', True)
    ])
    values['featured_categories'] = category_ids

    # header promo text
    is_promo_text_header = request.env['ir.config_parameter'].sudo().get_param('theme_alkeba.website_dynamic_text')
    if is_promo_text_header:
        values['promo_text_header'] = is_promo_text_header

    return values


def get_product_discount(product):
    discount = 0.0
    pricelist_id_config = request.env['ir.config_parameter'].sudo().get_param('theme_alkeba.website_pricelist_id')
    if pricelist_id_config:
        pricelist_id = request.env['product.pricelist'].sudo().browse(int(pricelist_id_config))
        if pricelist_id:
            item_ids = pricelist_id.item_ids.filtered(
                lambda
                    it: it.compute_price == 'percentage' and it.applied_on == '1_product' and it.product_tmpl_id.id == product.product_tmpl_id.id)
            if item_ids:
                discount = item_ids[0].percent_price

    return discount


def get_product_price(original_price, pricelist_price):
    price = original_price
    if pricelist_price < original_price:
        price = pricelist_price

    return price


# def get_cart_values(values, only_checked=False):
#     cart_model = request.env['cart.alkeba'].sudo()
#     user_id = request.env.user

#     cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
#     if not cart_id:
#         cart_id = cart_model.sudo().create({'user_id': user_id.partner_id.id})

#     pricelist_id = _get_pricelist()

#     product_by_location_dict = {}
#     subtotal = sum(cart_id.cart_line_ids.filtered(lambda line: line.is_checked).mapped('total_price'))
#     cart_line_ids = cart_id.cart_line_ids
#     if only_checked:
#         cart_line_ids = cart_id.cart_line_ids.filtered(lambda line: line.is_checked)
#     for cart_line in cart_line_ids:
#         unit_price = cart_line.product_id.list_price
#         if pricelist_id:
#             pricelist_price = pricelist_id.get_product_price(cart_line.product_id, 1, user_id.partner_id)
#             unit_price = get_product_price(unit_price, pricelist_price)

#         if cart_line.location_id.id not in product_by_location_dict:
#             product_by_location_dict[cart_line.location_id.id] = {
#                 'location_id': cart_line.location_id.id,
#                 'area_name': cart_line.location_id.warehouse_id.name,
#                 'products': [{
#                     'product': cart_line.product_id,
#                     'product_id': cart_line.product_id.id,
#                     'product_name': cart_line.product_id.name,
#                     'product_weight': cart_line.product_id.weight,
#                     'product_weight_uom': cart_line.product_id.weight_uom_name,
#                     'product_sku': cart_line.product_id.barcode,
#                     'qty': cart_line.qty,
#                     'price': unit_price,
#                     'subtotal': cart_line.total_price,
#                     'notes': cart_line.notes,
#                     'is_checked': cart_line.is_checked,
#                 }],
#                 'product_count': 1,
#                 'volume': cart_line.product_id.volume,
#                 'weight': cart_line.product_id.weight,
#             }
#         else:
#             product_by_location_dict[cart_line.location_id.id]['products'].append({
#                 'product': cart_line.product_id,
#                 'product_id': cart_line.product_id.id,
#                 'product_name': cart_line.product_id.name,
#                 'product_weight': cart_line.product_id.weight,
#                 'product_weight_uom': cart_line.product_id.weight_uom_name,
#                 'product_sku': cart_line.product_id.barcode,
#                 'qty': cart_line.qty,
#                 'price': unit_price,
#                 'subtotal': cart_line.total_price,
#                 'notes': cart_line.notes,
#                 'is_checked': cart_line.is_checked,
#             })
#             product_by_location_dict[cart_line.location_id.id]['product_count'] = \
#                 product_by_location_dict[cart_line.location_id.id]['product_count'] + 1
#             product_by_location_dict[cart_line.location_id.id]['volume'] = \
#                 product_by_location_dict[cart_line.location_id.id]['volume'] + cart_line.product_id.volume
#             product_by_location_dict[cart_line.location_id.id]['weight'] = \
#                 product_by_location_dict[cart_line.location_id.id]['weight'] + cart_line.product_id.weight

#     products_by_location = []
#     for products_dict in product_by_location_dict.values():
#         products_by_location.append(products_dict)
 
#     values['cart'] = cart_id
#     values['products_by_location'] = products_by_location
#     values = get_order_summary(values)

#     return values


def get_cart_values(values, only_checked=False):
    cart_model = request.env['cart.alkeba'].sudo()
    user_id = request.env.user

    cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
    if not cart_id:
        cart_id = cart_model.sudo().create({'user_id': user_id.partner_id.id})

    pricelist_id = _get_pricelist()

    product_by_location_dict = {}
    subtotal = sum(cart_id.cart_line_ids.filtered(lambda line: line.is_checked).mapped('total_price'))
    cart_line_ids = cart_id.cart_line_ids
    if only_checked:
        cart_line_ids = cart_id.cart_line_ids.filtered(lambda line: line.is_checked)
        
    subtotals_by_location = {}  

    for cart_line in cart_line_ids:
        unit_price = cart_line.product_id.list_price
        if pricelist_id:
            pricelist_price = pricelist_id.get_product_price(cart_line.product_id, 1, user_id.partner_id)
            unit_price = get_product_price(unit_price, pricelist_price)

        if cart_line.location_id.id not in product_by_location_dict:
            product_by_location_dict[cart_line.location_id.id] = {
                'location_id': cart_line.location_id.id,
                'area_name': cart_line.location_id.warehouse_id.name,
                'products': [{
                    'product': cart_line.product_id,
                    'product_id': cart_line.product_id.id,
                    'product_name': cart_line.product_id.name,
                    'product_weight': cart_line.product_id.weight,
                    'product_weight_uom': cart_line.product_id.weight_uom_name,
                    'product_sku': cart_line.product_id.barcode,
                    'qty': cart_line.qty,
                    'price': unit_price,
                    'subtotal': cart_line.total_price,
                    'notes': cart_line.notes,
                    'is_checked': cart_line.is_checked,
                }],
                'product_count': 1,
                'volume': cart_line.product_id.volume,
                'weight': cart_line.product_id.weight,
            }
        else:
            product_by_location_dict[cart_line.location_id.id]['products'].append({
                'product': cart_line.product_id,
                'product_id': cart_line.product_id.id,
                'product_name': cart_line.product_id.name,
                'product_weight': cart_line.product_id.weight,
                'product_weight_uom': cart_line.product_id.weight_uom_name,
                'product_sku': cart_line.product_id.barcode,
                'qty': cart_line.qty,
                'price': unit_price,
                'subtotal': cart_line.total_price,
                'notes': cart_line.notes,
                'is_checked': cart_line.is_checked,
            })
            product_by_location_dict[cart_line.location_id.id]['product_count'] = \
                product_by_location_dict[cart_line.location_id.id]['product_count'] + 1
            product_by_location_dict[cart_line.location_id.id]['volume'] = \
                product_by_location_dict[cart_line.location_id.id]['volume'] + cart_line.product_id.volume
            product_by_location_dict[cart_line.location_id.id]['weight'] = \
                product_by_location_dict[cart_line.location_id.id]['weight'] + cart_line.product_id.weight

        # calculate subtotals by location
        if cart_line.location_id.id not in subtotals_by_location:
            subtotals_by_location[cart_line.location_id.id] = 0
        subtotals_by_location[cart_line.location_id.id] += cart_line.total_price

    products_by_location = []
    for products_dict in product_by_location_dict.values():
        products_by_location.append(products_dict)
 
    values['cart'] = cart_id
    values['products_by_location'] = products_by_location
    values['subtotals_by_location'] = subtotals_by_location  # Add this line
    values = get_order_summary(values)

    return values



def get_popular_product():
    date_end = datetime.today()
    date_start = date_end - timedelta(days=30)

    line_list = []
    final_list = []
    sale_order_ids = request.env['sale.order'].sudo().search(
        [('date_order', '<=', date_end), ('date_order', '>=', date_start), ('state', '=', 'done')])

    for order in sale_order_ids:
        for order_lines in order.order_line:
            line_list.append(order_lines)

    for line in line_list:
        total_amount = 0
        for same_product in line_list:
            if line.product_id == same_product.product_id:
                total_amount = total_amount + same_product.product_uom_qty

        product_dict = {'product': line.product_id.id, 'quantity': total_amount}
        if product_dict['product'] not in final_list:
            final_list.append(product_dict['product'])

    product_ids = request.env['product.product'].sudo().browse(final_list)

    return product_ids


def get_address_values():
    city_ids = request.env['city.address.alkeba'].sudo().search([])
    district_ids = request.env['districts.address.alkeba'].sudo().search([])
    state_ids = request.env['state.address.alkeba'].sudo().search([])
    village_ids = request.env['village.address.alkeba'].sudo().search([])

    return {
        'cities': city_ids,
        'districts': district_ids,
        'states': state_ids,
        'villages': village_ids,
    }


def get_order_summary(values):
    cart_model = request.env['cart.alkeba'].sudo()
    cart_id = cart_model.search([('user_id', '=', request.env.user.partner_id.id)], limit=1)
    shipping_price_per_location = {}
    for cart_line in cart_id.cart_line_ids:
        if cart_line.location_id.id not in shipping_price_per_location:
            shipping_price_per_location[cart_line.location_id.id] = {
                'location_id': cart_line.location_id.id,
                'area_name': cart_line.location_id.warehouse_id.name,
                'courier': const.COURIER_OPTIONS[cart_line.courier_option],
                # 'courier_option': cart_line.courier_option,
                'price': cart_line.shipping_price
            }

    subtotal = sum(cart_id.cart_line_ids.filtered(lambda line: line.is_checked).mapped('total_price'))
    shipping_prices = 0.0
    shipping_per_location = []
    for shipping_price in shipping_price_per_location.values():
        shipping_prices += shipping_price['price']
        shipping_per_location.append(shipping_price)

    grand_total = subtotal + shipping_prices

    values['subtotal'] = subtotal
    values['grand_total'] = grand_total
    values['shipping_price_per_location'] = shipping_per_location

    return values
    
def get_parent_order_number():
    user_id = request.env.user
    
    timezone = pytz.timezone('Asia/Bangkok')

    current_datetime = datetime.now(timezone)
    formatted_date_time = current_datetime.strftime("%d%m%Y-%H%M")
    parent_number = f"ALKB-SO-{formatted_date_time}-{str(user_id.partner_id.id)}"

    return parent_number


def update_shipping_option(location_id, courier_id):
    cart_model = request.env['cart.alkeba'].sudo()
    product_template_model = request.env['product.template'].sudo()

    product_service_id = product_template_model.browse([courier_id])
    cart_id = cart_model.search([('user_id', '=', request.env.user.partner_id.id)], limit=1)

    for cart_line in cart_id.cart_line_ids:
        if cart_line.location_id.id == location_id:
            cart_line.sudo().write({'product_service_id': product_service_id.id})

    values = get_order_summary({})

    return values

def _get_draft_orders():
    user_id = request.env.user
    order_model = request.env['sale.order'].sudo()
    draft_order_ids = order_model.search([('partner_id', '=', user_id.partner_id.id), ('state', '=', 'draft')])

    return draft_order_ids

def create_update_new_order(params):
    # initialize promo_gift_model and promo_gift_line_model as None
    promo_gift_model = None
    promo_gift_line_model = None

    # Check if the 'promo.gift.alkeba' and 'promo.gift.lines.alkeba' model exists
    try:
        request.env["promo.gift.alkeba"]
        request.env["promo.gift.lines.alkeba"]
        promo_gift_model = request.env["promo.gift.alkeba"].sudo()
        promo_gift_line_model = request.env["promo.gift.lines.alkeba"].sudo()        
    except KeyError:
        _logger.warning("The 'promo.gift.alkeba' and 'promo.gift.lines.alkeba' model does not exist in the database.")

    cart_model = request.env['cart.alkeba'].sudo()
    order_model = request.env['sale.order'].sudo()
    product_template_model = request.env['product.template'].sudo()
    # product_service_id = product_template_model.search([("name","=",params["courier_by_locations"][0]["courier"]),("display_courier","=",True)])
    product_service_ids = []
    disc_point = 0
    total_shipping_price = 0.0
    order_counter = 0
    price_subtots_list = []
    so_ids = []
    largest_total = 0
    order_with_largest_total = None
    active_point_status = int(request.params["is_using_point"])

    stock_location_model = request.env['stock.location'].sudo()
    user_id = request.env.user
    pricelist_id = _get_pricelist()
    cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)

    # retrieves the courier ids
    for location in params["courier_by_locations"]:
        courier_value = location["courier"]
        product_service_ids.extend(product_template_model.search([("name", "=", courier_value), ("display_courier", "=", True)]))

    # remove draft order
    draft_order_ids = _get_draft_orders()
    if draft_order_ids:
        draft_order_ids.unlink()

    # create new orders
    delivery_address_id = params['delivery_address_id']
    courier_by_locations = params['courier_by_locations']
    location_courier_mapping = {loc['location_id']: loc['courier'] for loc in courier_by_locations}

    for location in courier_by_locations:
        location_id = stock_location_model.browse(int(location['location_id']))
        number_parent_order = get_parent_order_number()
        if pricelist_id != False:
            order_values = {
                'partner_id': user_id.partner_id.id,
                'partner_invoice_id': int(delivery_address_id),
                'partner_shipping_id': int(delivery_address_id),
                'date_order': datetime.now(),
                'pricelist_id': pricelist_id.id,
                'warehouse_id': location_id.warehouse_id.id,
                'picking_policy': 'direct',
                'website_id': request.website.id,
                'number_parent_order': number_parent_order,
                'user_id': 2,
                'order_type': 'b2c',  # B2C by default
                'order_line': [],
            }
        else:
            order_values = {
                'partner_id': user_id.partner_id.id,
                'partner_invoice_id': int(delivery_address_id),
                'partner_shipping_id': int(delivery_address_id),
                'date_order': datetime.now(),
                'warehouse_id': location_id.warehouse_id.id,
                'picking_policy': 'direct',
                'website_id': request.website.id,
                'number_parent_order': number_parent_order,
                'user_id': 2,
                'order_type': 'b2c',  # B2C by default
                'order_line': [],
            }
        line_values = []
        shipping_price = 0.0
        
        for cart_line in cart_id.cart_line_ids.filtered(lambda ln: ln.is_checked):
            if cart_line.location_id.id == int(location['location_id']):
                line_values.append((0, False, {
                    'product_id': cart_line.product_id.id,
                    'name': cart_line.notes if cart_line.notes else '-',
                    'product_uom_qty': cart_line.qty,
                    'product_uom': cart_line.product_id.uom_id.id,
                    'price_unit': cart_line.price,
                }))
                shipping_price = cart_line.shipping_price

        if len(product_service_ids) == 1:
            product_service_id = product_service_ids[0]
            if product_service_id.name == 'Lion Parcel':
                if location['location_name'] == 'Bandung':
                    order_values['selected_service_lionbdg'] = location['service_name']
                    total_shipping_price += location['list_price']
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': location['service_name'],
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': location['list_price'],
                    }))
                elif location['location_name'] == 'Jakarta':
                    order_values['selected_service_lionjkt'] = location['service_name']
                    total_shipping_price += location['list_price']
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': location['service_name'],
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': location['list_price'],
                    }))
                elif location['location_name'] == 'Surabaya':
                    order_values['selected_service_lionsby'] = location['service_name']
                    total_shipping_price += location['list_price']
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': location['service_name'],
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': location['list_price'],
                    }))

            else:
                line_values.append((0, False, {
                    'product_id': product_service_id.id,
                    'name': product_service_id.name,
                    'product_uom_qty': 1,
                    'product_uom': product_service_id.uom_id.id,
                    'price_unit': shipping_price,
                }))

        else:
            product_service_id = next((psi for psi in product_service_ids if psi.name == location_courier_mapping.get(location_id.id)), None)
            if product_service_id:
                # Order line for WHBDG out with LionParcel
                if location['courier'] == 'Lion Parcel' and location['location_name'] == 'Bandung':
                    order_values['selected_service_lionbdg'] = location['service_name']
                    total_shipping_price += location['list_price']
                    order_counter += 1
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': location['service_name'],
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': location['list_price'],
                    }))
                
                # Order line for WHBDG out with another expedition
                elif location['courier'] != 'Lion Parcel' and location['location_name'] == 'Bandung':
                    total_shipping_price += product_service_id.list_price
                    order_counter += 1
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': product_service_id.name,
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': product_service_id.list_price,
                    }))

                # Order line for WHJKT out with LionParcel
                if location['courier'] == 'Lion Parcel' and location['location_name'] == 'Jakarta':
                    order_values['selected_service_lionjkt'] = location['service_name']
                    total_shipping_price += location['list_price']
                    order_counter += 1
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': location['service_name'],
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': location['list_price'],
                    }))
                # Order line for WHJKT out with another expedition
                elif location['courier'] != 'Lion Parcel' and location['location_name'] == 'Jakarta':
                    total_shipping_price += product_service_id.list_price
                    order_counter += 1
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': product_service_id.name,
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': product_service_id.list_price,
                    }))

                # Order line for WHSBY out with LionParcel
                if location['courier'] == 'Lion Parcel' and location['location_name'] == 'Surabaya':
                    order_values['selected_service_lionsby'] = location['service_name']
                    total_shipping_price += location['list_price']
                    order_counter += 1
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': location['service_name'],
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': location['list_price'],
                    }))
                # Order line for WHSBY out with another expedition
                elif location['courier'] != 'Lion Parcel' and location['location_name'] == 'Surabaya':
                    total_shipping_price += product_service_id.list_price
                    order_counter += 1
                    line_values.append((0, False, {
                        'product_id': product_service_id.id,
                        'name': product_service_id.name,
                        'product_uom_qty': 1,
                        'product_uom': product_service_id.uom_id.id,
                        'price_unit': product_service_id.list_price,
                    }))

            # Order line without expedition
            else:
                line_values.append((0, False, {
                    'product_id': product_service_ids[0].id,
                    'name': product_service_ids[0].name,
                    'product_uom_qty': 1,
                    'product_uom': product_service_ids[0].uom_id.id,
                    'price_unit': shipping_price,
                }))

        is_promo_gift_line_object = None
        promo_gift_line_id = None
        if "code_promo" in params:
            promo_gift_id = promo_gift_model.search([("code_promo","=",params["code_promo"])])
            # promo_gift_line_id = promo_gift_line_model.search([("promo_gift_id","=",promo_gift_id.id),("customer_id","=",user_id.partner_id.id)])
            is_promo_gift_line_object = promo_gift_id.promo_gift_line_ids

            product_product_id = request.env['product.product'].sudo().search([("product_tmpl_id","=",promo_gift_id.gift_product_id.id)])

            line_values.append((0, False, {
                'product_id': product_product_id.id,
                'name': product_product_id.name,
                'product_uom_qty': 1,
                'product_uom': product_product_id.uom_id.id,
                'price_unit': 0.0,
            }))

            promo_gift_line_id = is_promo_gift_line_object.create({
                "promo_gift_id":promo_gift_id.id,
                "customer_id": user_id.partner_id.id,
                "state_gift": "used",
                "using_promo_date": datetime.now()
            })
 
        # check if the orders are come from the ecommerce site
        # assume that only available 1 website for now, so default id will be 1
        if not True or request.website.id != 1:
            order_values["order_type"] = 'b2b'
            
        order_values['point'] = params["point"]
        order_values['order_line'] = line_values
        
        so_id = order_model.create(order_values)
        if len(params['courier_by_locations']) > 1:
            so_ids.append(so_id)

        if "code_promo" in params:
            promo_gift_line_id.write({
                "sale_order_id":so_id.id,
            })

    # Claim the point discount
    if active_point_status == 1:
        disc_point = int(user_id.partner_id.point) * 1000
        if len(courier_by_locations) > 1:
            # Get order with largest amount
            for so in so_ids:
                total_subtotal = sum(so.order_line.mapped('price_subtotal'))
                if total_subtotal > largest_total:
                    largest_total = total_subtotal
                    order_with_largest_total = so

            if order_with_largest_total:
                order_with_largest_total.write({'discount_point': disc_point})
        else:
            so_id.write({'discount_point': disc_point})

    # Store the total shipping price to session var
    request.session['total_shipping_price'] = total_shipping_price
    
    # Store the cod_ok list to session var to prevent user choose COD payment on UnCODable services
    courier_list = product_service_ids
    cod_courier_count = 0

    for courier in courier_list:
        if courier.cod_ok:
            cod_courier_count += 1

    if cod_courier_count == 1:
        request.session['cod_ok'] = False
    elif cod_courier_count >= 2:
        request.session['cod_ok'] = True


def _prepare_invoice_values(order_numbers, invoice_lines):
    journal_id = request.env['account.journal'].sudo().search([('type', '=', 'sale')], limit=1)

    return {
        'partner_id': request.env.user.partner_id.id,
        'move_type': 'out_invoice',
        'state': 'draft',
        'journal_id': journal_id.id,
        'date': datetime.today(),
        'currency_id': request.env.user.company_id.currency_id.id,
        'invoice_date': datetime.today(),
        'payment_reference': order_numbers["payment_ref"],
        'invoice_user_id': 2,
        'so_id': order_numbers["so_id"],
        'invoice_line_ids': False,
    }


def _prepare_invoice_line_values(order_line):
    account_id = False
    if order_line.product_id.property_account_income_id:
        account_id = order_line.product_id.property_account_income_id
    else:
        account_id = order_line.product_id.categ_id.property_account_income_categ_id

    return {
        'product_id': order_line.product_id.id,
        'account_id': account_id.id,
        'name': order_line.product_id.name,
        'quantity': order_line.product_uom_qty,
        'product_uom_id': order_line.product_id.uom_id.id,
        'price_unit': order_line.price_unit,
        'currency_id': request.env.user.company_id.currency_id.id,
        'price_subtotal': order_line.price_unit * order_line.product_uom_qty
    }

def _prepare_line_ids_values(order_line):
    account_id = False
    if order_line.product_id.property_account_income_id:
        account_id = order_line.product_id.property_account_income_id
    else:
        account_id = order_line.product_id.categ_id.property_account_income_categ_id

    return {
        'account_id': account_id.id,
        'name': order_line.product_id.name,
        'quantity': order_line.product_uom_qty,
        'price_unit': order_line.price_unit,
        'total_price': order_line.price_unit * order_line.product_uom_qty
    }

def add_or_update_payment_option(payment_option):
    invoice_model = request.env['account.move'].sudo()
    draft_order_ids = _get_draft_orders()
    exported_invoice_ids = []
    exported_draft_order_ids = []

    invoices_created = []

    for draft_orders in draft_order_ids:
    # for customer, draft_orders in draft_orders_by_customer.items():
        invoice_ref = {
            "payment_ref": ", ".join(draft_order.name for draft_order in draft_orders),
            "so_id": draft_orders.id,
        }

        invoice_lines = []
        prepare_list_line_ids = []

        for draft_order in draft_orders:
            draft_order.payment_option = payment_option
            draft_order.payment_state = 'waiting'
            # draft_order.action_confirm()
            exported_draft_order_ids.append(draft_order.id)

            for order_line in draft_order.order_line:
                invoice_lines.append((0, 0, _prepare_invoice_line_values(order_line)))

            for order_line in draft_order.order_line:
                prepare_list_line_ids.append(_prepare_line_ids_values(order_line))

        invoice_values = _prepare_invoice_values(invoice_ref, invoice_lines)

        print("===INVOICE===")
        print(invoice_values)
        print("===INVOICE===")

        is_list = []
        is_list_credit_line_ids = []
        is_amount_total = float()

        invoice_id = invoice_model.with_context(check_move_validity=False).create(invoice_values)

        for loop in invoice_lines:
            loop = loop[2]
            loop["move_id"] = invoice_id.id
            is_list.append((0,0,loop))

        for loop_prepare_line_ids in prepare_list_line_ids:
            loop_prepare_line_ids["move_id"] = invoice_id.id
            is_dict_line_ids = {
                "account_id": loop_prepare_line_ids["account_id"],
                "name": loop_prepare_line_ids["name"],
                "debit": 0.0,
                "credit": loop_prepare_line_ids["total_price"],
            }
            is_list_credit_line_ids.append((0,0,is_dict_line_ids))
            is_amount_total = is_amount_total + loop_prepare_line_ids["total_price"]

        get_account_id = request.env["account.account"].sudo().search([("code","=","102-1001")])

        if get_account_id:
            is_list_debit_line_ids = [(0,0,{
                "account_id": get_account_id.id,
                "name": "",
                "debit": is_amount_total,
                "credit": 0.0,
            })]
        else:
            is_list_debit_line_ids = [(0,0,{
                "account_id": get_account_id.id,
                "name": "",
                "debit": is_amount_total,
                "credit": 0.0,
            })]

        is_list_ids = is_list_credit_line_ids + is_list_debit_line_ids

        invoice_id.sudo().write({"invoice_line_ids": is_list, "line_ids": is_list_ids})

        for confirmed_order in draft_orders:
            confirmed_order.invoice_ids = [(4, invoice_id.id)]

        # HIDE FOR TEMPORARY
        # invoices = draft_order_ids._create_invoices()
        
        # try:
        #     invoice_id.action_post()
        # except Exception as e:
        #     # Log the error and print it for debugging
        #     print("Error during invoice posting:", e)

        invoices_created.append(invoice_id)

    if len(invoices_created) == len(draft_order_ids):
        for inv in invoices_created:
            exported_invoice_ids.append(inv.id)

    # save the ids in session variable
    request.session['exported_invoice_ids'] = exported_invoice_ids

    # return invoices_created
    return exported_draft_order_ids

def get_spesific_orders(values):
    order_model = request.env['sale.order'].sudo()
    user_id = request.env.user
    order_ids = None

    try:
        check_string = datetime.strptime(values["search"], '%Y-%m-%d')
        quoted_check_string = "'" + str(check_string) + "'"
        order_ids = order_model.search([('partner_id', '=', user_id.partner_id.id), ('date_order', '>=', quoted_check_string)])
    except:
        order_ids = order_model.search([('partner_id', '=', user_id.partner_id.id), ('name', '=', values["search"])])
    
    # Reverse the orders' order before being returned
    order_ids = order_ids[::-1]
    
    values['order_all'] = order_ids

    return values

def get_orders(values):
    order_model = request.env['sale.order'].sudo()
    user_id = request.env.user

    order_ids = order_model.search([('partner_id', '=', user_id.partner_id.id)])

    values['order_all'] = order_ids
    values['order_waiting_payment'] = order_ids.filtered(lambda order: order.payment_state == 'waiting')
    values['order_paid'] = order_ids.filtered(lambda order: order.payment_state == 'paid')

    values['order_packing'] = order_ids.filtered(lambda order: order.delivery_state == 'packing')
    values['order_shipped'] = order_ids.filtered(lambda order: order.delivery_state == 'shipped')
    values['order_received'] = order_ids.filtered(lambda order: order.delivery_state == 'received')
    values['order_returned'] = order_ids.filtered(lambda order: order.delivery_state == 'returned')
    values['order_done'] = order_ids.filtered(lambda order: order.delivery_state == 'done')
    values['order_cancelled'] = order_ids.filtered(lambda order: order.state == 'cancel')
    
    return values

def get_warehouse_aliases(complete_name):
    match = re.search(r'WH(\w+)', complete_name)

    if match:
        extracted_chars = match.group(1)
        return const.WH_ALIASES[extracted_chars]
    else:
        print("Pattern not found in the string.")
        return None

def update_users_profile(params):
    user_id = http.request.env.user
    user_id.sudo().write({"mobile_login": params["mobile"]})

    # firstly, check if params containing image_1920 value
    if 'image_1920' in params:
        # then check if the value is not None
        if params['image_1920'] != None:
            # assign the encoded one to be splitted in the API
            image_data_encoded = params['image_1920']
            # check using the API base64 checker
            if is_base64_image_data_checker(image_data_encoded):
                try:
                    # basicly the encoding process make the data joined with their mimetype 
                    # so, we must splits it to extract the base64-encoded data
                    # and separate them with their respective mimetypes
                    # then decodes the image data to their original binary format
                    image_data_splitted = image_data_encoded.split(',')[1]
                    user_id.partner_id.write({
                        "name": params["name"],
                        "date_birth": params["date_birth"],
                        "mobile": params["mobile"],
                        "gender": params["gender"],
                        "email": params["email"],
                        "image_1920": image_data_splitted,
                    })
                    return
                except Exception as e:
                    # if the splitting process encountered any exceptions
                    # print the data and quit the method
                    print("Error splitting and verifying image data:")
                    traceback.print_exc()
                    return
            else:
                print("Invalid base64 image data format!")
                return
        else:
            # if there's no image data at all, just write the rest to db
            user_id.partner_id.write({
                "name": params["name"],
                "date_birth": params["date_birth"],
                "mobile": params["mobile"],
                "gender": params["gender"],
                "email": params["email"],
            })
            return
    else:
        # if there's no image data at all, just write the rest to db
        user_id.partner_id.write({
            "name": params["name"],
            "date_birth": params["date_birth"],
            "mobile": params["mobile"],
            "gender": params["gender"],
            "email": params["email"],
        })
        return

def update_users_passwd(params):
    user_id = request.env.user
    user_id.write(params)
    return

def get_courirs_product():
    product_template_model = request.env['product.template'].sudo()
    product_template_ids = product_template_model.search(['&',("detailed_type", "=", "service"),("display_courier", "=", True)])

    return list(product_template_ids)

def unlink_user_cart(so_id, user_id):
    list_product = []
    for loop_order_line in so_id.order_line:
        if loop_order_line.product_id.detailed_type != 'service':
            list_product.append(loop_order_line.product_id.id)

    cart_model = request.env['cart.alkeba'].sudo()
    cart_id = cart_model.search([("user_id", "=", user_id.partner_id.id)])

    for loop_cart_line_ids in cart_id.cart_line_ids:
        if loop_cart_line_ids.product_id.id in list_product:
            cart_data = loop_cart_line_ids
            cart_data.unlink()
