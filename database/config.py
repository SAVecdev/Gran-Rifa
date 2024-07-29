import mysql.connector
from flask import g

DATABASE_CONFIG = {
    'host': 'localhost',
    'database': 'granrifa',
    'user': 'root',
    'password': 'Sav1993',
    'port': '3306'
}

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = mysql.connector.connect(
            host=DATABASE_CONFIG['host'],
            user=DATABASE_CONFIG['user'],
            password=DATABASE_CONFIG['password'],
            database=DATABASE_CONFIG['database'],
            port=DATABASE_CONFIG['port']
        )
    return db

def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
