# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class AlkebaHomeEvent(models.Model):
    _name = 'alkeba.home.event'
    _description = "Home Event"

    name = fields.Char(string="Name", required=True)
    active = fields.Boolean(string="Active", default=True)
    background_image = fields.Image(string="Background Image", required=True)
    category_ids = fields.One2many('alkeba.home.event.category', 'event_id', string="Categories")

    @api.constrains('category_ids')
    def _constraint_category_ids(self):
        for record in self:
            if len(record.category_ids) < 6:
                raise ValidationError("Category must be 6 items.")


class AlkebaHomeEventCategory(models.Model):
    _name = 'alkeba.home.event.category'
    _description = "Home Event Category"

    event_id = fields.Many2one('alkeba.home.event', string="Event", required=True)
    category_id = fields.Many2one('product.public.category', string="Category", required=True)
