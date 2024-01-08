# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request

from . import helpers, pagination
import logging

_logger = logging.getLogger(__name__)


class AlkebaB2CPromo(http.Controller):
	@http.route("/promo", type='http', auth="public", website=True)
	def promo(self, **kwargs):
		# paging params
		page = kwargs.get('page', False)
		limit = kwargs.get('limit', False)
		sort = kwargs.get('sort', False)

		# response
		values = helpers.get_response_promo_values([{'label': "Promo", 'path': 'promo', 'active': True}])

		# promo
		page = int(page) if page else 1
		limit = int(limit) if limit else 20
		sort = sort if sort else None

		# initialize pager for promo objects as static NULL data
		pager = {
			# 'data': data,
			'total_rows': 0,
			'total_pages': 0,
			'page': 0,
			'limit': 0,
			# 'sort': sort,
			'showing': 0
		}

		# Check if the 'promo.gift.alkeba' model exists
		try:
			request.env['promo.gift.alkeba']
			pager = pagination.paginate(model='promo.gift.alkeba', page=page, limit=limit, sort=sort)
		except KeyError:
			_logger.warning("The 'promo.gift.alkeba' model does not exist in the database.")

		values['pagination'] = pager

		list_customer_promo_gift = helpers._get_promo_gift_customer()
	
		values['promo'] = list_customer_promo_gift

		return request.render('theme_alkeba.alkeba_promo_list', values)

	@http.route("/detail_promo_gift/<int:promo_id>", type='http', auth="public", website=True)
	def promo_detail(self, promo_id):
		values = helpers.get_response_values([
			{'label': "Promo Gift", 'path': 'promo', 'active': False},
			{'label': "Detail Promo Gift", 'path': 'promo', 'active': True}
		])


		promo_gift_model = request.env["promo.gift.alkeba"].sudo()

		values["promo_detail"] = promo_gift_model.browse([promo_id])

		user_id = request.env.user
		promo_gift_lines_model = request.env["promo.gift.lines.alkeba"].sudo()
		other_promo = promo_gift_lines_model.search([("promo_gift_id","!=",promo_id),("customer_id","=",user_id.partner_id.id),("state_gift","=","active")])

		values["other_promo"] = other_promo
		values["len_other_promo"] = len(values["promo_detail"])

		return request.render('theme_alkeba.alkeba_detail_promo_gift', values)
