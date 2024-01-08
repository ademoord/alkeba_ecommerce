# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError


class HomeSlider(models.Model):
	_name = 'alkeba.home.slider'
	_inherit = ['image.mixin']
	_description = 'Home Slider'

	name = fields.Char(string="Title", required=True)
	status = fields.Boolean(string="status", default=False)
	image_ids = fields.Many2many('ir.attachment', 'home_slider_attachment_rel', string="Images")
	image1 = fields.Image(string="Image 1", required=True)
	image2 = fields.Image(string="Image 2", required=True)
	image3 = fields.Image(string="Image 3")
	image4 = fields.Image(string="Image 4")
	image5 = fields.Image(string="Image 5")

	@api.model
	def create(self, vals):
		res = super(HomeSlider, self).create(vals)
		return res

	def write(self, vals):
		res = super(HomeSlider, self).write(vals)
		return res

	@api.onchange("status")
	def onchange_activation(self):
		checking = self.search([('status', '=', True)])
		for record in self:
			if checking.id:
				checking.write({"status":False})
