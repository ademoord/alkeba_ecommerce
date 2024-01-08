# -*- coding: utf-8 -*-

from odoo import models, fields, api

class ResUsersAlkeba(models.Model):
	_inherit="res.users"

	mobile_login = fields.Char(string="Phone")