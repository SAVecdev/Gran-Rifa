from flask import jsonify
from config import get_db

def obtener_historial():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    query = """
    SELECT fecha, tipo, premio1, premio2, premio3, premio4, premio5
    FROM ventas
    """
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    return jsonify(results)
