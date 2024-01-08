# -*- coding: utf-8 -*-

from odoo import api, fields, models, _


class ProductCategory(models.Model):
    _inherit = 'product.category'

    icon = fields.Binary(string="Icon/Logo")


class ProductPublicCategory(models.Model):
    _inherit = 'product.public.category'

    featured = fields.Boolean(string="Featured in Home", default=False)
    short_description = fields.Char(string="Short Description")
    image_background = fields.Image("Image Background", max_width=1024, max_height=1024, store=True)
