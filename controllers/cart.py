# -*- coding: utf-8 -*-

import json
import datetime
import base64
import requests

from odoo import http
from odoo.http import request

from . import helpers
from . import constants as const
from datetime import datetime

from urllib.parse import urlparse, parse_qs

class AlkebaB2CCart(http.Controller):
	@http.route("/cart", type='http', auth="user", website=True)
	def cart(self):
		values = helpers.get_response_values(
			[{'label': "Keranjang Belanja", 'path': 'cart/', 'active': True}], user=True
		)
		values = helpers.get_cart_values(values)
		values["promo"] = helpers._get_promo_gift_customer()

		unique_area = {}
		for location in values["products_by_location"]:
			if location['area_name'] not in unique_area:
				unique_area[location['area_name']] = {'subtotal': values['subtotals_by_location'][location['location_id']]}

		subtotals_by_id = {}
		for area_id, area_subtotal in values['subtotals_by_location'].items():
			subtotals_by_id[str(area_id)] = area_subtotal

		values['subtotals_by_id'] = subtotals_by_id

		# set WHTK as WHBDG 
		for location in values['products_by_location']:
			if location['area_name'] == "Toko":
				location.update({"area_name":"Bandung"})

		values["point"] = int(values["grand_total"]/100000)
		return request.render('theme_alkeba.alkeba_cart_layout', values)

	@http.route("/proceed-checkout", type='http', auth="user", website=True)
	def proceed_checkout(self):
		values = helpers.get_response_values(
			[
				{'label': "Keranjang Belanja", 'path': 'cart', 'active': False},
				{'label': "Pilih Pengiriman", 'path': 'proceed-checkout', 'active': True},
			], user=True
		)

		url = str(request.httprequest.url)
		parsed_url = urlparse(url)
		params = parse_qs(parsed_url.query)

		user_address_ids = request.env.user.partner_id.child_ids.filtered(
			lambda child: child.type == 'delivery' and child.is_primary_address)
		user_checkout_address_ids = request.env.user.partner_id.child_ids.filtered(
			lambda child: child.type == 'delivery' and child.activate_address)
		
		values['addresses'] = user_address_ids
		values['checkout_addresses'] = user_checkout_address_ids

		isAddress = values['addresses']
		
		if type(isAddress.id) == int:
			values["is_address"] = True
		if type(isAddress.id) != int:
			values["is_address"] = False

		values['address_values'] = helpers.get_address_values()

		values = helpers.get_cart_values(values, only_checked=True)
		courier_ids = helpers.get_courirs_product()
		values["courier_ids"] = courier_ids
		values["point"] = int(values["grand_total"]/100000)

		active_point = params.get("ap")[0]
		
		if "prg" in params:
			promo_gift = params.get("prg")[0]
			cek_promo = request.env["promo.gift.alkeba"].sudo().search([("code_promo","=",promo_gift)])
			values["name_promo"] = cek_promo.name
			values["code_promo"] = cek_promo.code_promo
		else:
			values["name_promo"] = False
			values["code_promo"] = False

		is_existing_point = values["user"]["user"]["partner_id"]["point"] * 1000
		values["is_existing_point"] = is_existing_point

		if int(active_point) == 1:
			values["active_point"] = 1
			if values["grand_total"] > is_existing_point:
				values["grand_total"] = values["grand_total"]-is_existing_point
			if values["grand_total"] < is_existing_point:
				values["grand_total"] = is_existing_point-values["grand_total"]

		# set WHTK as WHBDG 
		for location in values['products_by_location']:
			if location['area_name'] == "Toko":
				location.update({"area_name":"Bandung"})

		return request.render('theme_alkeba.alkeba_cart_address_options', values)

	@http.route("/proceed-payment", type='http', auth="user", website=True)
	def proceed_payment(self):
		values = helpers.get_response_values(
			[
				{'label': "Keranjang Belanja", 'path': 'cart', 'active': False},
				{'label': "Pilih Pengiriman", 'path': 'proceed-checkout', 'active': False},
				{'label': "Pembayaran", 'path': 'proceed-payment', 'active': True},
			], user=True
		)

		values = helpers.get_order_summary(values)	

		total_shipping_price = request.session.get('total_shipping_price', 'Default Value')
		cod_ok = request.session.get('cod_ok')

		if total_shipping_price:
			values["grand_total"] += total_shipping_price
		else:
			values["grand_total"] = values["grand_total"]

		# if cod_ok == True:
		# 	values['cod_ok'] = True
		# else:
		# 	values['cod_ok'] = False
		
		values["point"] = int(values["grand_total"]/100000)

		user_id = request.env.user
		order_model = request.env['sale.order'].sudo()
		# product_model = request.env['product.template'].sudo()

		# make sure transaksi harus paid atau tidak
		user_order_ids = order_model.search([('partner_id', '=', user_id.partner_id.id)])
		
		if len(user_order_ids) < 3:
			values['status_cod'] = False

		if len(user_order_ids) >= 3:
			values['status_cod'] = True

		if values["grand_total"] < float(10000):
			values["check_va_baca"] = False
		else:
			values["check_va_baca"] = True

		url = str(request.httprequest.url)
		parsed_url = urlparse(url)
		params = parse_qs(parsed_url.query)

		active_point = params.get("ap")[0]
		# is_courier = params.get("cr")[0]
		# product_service_id = product_model.browse([int(is_courier)])

		if "prg" in params:
			promo_gift = params.get("prg")[0]
			cek_promo = request.env["promo.gift.alkeba"].sudo().search([("code_promo","=",promo_gift)])
			values["name_promo"] = cek_promo.name
			values["code_promo"] = cek_promo.code_promo
		else:
			values["name_promo"] = False
			values["code_promo"] = False

		is_existing_point = values["user"]["user"]["partner_id"]["point"] * 1000
		values["current_point"] = values["user"]["user"]["partner_id"]["point"]
		values["is_existing_point"] = is_existing_point
		# values["courier_id"] = product_service_id.id
		# values["courier_name"] = product_service_id.name
		values["is_pelanggan_lama"] = values["user"]["user"]["partner_id"]["pelanggan_lama"]
		
		if int(active_point) == 1:
			values["active_point"] = 1
			if values["grand_total"] > is_existing_point:
				values["grand_total"] = values["grand_total"]-is_existing_point
			if values["grand_total"] < is_existing_point:
				values["grand_total"] = is_existing_point-values["grand_total"]

		if cod_ok == True:
			return request.render('theme_alkeba.alkeba_cart_payment_options', values)
		else:
			return request.render('theme_alkeba.alkeba_cart_payment_options_without_cod', values)

	@http.route("/confirm-payment", type='http', auth="user", website=True)
	def confirm_payment(self, **kwargs):
		values = helpers.get_response_values(
			[
				{'label': "Keranjang Belanja", 'path': 'cart', 'active': False},
				{'label': "Pilih Pengiriman", 'path': 'proceed-checkout', 'active': False},
				{'label': "Pembayaran", 'path': 'proceed-payment', 'active': False},
				{'label': "Konfirmasi Pembayaran", 'path': 'confirm-payment', 'active': True},
			], user=True
		)
		user_id = request.env.user
		url = str(request.httprequest.url)
		parsed_url = urlparse(url)
		params = parse_qs(parsed_url.query)

		values = helpers.get_order_summary(values)
		cart_model = request.env['cart.alkeba'].sudo()
		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		
		so_model = request.env["sale.order"].sudo()
		model_move = request.env["account.move"].sudo()

		exported_invoice_ids = request.session.get('exported_invoice_ids', 'Default Value')
		grand_subtotal = 0.0
		invoice_names = []

		if kwargs.get('payment-type', False):
			template = ''
			
			if params.get("prg"):
				promo_gift = params.get("prg")[0]
				cek_promo = request.env["promo.gift.alkeba"].sudo().search([("code_promo","=",promo_gift)])
				values["name_promo"] = cek_promo.name
				values["code_promo"] = cek_promo.code_promo
			else:
				values["name_promo"] = False
				values["code_promo"] = False

			if kwargs.get('payment-type') == 'cod':
				template = 'theme_alkeba.alkeba_cart_confirmed_payment_cod'

				if exported_invoice_ids:
					for invoice_id in exported_invoice_ids:
						get_move_id = model_move.browse(invoice_id)
						get_so = so_model.browse(get_move_id.so_id)

						grand_subtotal += get_so.amount_total
						invoice_names.append(get_move_id.name)

				list_product = []
				for loop_order_line_id in get_so.order_line:
					if loop_order_line_id.product_id.detailed_type != 'service':
						vals = {
							"product_id":loop_order_line_id.product_id.id,
							"product_name":loop_order_line_id.product_id.name,
							"qty":int(loop_order_line_id.product_uom_qty),
						}
						list_product.append(vals)

					if loop_order_line_id.product_id.detailed_type == 'service':
						values["courier_product_name"] = loop_order_line_id.product_id.name

				if grand_subtotal and invoice_names:
					values["grand_total"] = grand_subtotal
					values['invoice_number'] = invoice_names

				for loop_list_product in list_product:
					for loop_product_cart in cart_id.cart_line_ids:
						if loop_list_product["product_id"] == loop_product_cart.product_id.id:
							loop_product_cart.write({
								"qty":loop_product_cart.qty-loop_list_product["qty"]
							})

						if loop_product_cart.qty < 0:
							loop_product_cart.write({
								"qty":int(0)
							})

			elif kwargs.get('payment-type') == 'shop':
				template = 'theme_alkeba.alkeba_cart_confirmed_payment_in_shop'

				if exported_invoice_ids:
					for invoice_id in exported_invoice_ids:
						get_move_id = model_move.browse(invoice_id)
						get_so = so_model.browse(get_move_id.so_id)

						grand_subtotal += get_so.amount_total
						invoice_names.append(get_move_id.name)

				list_product = []
				for loop_order_line_id in get_so.order_line:
					if loop_order_line_id.product_id.detailed_type != 'service':
						vals = {
							"product_id":loop_order_line_id.product_id.id,
							"product_name":loop_order_line_id.product_id.name,
							"qty":int(loop_order_line_id.product_uom_qty),
						}
						list_product.append(vals)

					if loop_order_line_id.product_id.detailed_type == 'service':
						values["courier_product_name"] = loop_order_line_id.product_id.name

				if grand_subtotal and invoice_names:
					values["grand_total"] = grand_subtotal
					values['invoice_number'] = invoice_names

				for loop_list_product in list_product:
					for loop_product_cart in cart_id.cart_line_ids:
						if loop_list_product["product_id"] == loop_product_cart.product_id.id:
							loop_product_cart.write({
								"qty":loop_product_cart.qty-loop_list_product["qty"]
							})

						if loop_product_cart.qty < 0:
							loop_product_cart.write({
								"qty":int(0)
							})

			elif kwargs.get('payment-type') in const.VIRTUAL_ACCOUNT_CODE:
				values['payment_option'] = kwargs.get('popt', False)
				values['account_number'] = kwargs.get('vanm', False)
				values['expired_date'] = kwargs.get('expd', False)
				values['invoice_number'] = kwargs.get('inv', False)
				template = 'theme_alkeba.alkeba_cart_confirmed_payment_va'

				if values['expired_date']:
					iso8601_date_str = str(values['expired_date'])
					iso8601_date_str_stripped = iso8601_date_str.rstrip('Z')
					iso8601_date = datetime.strptime(iso8601_date_str_stripped, '%Y-%m-%dT%H:%M:%S.%f')
					virtual_acc_exp_date = iso8601_date.strftime('%Y-%m-%d %H:%M:%S')

				if values['account_number']:
					if exported_invoice_ids:
						for invoice_id in exported_invoice_ids:
							get_move_id = model_move.browse(invoice_id)
							get_so = so_model.browse(get_move_id.so_id)

							get_so.write({
								"virtual_acc": values['account_number'],
								"virtual_acc_exp_date": virtual_acc_exp_date
							})

							grand_subtotal += get_so.amount_total
							invoice_names.append(get_move_id.name)

					list_product = []
					for loop_order_line_id in get_so.order_line:
						if loop_order_line_id.product_id.detailed_type != 'service':
							vals = {
								"product_id":loop_order_line_id.product_id.id,
								"product_name":loop_order_line_id.product_id.name,
								"qty":int(loop_order_line_id.product_uom_qty),
							}
							list_product.append(vals)

						if loop_order_line_id.product_id.detailed_type == 'service':
							values["courier_product_name"] = loop_order_line_id.product_id.name

					if grand_subtotal and invoice_names:
						values["grand_total"] = grand_subtotal
						values['invoice_number'] = invoice_names

					for loop_list_product in list_product:
						for loop_product_cart in cart_id.cart_line_ids:
							if loop_list_product["product_id"] == loop_product_cart.product_id.id:
								loop_product_cart.write({
									"qty":loop_product_cart.qty-loop_list_product["qty"]
								})

							if loop_product_cart.qty < 0:
								loop_product_cart.write({
									"qty":int(0)
								})

		return request.render(template, values)

	@http.route("/add-to-cart", type='json', auth="user", website=True)
	def add_to_cart(self):
		cart_model = request.env['cart.alkeba'].sudo()
		product_model = request.env['product.product'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		if not cart_id:
			cart_id = cart_model.sudo().create({'user_id': user_id.partner_id.id})

		pricelist_id_config = request.env['ir.config_parameter'].sudo().get_param('theme_alkeba.website_pricelist_id')
		pricelist_id = False
		if pricelist_id_config:
			pricelist_id = request.env['product.pricelist'].sudo().browse(int(pricelist_id_config))

		# product_id = product_model.browse(params['product_id'])
		product_id = product_model.search([("product_tmpl_id","=",params['product_id'])])
       
		unit_price = product_id.list_price
		if pricelist_id:
			pricelist_price = pricelist_id.get_product_price(product_id, 1, user_id.partner_id)
			unit_price = helpers.get_product_price(unit_price, pricelist_price)

		is_in_cart = False
		for cart_line in cart_id.cart_line_ids:
			if cart_line.product_id.id == product_id.id and cart_line.location_id.id == params['location']:
				is_in_cart = True
				break
	
		if not is_in_cart:
			cart_id.cart_line_ids = [(0, False, {
				'product_id': product_id.id,
				'qty': params['quantity'],
				'price': unit_price,
				'location_id': params['location']
			})]
		else:
			cart_line_id = cart_id.cart_line_ids.filtered(
				lambda line: line.product_id.id == product_id.id and line.location_id.id == params['location']
			)
			cart_line_id.qty = cart_line_id.qty + params['quantity']
			cart_line_id.price = unit_price

		response = {'status': 200}
		return json.dumps(response)

	@http.route("/remove-from-cart", type='json', auth="user", website=True)
	def remove_from_cart(self):
		cart_model = request.env['cart.alkeba'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		line_id = False
		for cart_line in cart_id.cart_line_ids:
			if cart_line.product_id.id == params['product_id'] and cart_line.location_id.id == params['location_id']:
				line_id = cart_line.id
				break

		if line_id:
			cart_id.cart_line_ids = [(2, line_id)]

		response = {'status': 200}
		return json.dumps(response)

	@http.route("/bulk-remove-from-cart", type='json', auth="user", website=True)
	def bulk_remove_from_cart(self):
		cart_model = request.env['cart.alkeba'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		line_id = False
		for product_line in params['products']:
			for cart_line in cart_id.cart_line_ids:
				if cart_line.product_id.id == product_line['product_id'] and \
						cart_line.location_id.id == product_line['location_id']:
					line_id = cart_line.id
					break

			if line_id:
				cart_id.cart_line_ids = [(2, line_id)]

		response = {'status': 200}
		return json.dumps(response)

	@http.route("/check-product", type='json', auth="user", website=True)
	def check_product(self):
		cart_model = request.env['cart.alkeba'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		for cart_line in cart_id.cart_line_ids:
			if cart_line.product_id.id == params['product_id'] and cart_line.location_id.id == params['location_id']:
				cart_line.is_checked = params['is_checked']
				break

		list_promo_gift = list()
		subtotal = sum(cart_id.cart_line_ids.filtered(lambda line: line.is_checked).mapped('total_price'))
		promo_gift_line_ids = helpers._get_promo_gift_customer()
		if promo_gift_line_ids:
			for loop_gift_promo in promo_gift_line_ids:
				if subtotal >= loop_gift_promo.min_order:
					list_promo_gift.append({
						"name":loop_gift_promo.name,
						"code_promo":loop_gift_promo.code_promo
					})

		response = {
			'status': 200, 
			'subtotal': subtotal,
			'promo_gift':list_promo_gift
		}

		return json.dumps(response)

	@http.route("/check-products", type='json', auth="user", website=True)
	def check_products(self):
		cart_model = request.env['cart.alkeba'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		for product_line in params['products']:
			for cart_line in cart_id.cart_line_ids:
				if cart_line.product_id.id == product_line['product_id'] and \
						cart_line.location_id.id == product_line['location_id']:
					cart_line.is_checked = product_line['is_checked']
					break

		list_promo_gift = list()
		subtotal = sum(cart_id.cart_line_ids.filtered(lambda line: line.is_checked).mapped('total_price'))
		promo_gift_line_ids = helpers._get_promo_gift_customer()
		if promo_gift_line_ids:
			for loop_gift_promo in promo_gift_line_ids:
				if subtotal >= loop_gift_promo.min_order:
					list_promo_gift.append({
						"name":loop_gift_promo.name,
						"code_promo":loop_gift_promo.code_promo
					})

		response = {
			'status': 200, 
			'subtotal': subtotal,
			'promo_gift':list_promo_gift
		}
		# response = {'status': 200, 'subtotal': subtotal}
		# return json.dumps(response)
		return json.dumps(response)

	@http.route("/pm-product-quantity", type='json', auth="user", website=True)
	def pm_product_quantity(self):
		cart_model = request.env['cart.alkeba'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)
		pricelist_id_config = request.env['ir.config_parameter'].sudo().get_param('theme_alkeba.website_pricelist_id')
		pricelist_id = False
		if pricelist_id_config:
			pricelist_id = request.env['product.pricelist'].sudo().browse(int(pricelist_id_config))

		product = {}
		for cart_line in cart_id.cart_line_ids:
			if cart_line.product_id.id == params['product_id'] and cart_line.location_id.id == params['location_id']:
				cart_line.qty = params['quantity']
				unit_price = cart_line.product_id.list_price
				if pricelist_id:
					pricelist_price = pricelist_id.get_product_price(cart_line.product_id, 1, user_id.partner_id)
					unit_price = helpers.get_product_price(unit_price, pricelist_price)

				product = {
					'product_id': cart_line.product_id.id,
					'product_name': cart_line.product_id.name,
					'product_weight': cart_line.product_id.weight,
					'product_weight_uom': cart_line.product_id.weight_uom_name,
					'product_sku': cart_line.product_id.barcode,
					'qty': cart_line.qty,
					'price': unit_price,
					'subtotal': cart_line.total_price,
					'notes': cart_line.notes,
				}
				break
		list_promo_gift = list()
		subtotal = sum(cart_id.cart_line_ids.filtered(lambda line: line.is_checked).mapped('total_price'))
		promo_gift_line_ids = helpers._get_promo_gift_customer()
		if promo_gift_line_ids:
			for loop_gift_promo in promo_gift_line_ids:
				if subtotal >= loop_gift_promo.min_order:
					list_promo_gift.append({
						"name":loop_gift_promo.name,
						"code_promo":loop_gift_promo.code_promo
					})

		response = {
			'status': 200, 
			'product': product, 
			'subtotal': subtotal,
			'promo_gift':list_promo_gift
		}
		return json.dumps(response)

	@http.route("/change-notes", type='json', auth="user", website=True)
	def change_notes(self):
		cart_model = request.env['cart.alkeba'].sudo()
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		cart_id = cart_model.search([('user_id', '=', user_id.partner_id.id)], limit=1)

		for cart_line in cart_id.cart_line_ids:
			if cart_line.product_id.id == params['product_id'] and cart_line.location_id.id == params['location_id']:
				cart_line.notes = params['notes']
				break

		response = {'status': 200}
		return json.dumps(response)

	@http.route("/create-update-new-order", type='json', auth="user", website=True)
	def create_update_new_order(self):
		user_id = request.env.user
		req_dict = request.jsonrequest
		params = req_dict['params']

		product_model = request.env['product.template'].sudo()
		product_service_ids = product_model.search([('name', '=', params["courier"])])
		product_courier_ids = [product_service.id for product_service in product_service_ids]

		helpers.create_update_new_order(params)
		return json.dumps({'result': 200, "product_courier_ids": product_courier_ids})

	@http.route("/add-update-payment", type='json', auth="user", website=True)
	def add_update_payment(self):
		req_dict = request.jsonrequest
		params = req_dict['params']
		other_payment = ["cod","shop"]

		so_model = request.env['sale.order'].sudo()
		user_id = request.env.user

		order_quotation_ids = helpers.add_or_update_payment_option(params['payment_option'])
		raw_external_id = str(order_quotation_ids)
		external_id = raw_external_id.replace(" ", "")
		va_amount_total = 0.0

		order_quotation_response = {
			'payment_option': params['payment_option'],
			'external_id': external_id,
		}

		if params['payment_option'] not in other_payment:
			xendit_bank = const.XENDIT_BANK_CODE[params['payment_option']]
			order_quotation_response['bank_code'] = xendit_bank

			for order_quotation in order_quotation_ids:
				so_id = so_model.browse(order_quotation)
				customer_name = so_id.partner_id.name
				va_amount_total += so_id.amount_total
				
			order_quotation_response['expected_amount'] = va_amount_total
			order_quotation_response['customer_name'] = customer_name

			helpers.unlink_user_cart(so_id, user_id)

			return json.dumps({'result': 200, 'order_quotations': order_quotation_response})

		elif params['payment_option'] in other_payment:
			order_quotation_response['bank_code'] = params['payment_option']
			
			for order_quotation in order_quotation_ids:
				so_id = so_model.browse(order_quotation)
				customer_name = so_id.partner_id.name
			
			order_quotation_response['customer_name'] = customer_name
			helpers.unlink_user_cart(so_id, user_id)

			return json.dumps({'result': 200, 'order_quotations': order_quotation_response})

	@http.route("/check-address", type='json', auth="public", csrf=False)
	def check_address(self, **kw):
		get_users_object = request.env["res.users"].browse([(kw['user_id'])])
		get_primary_address = get_users_object.partner_id.child_ids.filtered(lambda child: child.type == 'delivery' and child.activate_address and child.is_primary_address)
		
		value = dict()
		if get_primary_address.id:
			value["primary_address_id"] = get_primary_address.id
		else:
			value["primary_address_id"] = False

		return json.dumps({'result': 200, 'address_id': value})


	# callback paid from xendit
	@http.route("/paid-it", type='json', auth="public", csrf=False)
	def paid_it(self):
		req_dict = request.jsonrequest
		datetime_now = datetime.now()

		order_model = request.env["sale.order"].sudo()
		picking_model = request.env["stock.picking"].sudo()
		invoice_model = request.env["account.move"].sudo()

		notif_model = request.env["mail.notification"].sudo()
		is_config_param = request.env['ir.config_parameter'].sudo()

		str_of_order_list = req_dict["external_id"]
		unconfirmed_quotations = eval(f"[{str_of_order_list[1:-1]}]")

		is_can_get_point = False
		new_point = 0

		for quotation in unconfirmed_quotations:
			order_id = order_model.browse(quotation)
			picking_ids = picking_model.search([("origin","=",order_id.name)])
			invoice_id = invoice_model.search([("so_id","=",quotation)])

			# Sale Order to Delivery Order
			if order_id:
				# default Xendit key for paid VA is 'status' with value 'COMPLETED'
				if req_dict["status"] == "COMPLETED":
					order_id.action_confirm()
					order_id.write({
						"payment_state" 	: 'paid',
						"delivery_state"	: 'process',
						"virtual_acc" 		: '',
			 			# "payment_date"		: datetime_now.strftime("%d/%m/%Y %H:%M:%S")
					})

					# Just assign the points and leave it unprocessed
					new_point = order_id.partner_id.point + order_id.point
					is_can_get_point = True

					# ===> START SEND EMAIL <===
					report_template_id = None
					file_name = None
					email_vals = dict()

					report_template_id = request.env.ref('theme_alkeba.action_report_saleorder_order_process').sudo()._render_qweb_pdf(order_id.id)

					email_values = {
						'subject':'Pembayaran Berhasil dan Pesanan Sedang Diproses',
						'email_to': order_id.partner_id.email,
					}
					email_vals = email_values
					file_name = "Pembayaran Berhasil " + "- " + str(order_id.name) + " - " + str(order_id.partner_id.name)
					
					data_record = base64.b64encode(report_template_id[0])
					ir_values = {
						'name': file_name,
						'type': 'binary',
						'datas': data_record,
						'store_fname': data_record,
						'mimetype': 'application/x-pdf',
					}

					data_id = request.env['ir.attachment'].sudo().create(ir_values)
					template = order_id.template_id
					template.attachment_ids = [(6, 0, [data_id.id])]

					template.send_mail(order_id.id, email_values=email_values, force_send=True)
					template.attachment_ids = [(3, data_id.id)]
					
					order_id.message_post(
						body="Invoice Telah Terkirim", 
						subject=email_vals["subject"],
						attachment_ids= [data_id.id],
					)
					# ===> END SEND EMAIL <===

					# Create notification record
					mail_message_model = request.env["mail.message"].sudo()
					mail_message_id = mail_message_model.search([("res_id", "=", order_id.id)], limit=1)

					mail_mail_model = request.env["mail.mail"].sudo()
					mail_mail_id = mail_mail_model.search([("subject", "ilike", "Pembayaran Berhasil dan Pesanan Sedang Diproses")], limit=1)

					if mail_mail_id:
						if mail_mail_id.res_id == order_id.id:
							# Adjust the order source 
							if mail_message_id:
								notif_model.create({
									'mail_message_id': mail_message_id.id,
									'notification_type': 'email',
									'mail_mail_id': mail_mail_id.id,
									'res_partner_id': order_id.partner_id.id,
									'is_read': False,
								})

					# Send to group Whatsapp Alkeba
					# starsender_apikey_alkeba = is_config_param.get_param('starsender_apikey_alkeba_id')
					# group_name = is_config_param.get_param('group_name')

					# data_info = {
					# 	"name":order_id.name,
					# 	"total":order_id.amount_total,
					# 	"customer":order_id.partner_id.name
					# }

					# headers = {
					# 	"Content-Type":'application/json',
					# 	"Accept": "application/json",
					# 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
					# 	'apikey':str(starsender_apikey_alkeba)
					# }

					# hide for temp
					# is_url = "https://starsender.online/api/group/sendText?message=Total : "+data_info["total"]+"%0aNama SO : "+data_info["name"]+"%0aCustomer : "+data_info["customer"]+"&tujuan="+str(group_name)
					# is_url = "https://starsender.online/api/group/sendText?message=Total : Rp %s%0aNama SO : %s%0aCustomer : %s&tujuan=%s"% (data_info["total"], data_info["name"], data_info["customer"], str(group_name))
					# requests.post(is_url, headers=headers)

				# Delivery Order to Invoice 
				if picking_ids:
					for picking_id in picking_ids:
						if picking_id.state == 'assigned':
							picking_id.action_set_quantities_to_reservation()
							picking_id.button_validate()
							
							# Invoice to Paid State and Journal Post
							if invoice_id:
								if invoice_id.state == 'draft':
									invoice_id.action_post()

		# Rewrite partner point using the new one
		if is_can_get_point == True:
			order_id.partner_id.write({'point':new_point})

		return json.dumps({'result': 200})