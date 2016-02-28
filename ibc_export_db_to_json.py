import string
import sqlite3
import json

import urllib2


DB_STRING = "ibc.db"

def dict_factory(cursor, row):
	d = {}
	for idx, col in enumerate(cursor.description):
		d[col[0]] = row[idx]
	return d

if __name__ == '__main__':
	with sqlite3.connect(DB_STRING) as con:
			con.row_factory = dict_factory
			con.text_factory = str
			cur = con.cursor()
			cur.execute("SELECT last_name_english, first_name_english, last_name_hebrew, first_name_hebrew, email, phone, company, position, category, tags, webpage FROM members ORDER BY last_name_english")
			results = cur.fetchall()
			print json.dumps(results, ensure_ascii=False, sort_keys=True,indent=4)