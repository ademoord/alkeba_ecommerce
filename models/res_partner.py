# -*- coding: utf-8 -*-

from odoo import models, fields, api

class ResPartnerTheme(models.Model):
	_inherit="res.partner"

	activate_address = fields.Boolean(string="Active As Address", default="_set_first_value")
	mobile = fields.Char(compute="_get_mobile_number")

	def _get_mobile_number(self):
        # Elevate privileges to Administrator to bypass security
		self = self.sudo()
		for res in self:
			if res.mobile == False:
				res.mobile = res.user_ids.mobile_login

	def _set_first_value(self):
		if self.parent_id:
			self.activate_address = True