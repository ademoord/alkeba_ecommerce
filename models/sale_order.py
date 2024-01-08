# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.http import request
from odoo import http
import requests
import base64
import datetime

class SaleOrder(models.Model):
	_inherit = 'sale.order'

	def get_alkeba_email_template(self):
		template_email_id =  self.env['mail.template'].search([('name','=','Alkeba Email Template')],limit=1).id
		if template_email_id:
			return template_email_id
		else:
			return

	def get_host_url(self):
		return request.httprequest.host_url

	courier_option = fields.Selection([
		('sp', "Self Pickup"), ('alkeba_express', "Alkeba Express")
	], string="Kurir")
	# delivery_state = fields.Selection([
	#     ('draft', "Draft"), ('packing', "Packing"), ('shipped', "Shipped"),
	#     ('received', "Received"), ('returned', "Returned"), ('done', "Done")
	# ], string="Delivery Status", default='draft')
	courier_delivery_number = fields.Char(string="Delivery Number")
	payment_option = fields.Selection([
		('cod', "COD"), ('shop', "Shop"), ('direct_debit', "Direct Debit"),
		('va_bca', "VA - BCA"), ('va_bri', "VA - BRI"), ('va_bni', "VA - BNI"),
		('va_per', "VA - Bank Permata"), ('va_man', "VA - Bank Mandiri"),
	], string="Payment Option")
	payment_state = fields.Selection([
		('draft', "Draft"), ('waiting', "Waiting Payment"), ('paid', "Paid")
	], string="Payment Status", default='draft')
	payment_date = fields.Char(string="Payment Date")
	delivery_state = fields.Selection([
		('draft', "Draft"), ('process', "Diproses"), ('deliver', "Dikirim"), ('received', "Received"), ('done', "Done")
	], string="Delivery Status", default='draft')
	host_url = fields.Char(string="Host Url", default=get_host_url)
	template_id = fields.Many2one('mail.template', string='Email Template', default=get_alkeba_email_template, required=True)
	# template_id = fields.Many2one('mail.template', string='Email Template', required=True)


	@api.onchange("payment_state")
	def onchangeDeliveryState(self):
		for record in self:
			if record.payment_state == 'paid':
				# record.delivery_state == 'process'
				self.write({'delivery_state':'process'})
			else:
				self.write({'delivery_state':'draft'})

	def send_email_with_attachment(self):
		report_template_id = None
		file_name = None
		email_vals = dict()

		if self.delivery_state == "process":
			report_template_id = self.env.ref('theme_alkeba.action_report_saleorder_order_process')._render_qweb_pdf(self.id)
			email_values = {
				'subject':'Pembayaran Berhasil dan Pesanana Sedang Di Proses',
				'email_to': self.partner_id.email,
			}
			email_vals = email_values
			file_name = "Pembayaran Berhasil " + "- " + str(self.name) + " - " + str(self.partner_id.name)

		if self.delivery_state == "deliver":
			report_template_id = self.env.ref('theme_alkeba.action_report_saleorder_order_send')._render_qweb_pdf(self.id)
			email_values = {
				'subject':'Pesanan Sedang Di Kirim',
				'email_to': self.partner_id.email,
			}
			email_vals = email_values
			file_name = "Pesanan Sedang Di Kirim " + "- " + str(self.name) + " - " + str(self.partner_id.name)

		if self.delivery_state == "received":
			report_template_id = self.env.ref('theme_alkeba.action_report_saleorder_order_done')._render_qweb_pdf(self.id)
			email_values = {
				'subject':'Pesanan Di Terima',
				'email_to': self.partner_id.email,
			}
			email_vals = email_values
			file_name = "Pesanan Di Terima " + "- " + str(self.name) + " - " + str(self.partner_id.name)
		
		if self.delivery_state == "done":
			report_template_id = self.env.ref('theme_alkeba.action_report_saleorder_order_done')._render_qweb_pdf(self.id)
			email_values = {
				'subject':'Pesanan Telah Selesai',
				'email_to': self.partner_id.email,
			}
			email_vals = email_values
			file_name = "Pesanan Telah Selesai " + "- " + str(self.name) + " - " + str(self.partner_id.name)

		data_record = base64.b64encode(report_template_id[0])
		ir_values = {
			'name': file_name,
			'type': 'binary',
			'datas': data_record,
			'store_fname': data_record,
			'mimetype': 'application/x-pdf',
		}
		# report_attachment = self.env['ir.attachment'].sudo().create(ir_values)

		data_id = self.env['ir.attachment'].create(ir_values)
		template = self.template_id
		template.attachment_ids = [(6, 0, [data_id.id])]
		# template.attachment_ids = [(4, report_attachment.id)]

		template.send_mail(self.id, email_values=email_values, force_send=True)
		template.attachment_ids = [(3, data_id.id)]
		# self.message_post(body='your message', partner_ids=[], attachment_ids=data_id.id)
		self.message_post(
			body="Invoice Telah Terkirim", 
			subject=email_vals["subject"],
			attachment_ids= [data_id.id] or None,
		)
		return

	def buttonProcess(self):
		now = datetime.datetime.now()

		# Notification Proses order
		# -------------------------
		notification_ids = [(0, 0,
			{
				'res_partner_id': self.partner_id.id,
				'notification_type': 'inbox'
			}
		)]

		self.env['mail.message'].create({
			'message_type': "notification",
			'body': "Harap di tunggu, Pesananmu sedang kami proses",
			'subject': "Pesanan "+str(self.name),
			# 'partner_ids': [(4, self.env.user.partner_id.id)],
			'partner_ids': [(4, self.partner_id.id)],
			'model': self._name,
			'res_id': self.id,
			'notification_ids': notification_ids,
			# 'author_id': self.env.user.partner_id.id
			'author_id': self.partner_id.id
		})

		# Write delivery_state
		# -----------------
		self.write({
			'delivery_state':'process',
			'payment_date': now.strftime("%m/%d/%Y, %H:%M:%S"),
			'payment_state': 'paid'
		})

		# Write point
		# -----------------
		customer_current_point = self.partner_id.point
		self.partner_id.write({
			"point": customer_current_point + self.point
		})

		# send email
		# -----------------
		self.send_email_with_attachment()

		# Confirm Invoice
		# -----------------
		# invoice_id = self.browse([(self.id)])._create_invoices()
		invoice_id = self.env["account.move"].search([("so_id","=",self._origin.id)])
		# invoice_id = self._origin._create_invoices()

		# for confirmed_order in self._origin:
		# 	confirmed_order.invoice_ids = [(4, invoice_id.id)]

		# invoice_id.action_post()
		self._origin.invoice_ids.with_context(check_move_validity=False).action_post()

		# send WA
		# -----------------
		is_config_param = self.env['ir.config_parameter']
		starsender_apikey_alkeba = is_config_param.get_param('starsender_apikey_alkeba_id')
		name_group = is_config_param.get_param('name_group')

		data_info = {
			"name":self.name,
			"total":self.amount_total,
			"customer":self.partner_id.name
		}

		headers = {
			"Content-Type":'application/json',
			"Accept": "application/json",
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
			'apikey':str(starsender_apikey_alkeba)
		}

		is_url = "https://starsender.online/api/group/sendText?message=Total : Rp "+str("{:,}".format(data_info["total"]))+"%0aNama SO : "+data_info["name"]+"%0aCustomer : "+data_info["customer"]+"&tujuan="+str(name_group)
		# is_url = "https://starsender.online/api/group/sendText?message=Total : %s %0aNama SO : %s %0aCustomer : %s&tujuan=%s"% (str(data_info["total"]), data_info["name"], data_info["customer"], str(group_name))
		requests.post(is_url, headers=headers)

		return

	def buttonDeliver(self):
		# Notification Pengiriman order
		# -----------------------------
		notification_ids = [(0, 0,
			{
				'res_partner_id': self.partner_id.id,
				'notification_type': 'inbox'
			}
		)]

		self.env['mail.message'].create({
			'message_type': "notification",
			'body': "Harap di tunggu, Pesananmu sedang dikirm",
			'subject': "Pesanan "+str(self.name),
			# 'partner_ids': [(4, self.env.user.partner_id.id)],
			'partner_ids': [(4, self.partner_id.id)],
			'model': self._name,
			'res_id': self.id,
			'notification_ids': notification_ids,
			# 'author_id': self.env.user.partner_id.id
			'author_id': self.partner_id.id
		})

		# write SO delivery_state
		# ------------------------
		mutual_parent_order_ids = self.search([("number_parent_order", "=", self.number_parent_order)]).sudo()
		if len(mutual_parent_order_ids) > 1:
			for order_id in mutual_parent_order_ids:
				order_id.write({'delivery_state':'deliver'})
				order_id.send_email_with_attachment()
		else:
			order_id.write({'delivery_state':'deliver'})
			order_id.send_email_with_attachment()
			

	def buttonDeliverReceived(self):
		# Notification Penerimaan order
		# -----------------------------
		notification_ids = [(0, 0,
			{
				'res_partner_id': self.partner_id.id,
				'notification_type': 'inbox'
			}
		)]

		self.env['mail.message'].create({
			'message_type': "notification",
			'body': "Pesananmu telah di terima. Semoag kamu suka dengan produknya",
			'subject': "Pesanan "+str(self.name),
			# 'partner_ids': [(4, self.env.user.partner_id.id)],
			'partner_ids': [(4, self.partner_id.id)],
			'model': self._name,
			'res_id': self.id,
			'notification_ids': notification_ids,
			# 'author_id': self.env.user.partner_id.id
			'author_id': self.partner_id.id
		})

		# write SO delivery_state
		# ------------------------
		mutual_parent_order_ids = self.search([("number_parent_order", "=", self.number_parent_order)]).sudo()
		if len(mutual_parent_order_ids) > 1:
			for order_id in mutual_parent_order_ids:
				order_id.write({'delivery_state':'deliver'})
				order_id.send_email_with_attachment()
		else:
			order_id.write({'delivery_state':'received'})
			order_id.send_email_with_attachment()
		
	def buttonDeliverDone(self):
		# Notification Selesai order
		# --------------------------
		notification_ids = [(0, 0,
			{
				'res_partner_id': self.partner_id.id,
				'notification_type': 'inbox'
			}
		)]

		self.env['mail.message'].create({
			'message_type': "notification",
			'body': "Pesana telah selesai. Jangan lupa belanja alat kebersihan di Alkeba",
			'subject': "Pesanan "+str(self.name),
			# 'partner_ids': [(4, self.env.user.partner_id.id)],
			'partner_ids': [(4, self.partner_id.id)],
			'model': self._name,
			'res_id': self.id,
			'notification_ids': notification_ids,
			# 'author_id': self.env.user.partner_id.id
			'author_id': self.partner_id.id
		})

		# write SO delivery_state
		# ------------------------
		mutual_parent_order_ids = self.search([("number_parent_order", "=", self.number_parent_order)]).sudo()
		if len(mutual_parent_order_ids) > 1:
			for order_id in mutual_parent_order_ids:
				order_id.write({'delivery_state':'deliver'})
				order_id.send_email_with_attachment()
		else:
			order_id.write({'delivery_state':'done'})
			order_id.send_email_with_attachment()