from config import get_db, close_connection

def borrar_tabla():
    with get_db() as db:
        with db.cursor() as cursor:
            query = 'TRUNCATE TABLE premios;'
            cursor.execute(query)
            db.commit()

def obtener_premios():
    with get_db() as db:
        with db.cursor(dictionary=True) as cursor:
            query = '''SELECT d.*, g.premio1 
                       FROM detalles d 
                       JOIN ganadors g 
                       ON d.juego = RIGHT(g.premio1, CHAR_LENGTH(d.juego));'''
            cursor.execute(query)
            premios = cursor.fetchall()

            for premio in premios:
                query = '''
                SELECT 
                    g.premio1 AS premio,
                    d.*
                FROM 
                    detalles d
                JOIN 
                    oganars g 
                ON 
                    g.digitos = CHAR_LENGTH(d.juego) 
                    AND g.tipo = d.tipo 
                    AND g.valor = d.valor
                WHERE
                    d.id = %s;'''
                cursor.execute(query, (premio['id'],))
                gana = cursor.fetchall()
                print(gana)

def iniciar():
    borrar_tabla()
    obtener_premios()
