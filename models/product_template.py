# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.addons.http_routing.models.ir_http import slug, unslug


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    show_in_website = fields.Boolean(string="Show in Website", default=False)

    def _compute_website_url(self):
        super(ProductTemplate, self)._compute_website_url()
        for product in self:
            if product.id:
                product.website_url = "/product/%s" % slug(product)

    def show_product_in_website(self):
        for record in self:
            record.show_in_website = True

    def hide_product_in_website(self):
        for record in self:
            record.show_in_website = False
