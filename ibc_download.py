import os, os.path
import random
import string
import sqlite3
import time
import cherrypy
import json
import re
import time

from string import digits

import urllib2


DB_STRING = "ibc.db"

URL = "http://gdurl.com/Hn4m/download"

def randomword(length):
   return ''.join(random.choice(digits) for i in range(length))
               
def setup_database():
	print ("setup db")
	with sqlite3.connect(DB_STRING) as con:
		con.execute("DROP TABLE members")
		con.execute("CREATE TABLE IF NOT EXISTS members (last_name_hebrew TEXT, first_name_hebrew TEXT, last_name_english TEXT, first_name_english TEXT, email TEXT, phone TEXT, company TEXT, position TEXT, category TEXT, tags TEXT, webpage TEXT, picurl TEXT, show_email TEXT)")
		con.execute("CREATE TABLE IF NOT EXISTS login (email TEXT, password TEXT)")

		#making all emails lower case
		con.execute("UPDATE members SET email = lower(email)")
			

			
def download():
	print ("download")
	response = urllib2.urlopen(URL)
	raw = response.read()
	
	json_object = json.loads(raw)
	
	with sqlite3.connect(DB_STRING) as con:
		for itr in json_object:
			str = "INSERT INTO members (last_name_english, first_name_english, last_name_hebrew, first_name_hebrew, email, phone, company, position, category, tags, webpage, picurl, show_email) VALUES (\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\",\"{}\")".format(itr["last_name_english"].encode('utf-8'), itr["first_name_english"].encode('utf-8'), itr["last_name_hebrew"].encode('utf-8'), itr["first_name_hebrew"].encode('utf-8'), itr["email"].encode('utf-8'), itr["phone"].encode('utf-8'), itr["company"].encode('utf-8'), itr["position"].encode('utf-8'), itr["category"].encode('utf-8'), itr["tags"].encode('utf-8'), itr["webpage"].encode('utf-8'), itr["picurl"].encode('utf-8'), itr["show_email"].encode('utf-8'))
			con.execute(str)
	
	make_passwords()
			
def make_passwords():
	print ("gen passwords")
	with sqlite3.connect(DB_STRING) as con:
		cur = con.cursor()
		cur.execute("SELECT email as email1 FROM members WHERE email1 NOT IN (SELECT email from login)")
		res = cur.fetchall();

		for index in res:
			print (index[0])
			str = "INSERT INTO login (email,password) VALUES (\"{}\",\"{}\")".format(index[0], randomword(12))
			con.execute(str)
	
	lower_case_emails()
			
def lower_case_emails():
	print ("lowercase emails")
	with sqlite3.connect(DB_STRING) as con:
		cur = con.cursor()
		cur.execute("UPDATE members SET email = LOWER(email)")
		cur.execute("UPDATE login SET email = LOWER(email)")
			
	

if __name__ == '__main__':
    setup_database()
    download()
	


	