from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from database.Tablas.user_auth import verify_user
from database.config import get_db, close_connection
from functools import wraps
from func.texto import extraerTexto
import os
import bcrypt
import mysql.connector
from datetime import datetime
from datetime import timedelta

app = Flask(__name__, template_folder='src/templates', static_folder='src/static')
app.secret_key = 'your_secret_key'

# Configura la duración de la sesión
app.permanent_session_lifetime = timedelta(minutes=240)

def get_data():
    fecha = datetime.now()
    hoy = fecha.strftime('%Y-%m-%d')
    ayer = fecha - timedelta(days=1)
    ayer = ayer.strftime('%Y-%m-%d')
    Dias8 = fecha - timedelta(days=8)
    Dias8 = Dias8.strftime('%Y-%m-%d')
    id = session['user_id']
    queries = {
        "Detalleventas" : f'SELECT * FROM detalles;',
        "totalVentas": f'SELECT COALESCE(SUM(total),0) as total FROM tikets WHERE eliminado = 0 and fecha = \'{hoy}\' and user_id = {id}',
        "totalVentasSemana": f'SELECT COALESCE(SUM(total),0) as total FROM tikets WHERE eliminado = 0 and user_id = {id} and fecha BETWEEN \'{Dias8}\' AND \'{hoy}\'',
        "totalPagosHoy" : f'SELECT COALESCE(SUM(Saldo),0) as total FROM pagos WHERE DATE(created_at) = \'{hoy}\' and user_id = {id}',
        "totalPagosSemana" : f'SELECT COALESCE(SUM(Saldo),0) as total FROM pagos WHERE user_id = {id} and DATE(created_at) BETWEEN \'{Dias8}\' AND \'{hoy}\'',
        "Celiminados": f'SELECT COALESCE(Count(id),0) as total FROM tikets WHERE user_id = {id} and fecha = \'{hoy}\' and eliminado = 1',
        "eliminadosTotal": f'SELECT COALESCE(SUM(total),0) as total FROM tikets WHERE user_id = {id} and fecha = \'{hoy}\' and eliminado = 1',
        "premios": f'SELECT COALESCE(sum(saldo),0) as total FROM premios WHERE user_id = {id} and DATE(created_at) > \'{ayer}\'',
        "premiosSemana": f'SELECT COALESCE(sum(saldo),0) as total FROM premios WHERE user_id = {id} and DATE(created_at) BETWEEN \'{Dias8}\' AND \'{hoy}\'',
        "premiosCaducados": f'SELECT COALESCE(sum(saldo),0)as total FROM premios p WHERE user_id = {id} and p.created_at < \'{Dias8}\' AND NOT EXISTS (SELECT 1 FROM pagos pg WHERE pg.detalle_id = p.detalle_id and pg.saldo = p.saldo and p.suerte = pg.suerte)',
        "venta": 'SELECT * FROM tikets WHERE eliminado = 0 and DATE(fecha) = CURDATE()',
        "pagos": 'SELECT * FROM pagos WHERE DATE(created_at) = CURDATE()',
        "eliminados": 'SELECT * FROM tikets WHERE DATE(fecha) = CURDATE() and eliminado = 1',
        "jdia": 'SELECT * FROM diarios ORDER BY id DESC LIMIT 30',
        "matrices": 'SELECT * FROM matrizs',
        "locales": 'SELECT * FROM locals',
        "pventa": 'SELECT * FROM p_ventas',
        "limites": 'SELECT * FROM limites',
        "Ganadores": 'SELECT * FROM ganadors ORDER BY id DESC LIMIT 20',
        "Horarios": 'SELECT * FROM horarios ORDER BY id DESC LIMIT 20',        
        "Usuarios": 'SELECT * FROM users',
        "roles": 'SELECT * FROM user_roles',
    }

    db = get_db()
    cursor = db.cursor(dictionary=True)
    results = {}

    try:
        for key, query in queries.items():
            cursor.execute(query)
            results[key] = cursor.fetchall()

    finally:
        cursor.close()

    return results

def set_estadistica():
    fecha = datetime.now()
    hoy = fecha.strftime('%Y-%m-%d')
    ayer = fecha - timedelta(days=1)
    ayer = ayer.strftime('%Y-%m-%d')
    Dias8 = fecha - timedelta(days=8)
    Dias8 = Dias8.strftime('%Y-%m-%d')

    queries = {
        "Tventa": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(total),0) as total_ventas FROM tikets WHERE eliminado = 0 and fecha = \'{hoy}\' GROUP BY user_id) t ON e.id = t.user_id SET e.Tventa = t.total_ventas;',
        "TvSemana": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(total),0) as total_ventas FROM tikets WHERE eliminado = 0 and fecha BETWEEN \'{Dias8}\' AND \'{hoy}\' GROUP BY user_id) t ON e.id = t.user_id SET e.TvSemana = t.total_ventas;',
        "Tpremio": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(saldo),0) as total_premios FROM premios WHERE DATE(created_at) = \'{hoy}\' GROUP BY user_id) t ON e.id = t.user_id SET e.tpremios = t.total_premios;',
        "TpSemana": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(saldo),0) as total_premios FROM premios WHERE DATE(created_at) BETWEEN \'{Dias8}\' AND \'{hoy}\' GROUP BY user_id) t ON e.id = t.user_id SET e.tpSemana = t.total_premios;',
        "TpCaducado": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(saldo),0) as total_premios FROM premios p WHERE DATE(created_at) < \'{Dias8}\' AND NOT EXISTS (SELECT 1 FROM pagos pg WHERE pg.detalle_id = p.detalle_id and pg.saldo = p.saldo and p.suerte = pg.suerte) GROUP BY user_id) t ON e.id = t.user_id SET e.Pcaducados = t.total_premios;',
        "TpDia": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(saldo),0) as total_pagos FROM pagos WHERE DATE(created_at) = \'{hoy}\' GROUP BY user_id) t ON e.id = t.user_id SET e.Tpagos = t.total_pagos;',
        "TpgSemana": f'UPDATE estadistica e JOIN ( SELECT user_id, COALESCE(SUM(saldo),0) as total_pagos FROM pagos WHERE DATE(created_at) BETWEEN \'{Dias8}\' AND \'{hoy}\' GROUP BY user_id) t ON e.id = t.user_id SET e.TpaSemana = t.total_pagos;',
        "margen": 'UPDATE estadistica SET Mdiario = Tventa - Tpagos, Msemana = TvSemana - TpaSemana;',
        "estadistica": 'SELECT * FROM estadistica'
    }

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('INSERT INTO estadistica (id, nombre) SELECT u.id, u.name FROM users u LEFT JOIN estadistica e ON u.id = e.id WHERE e.id IS NULL')
    results = {}

    try:
        for key, query in queries.items():
            cursor.execute(query)
            results[key] = cursor.fetchall()

    finally:
        cursor.close()

    return results
  
@app.before_request
def make_session_permanent():
    session.permanent = True

def DetallesVenta(id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    query = '''
    SELECT 
        DATE_FORMAT(detalles.fecha, '%d %b') as Ffecha,
        detalles.*, 
        oganars.premio1, 
        oganars.premio2, 
        oganars.premio3, 
        oganars.premio4, 
        oganars.premio5, 
        oganars.premio6, 
        oganars.premio7, 
        oganars.premio8, 
        oganars.premio9, 
        oganars.premio10
    FROM 
        detalles
    JOIN 
        oganars ON detalles.tipo = oganars.tipo
               AND detalles.valor = oganars.valor
               AND LENGTH(detalles.juego) = oganars.digitos
    WHERE 
        detalles.tiket_id = %s;
    '''
    
    cursor.execute(query, (id,))
    detalles = cursor.fetchall()
    
    # Imprimir resultados para depuración
    
    cursor.close()
    db.close()
    
    return detalles

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_user_roles(user_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT ur.role_name
        FROM user_roles ur
        JOIN users u ON ur.id = u.roles_id
        WHERE u.id = %s
    ''', (user_id,))
    roles = [row['role_name'] for row in cursor.fetchall()]
    cursor.close()
    return roles

@app.teardown_appcontext
def teardown_db(exception):
    close_connection(exception)

@app.route('/')
@login_required
def index():
    try:
        # Borra la tabla de los premios
        db = get_db()
        with db.cursor() as cursor:
            query = 'TRUNCATE TABLE premios;'
            cursor.execute(query)
            db.commit()

        # Busca los ganadores con la primera suerte
        for i in range(1, 10):
            query = f'''
                SELECT 
                    CHAR_LENGTH(d.juego) as digi,
                    d.*
                FROM 
                    detalles d
                JOIN 
                    ganadors g 
                ON 
                    d.juego = RIGHT(g.premio{i}, CHAR_LENGTH(d.juego))
                AND 
                    d.fecha = g.fecha;
            '''
            with db.cursor(dictionary=True) as cursor:
                cursor.execute(query)
                results = cursor.fetchall()
                print(f"Resultados,{i}: {results}")
                
            for premio in results:
                query = 'SELECT * FROM tikets WHERE id = %s'
                with db.cursor(dictionary=True) as cursor:
                    cursor.execute(query, (premio['tiket_id'],))
                    tiket = cursor.fetchone()
                
                query = f'''
                SELECT premio{i} as gana 
                FROM oganars
                WHERE tipo = %s 
                AND digitos = %s 
                AND valor = %s;
                '''
                with db.cursor(dictionary=True) as cursor:
                    cursor.execute(query, (premio['tipo'], premio['digi'], premio['valor']))
                    gana = cursor.fetchone()
                    print(f"Gana: {gana}")
                if gana and gana['gana']>0:
                    query = '''
                    INSERT INTO premios (detalle_id, saldo, user_id, created_at, factura, paga, suerte)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                    '''
                    with db.cursor() as cursor:
                        cursor.execute(query, (
                            premio['id'], gana['gana'], premio['user_id'], premio['fecha'], tiket['Factura'], premio['paga'], i
                        ))
                        db.commit()
                    
        
        
        user_roles = get_user_roles(session['user_id'])
        return render_template('index.html',
                               user_roles=user_roles)
    except Exception as e:
        print(f"Error en la operación de base de datos: {e}")
        db.rollback()
        return "Ocurrió un error", 500
    finally:
        db.close()

@app.route('/component/<name>')
@login_required
def component(name):
    try:
        data = get_data()
        venta = data['venta']
        pagos = data['pagos']
        Eliminados = data['eliminados']
        Jdiarios = data['jdia']
        ganadores = data['Ganadores']
        limites = data['limites']
        horarios = data['Horarios']
        matrices = data['matrices']
        locales = data['locales']
        p_venta = data['pventa']
        Vtotal = data['totalVentas']
        Tventas = Vtotal[0]['total']
        VentasSemana = data['totalVentasSemana']
        TventasSemana = VentasSemana[0]['total']
        PagosHoy = data['totalPagosHoy']
        TpagosHoy = PagosHoy[0]['total']
        PagosSemana = data['totalPagosSemana']
        TpagosSemana = PagosSemana[0]['total']
        CEliminados = data['Celiminados']
        TCEliminados = CEliminados[0]['total']
        EliminadosTotal = data['eliminadosTotal']
        TEliminadosTotal = EliminadosTotal[0]['total']
        caducados = data['premiosCaducados']
        hoyPremios = data['premios']
        semanaPremios = data['premiosSemana']
        PremiosHoy = hoyPremios[0]['total']
        PremiosSemana = semanaPremios[0]['total']
        PremiosCaducados = caducados[0]['total']
        data2 = set_estadistica()
        estadisticas=data2['estadistica']
        DetalleVenta=data['Detalleventas']
        Usuarios=data['Usuarios']
        roles = data['roles']

        
        if not estadisticas:
            estadisticas = [{'Tventa': 0, 'TvSemana': 0, 'Tpremio': 0, 'TpSemana': 0, 'TpCaducado': 0, 'TpDia': 0, 'TpgSemana': 0, 'Mdiario': 0, 'Msemana': 0}]
        


        user_roles = get_user_roles(session['user_id'])
        
        # Verificar que el archivo de plantilla exista
        template_path = os.path.join(app.template_folder, f'components/{name}.html')
        if not os.path.exists(template_path):
            return jsonify({'error': 'Component not found'}), 404
        
        return render_template(f'components/{name}.html',
                            roles=roles,
                            Usuarios=Usuarios,
                            DetalleVenta=DetalleVenta,
                            estadisticas=estadisticas,
                            PremiosCaducados=PremiosCaducados,
                            PremiosSemana=PremiosSemana,
                            PremiosHoy=PremiosHoy,
                            TpagosHoy=TpagosHoy,
                            TpagosSemana=TpagosSemana,
                            TventasSemana=TventasSemana,
                            eliminados=Eliminados,
                            TCEliminadosTotal=TCEliminados,
                            TEliminadosTotal=TEliminadosTotal,
                            Tventas=Tventas,
                            Jdiarios=Jdiarios,
                            matrices=matrices,
                            locales=locales,
                            p_venta=p_venta,
                            limites=limites,
                            Horarios=horarios,
                            ganadores=ganadores,
                            Eliminados=Eliminados,
                            ventadelDia=venta,
                            pagosdelDia=pagos,
                            user_roles=user_roles)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': f'An error occurred {e}' }), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if not email or not password:
            return "Missing email or password", 400
        user = verify_user(email, password)
        if user:
            session['logged_in'] = True
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['print'] = user['print']
            session['email'] = user['email']
            session['roles_id'] = user['roles_id']
            session['matriz_id'] = user['matriz_id']
            session['local_id'] = user['local_id']
            session['p_venta_id'] = user['p_venta_id']
            return redirect(url_for('index'))
        else:
            error='Credenciales invalidas'
            return render_template('login.html',error=error)
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('user_id', None)
    session.pop('user_name', None)
    session.pop('print', None)
    session.pop('email', None)
    session.pop('roles_id', None)
    session.pop('matriz_id', None)
    session.pop('local_id', None)
    session.pop('p_venta_id', None)
    return redirect(url_for('login'))

@app.route('/execute_query', methods=['POST'])
def execute_query():
    query = request.json.get('query')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(query)
        results = cursor.fetchall()
        db.commit()
        cursor.close()
        for result in results:
            for key, value in result.items():
                if isinstance(value, timedelta):
                    result[key] = str(value)
        return jsonify(results)
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/user_info')
@login_required
def user_info():
    user_info = {
        'user_id': session.get('user_id'),
        'user_name': session.get('user_name'),
        'print': session.get('print'),
        'email': session.get('email'),
        'roles_id': session.get('roles_id'),
        'matriz_id': session.get('matriz_id'),
        'local_id': session.get('local_id'),
        'p_venta_id': session.get('p_venta_id')
    }
    return jsonify(user_info)
    

@app.route('/printer')
def printer():
    #Obtiene la fecha actual y la hora
    now = datetime.now()
    #######################
    imprime = session.get('print',0)
    factura = request.args.get('factura', '00000000')
    reimpresion = request.args.get('re', '0')
        
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT * FROM tikets WHERE factura = %s
    ''', (factura,))
    ide = cursor.fetchone()
    cursor.close()
    
    id = ide['id']
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT * FROM p_ventas WHERE id = %s
    ''', (ide['p_venta_id'],))
    p_venta = cursor.fetchone()
    cursor.close()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT * FROM users WHERE id = %s
    ''', (ide['user_id'],))
    user = cursor.fetchone()
    cursor.close()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT * FROM locals WHERE id = %s
    ''', (user['local_id'],))
    local = cursor.fetchone()
    cursor.close()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''
        SELECT count(id) as cantidad FROM detalles WHERE tiket_id = %s
    ''', (id,))
    cantidad = cursor.fetchone()
    cursor.close()
    if reimpresion == '1':
        Key=extraerTexto(factura, 0, 4, 0)
    else:
        Key=factura
    
    cursor = db.cursor(dictionary=True)
    detalles=DetallesVenta(id)
    ##convertir en float
    c = float(cantidad['cantidad'])
    alto = c*26+60

    return render_template('/pdfprint/print.html', 
                           imprime=imprime,
                           alto=alto,
                           TextDia = now.strftime("%d-%m-%Y %H:%M:%S"),
                           detalles=detalles,
                           local=local['nombre'],
                           punto=p_venta['npv'],
                           ide=id,
                           Key=Key,
                           fecha=ide['fecha'],
                           hora=ide['hora'],
                           total=ide['total'],)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        user_id = data.get('id')
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        matriz_id = data.get('matriz_id')
        local_id = data.get('local_id')
        p_venta_id = data.get('p_venta_id')
        role = data.get('role')
        
        if not all([name, email, matriz_id, local_id, p_venta_id, role]):
            return jsonify({'message': 'Todos los campos son requeridos, excepto la contraseña al actualizar'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        if user_id == 'ID':
            # Crear nuevo usuario
            if not password:
                return jsonify({'message': 'La contraseña es requerida para crear un nuevo usuario'}), 400
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute(f'''
                INSERT INTO users (name, email, password, matriz_id, local_id, p_venta_id, roles_id) 
                VALUES ('{name}', '{email}', '{hashed_password}', '{matriz_id}', '{local_id}', '{p_venta_id}', '{role}')
            ''')
        else:
            # Actualizar usuario existente
            if password:
                print('user_id', user_id)
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute(f'''
                    UPDATE users
                    SET name = '{name}', email = '{email}', password = '{hashed_password}', matriz_id = '{matriz_id}', local_id = '{local_id}', p_venta_id = '{p_venta_id}', roles_id = '{role}'
                    WHERE id = '{user_id}'
                ''')
            else:
                print('user_id', user_id)
                cursor.execute(f'''
                    UPDATE users
                    SET name = '{name}', email = '{email}', matriz_id = '{matriz_id}', local_id = '{local_id}', p_venta_id = '{p_venta_id}', roles_id = '{role}'
                    WHERE id = '{user_id}'
                ''')
        
        conn.commit()
        conn.close()
        
        response = jsonify({'message': 'Usuario registrado/actualizado exitosamente'})
        response.status_code = 200
        return response
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({'message': 'Error en el servidor'}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
