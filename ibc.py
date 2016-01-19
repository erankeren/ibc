import os, os.path
import random
import string
import sqlite3
import time
import cherrypy
import json

from string import digits

DB_STRING = "ibc.db"

def dict_factory(cursor, row):
	d = {}
	for idx, col in enumerate(cursor.description):
		d[col[0]] = row[idx]
	return d



class IbcWebMain(object):
    @cherrypy.expose
    def index(self):
    	if 'user' not in cherrypy.session:
    		return open('login.html')
    	return open('index.html')
    	
class IbcLoginWebService(object):
	exposed = True
	
	@cherrypy.tools.json_in()
	def POST(self):
		data = cherrypy.request.json
		with sqlite3.connect(DB_STRING) as con:
			cur = con.cursor()
			str = "SELECT * FROM login WHERE email=\"{}\" AND password=\"{}\"".format(data['user'], data['password'])
			print str
			cur.execute(str)
			results = cur.fetchall();
			print results;
			
			if results and results[0]:
				cherrypy.session['user'] = 'a@a.com';
				return json.dumps({'result': 'ok'}, ensure_ascii=False)
			else:
				return json.dumps({'result': 'failed'}, ensure_ascii=False)

class IbcLogoutWebService(object):
	exposed = True
	
	@cherrypy.expose
	def POST(self):
		cherrypy.lib.sessions.expire()
		
class IbcMembersWebService(object):
	exposed = True
	

	def GET(self):
		with sqlite3.connect(DB_STRING) as con:
			cherrypy.session['ts'] = time.time()
			con.row_factory = dict_factory
			con.text_factory = str
			cur = con.cursor()
			cur.execute("SELECT first_name_english,last_name_english,email,company,position,tags,category FROM members ORDER BY last_name_english")
			results = cur.fetchall()
			return json.dumps(results, ensure_ascii=False)
			
class IbcCategoryWebService(object):
	exposed = True
	
	def GET(self):
		with sqlite3.connect(DB_STRING) as con:
			cherrypy.session['ts'] = time.time()
			con.row_factory = dict_factory
			con.text_factory = str
			cur = con.cursor()
			cur.execute("SELECT DISTINCT category FROM members WHERE category != '' ORDER BY category")
			results = cur.fetchall()
			return json.dumps(results, ensure_ascii=False)
					

def randomword(length):
   return ''.join(random.choice(digits) for i in range(length))
               
def setup_database():
     with sqlite3.connect(DB_STRING) as con:
         con.execute("CREATE TABLE IF NOT EXISTS members (last_name_hebrew TEXT, first_name_hebrew TEXT, last_name_english TEXT, first_name_english TEXT, email TEXT, phone TEXT, company TEXT, position TEXT, category TEXT, tags TEXT, webpage TEXT)")
         con.execute("CREATE TABLE IF NOT EXISTS login (email TEXT, password TEXT)")
         
         #making all emails lower case
         con.execute("UPDATE members SET email = lower(email)");
         
         cur = con.cursor()
         cur.execute("SELECT email FROM members WHERE email NOT IN (SELECT email from login)")
         res = cur.fetchall();
         
         for index in res:
         	str = "INSERT INTO login (email,password) VALUES (\"{}\",\"{}\")".format(index[0], randomword(12))
         	con.execute(str)
         
         
if __name__ == '__main__':
     conf = {
         '/': {
             'tools.sessions.on': True,
             'tools.staticdir.root': os.path.abspath(os.getcwd())
         },
         '/logout': {
             'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
             'tools.response_headers.on': True,
             'tools.response_headers.headers': [('Content-Type', 'application/json')],
         },
         '/login': {
             'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
             'tools.response_headers.on': True,
             'tools.response_headers.headers': [('Content-Type', 'application/json')],
         },
         '/members': {
             'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
             'tools.response_headers.on': True,
             'tools.response_headers.headers': [('Content-Type', 'application/json')],
         },
         '/categories': {
             'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
             'tools.response_headers.on': True,
             'tools.response_headers.headers': [('Content-Type', 'application/json')],
         },
         '/css': {
             'tools.staticdir.on': True,
             'tools.staticdir.dir': './css'
         },
         '/js': {
             'tools.staticdir.on': True,
             'tools.staticdir.dir': './js'
         },
         '/fonts': {
             'tools.staticdir.on': True,
             'tools.staticdir.dir': './fonts'
         },
         '/img': {
             'tools.staticdir.on': True,
             'tools.staticdir.dir': './img'
         }
     }
     
     cherrypy.engine.subscribe('start', setup_database)
     
     webapp = IbcWebMain()
     webapp.login = IbcLoginWebService()
     webapp.logout = IbcLogoutWebService()
     webapp.members = IbcMembersWebService()
     webapp.categories = IbcCategoryWebService()
     cherrypy.quickstart(webapp, '/', conf)