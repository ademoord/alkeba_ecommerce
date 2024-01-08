# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request

from . import helpers

class AlkebaB2CBlogs(http.Controller):
    @http.route("/blog", type='http', auth="public", website=True)
    def blog(self):
        values = helpers.get_response_values([{'label': "Blog", 'path': 'news', 'active': True}])
        posts = http.request.env['blog.post'].search([])
        context = dict(values, posts=posts)
        return request.render('theme_alkeba.alkeba_news_list', context)

   
    @http.route("/blog/detail/<int:id>", type='http', auth="public", website=True)
    def blog_detail(self, id):
        post = http.request.env['blog.post'].sudo().search([('id', '=', id)])
        posts = http.request.env['blog.post'].search([])
        
        if not post:
            return http.request.not_found()
        
        return http.request.render('theme_alkeba.alkeba_news_detail', {
            'id': id,
            'post': post,
            'posts': posts,
        })
