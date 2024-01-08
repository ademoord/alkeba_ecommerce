# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    website_pricelist_id = fields.Many2one('product.pricelist', string="Pricelist for Website",
                                           config_parameter='theme_alkeba.website_pricelist_id')
    website_dynamic_text = fields.Char(string="Dynamic Header Text", config_parameter='theme_alkeba.website_dynamic_text')

    # Option 1 - overriding the _compute_auth_signup() method
    # @api.onchange('website_id')
    # @api.depends('website_id.auth_signup_uninvited')
    # def _compute_auth_signup(self):
    #     if self.website_id.auth_signup_uninvited:
    #         self.website_id.write({'auth_signup_uninvited': 'b2c'})
            # self.website_id.update({"auth_signup_uninvited":self.website_id.auth_signup_uninvited})

    # Option 2 - inheriting the get_default() method
    # @api.model
    # def default_get(self, fields):
    #     defaults = super(ResConfigSettings, self).default_get(fields)
    #     if defaults['auth_signup_uninvited'] == 'b2b':
    #         defaults.update({'auth_signup_uninvited':'b2c'})

        
    #     # current_get_values = self.get_values()
    #     # print("This is current values of get_values() method:", current_get_values)
        
    #     return defaults
    
    # Option 1 with imported exceptions and using default write() method
    def write(self, vals):        
        if self.use_invoice_terms != None:
            if self.use_invoice_terms == True:
                return
            else:
                raise UserError(_("Syarat dan Ketentuan Tidak Bisa di Nonaktifkan!"))

    # Option 2 without imported exceptions and using onchange() method            
    # @api.onchange('use_invoice_terms')
    # def onchange_use_invoice_terms(self):
    #     if self.use_invoice_terms == True:
    #         return {'warning': {
    #             'title': _("WARNING"),
    #             'message': "Syarat dan Ketentuan Tidak Bisa di Nonaktifkan"
    #         }}

    @api.onchange('website_dynamic_text')
    def _onchange_website_dynamic_text(self):
        # Update the database with the new value
        self.env['ir.config_parameter'].set_param('theme_alkeba.website_dynamic_text', self.website_dynamic_text)