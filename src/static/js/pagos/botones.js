async function verificar(query) {
    const result = await fetch('/execute_query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });
    return result.json();
}
async function openReimpresion(factura) {
    var modal = document.getElementById("print");
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        pdfFrame.src = `/printer?factura=${factura}&re=1`;
    } else {
        console.error('No se encontró el modal');
    }
}
async function eliminar(id){
    const query = `update tikets set eliminado = 1 WHERE id = ${id};`;
    const result = await verificar(query);
    if (result.error) {
        console.error(result.error);
    } else {
        const query2 = ` UPDATE detalles SET eliminado = 1 WHERE tiket_id = ${id};`;
        const result2 = await verificar(query2);
        if (result2.error) {
            console.error(result2.error);
        } else {
            location.reload();
        }
    }
    
}
function toggleDetails(id) {
    // Ocultar todas las filas de detalles
    Array.from(document.getElementsByClassName('detallesVenta')).forEach((element) => {
        element.style.display = 'none';
    });
    // Mostrar la fila de detalles correspondiente al id
    document.getElementById('D-' + id).style.removeProperty('display');
}
function Agregar(){
    var modal = document.getElementById("Winercreate");
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    document.getElementById('idEdit').innerHTML = 'ID';
    document.getElementById('fechaedit').type = 'date';
    document.getElementById('fechaedit').value = '';
    document.getElementById('fechaedit').readOnly = false;
    document.getElementById('tipoedit').value = '';
    document.getElementById('premio1edit').value = '';
    document.getElementById('premio2edit').value = '';
    document.getElementById('premio3edit').value = '';
    document.getElementById('premio4edit').value = '';
    document.getElementById('premio5edit').value = '';
    document.getElementById('premio6edit').value = ''
    document.getElementById('premio7edit').value = '';
    document.getElementById('premio8edit').value = '';
    document.getElementById('premio9edit').value = '';
    document.getElementById('premio10edit').value = '';
}
async function editar(id){
    Agregar();
    data=await verificar(`SELECT * FROM ganadors WHERE id = ${id};`);
    document.getElementById('idEdit').innerHTML = data[0].id;
    document.getElementById('fechaedit').type = 'text';
    document.getElementById('fechaedit').value = data[0].fecha;
    document.getElementById('fechaedit').readOnly = true;
    document.getElementById('tipoedit').value = data[0].tipo;
    document.getElementById('premio1edit').value = data[0].premio1;
    document.getElementById('premio2edit').value = data[0].premio2;
    document.getElementById('premio3edit').value = data[0].premio3;
    document.getElementById('premio4edit').value = data[0].premio4;
    document.getElementById('premio5edit').value = data[0].premio5;
    document.getElementById('premio6edit').value = data[0].premio6
    document.getElementById('premio7edit').value = data[0].premio7;
    document.getElementById('premio8edit').value = data[0].premio8;
    document.getElementById('premio9edit').value = data[0].premio9;
    document.getElementById('premio10edit').value = data[0].premio10;
}
function agregarDiario(){
    mostrarmodal()
    document.getElementById('idEditDiario').innerHTML = 'ID';
    document.getElementById('DiarioUA').innerText = 'Agregar';
    document.getElementById('fechaeditDiario').type = 'date';
    document.getElementById('fechaeditDiario').value = '';
    document.getElementById('fechaeditDiario').readOnly = false;
    document.getElementById('tipoeditDiario').value = '';
}
async function editarDiario(id){
    mostrarmodal()
    buscar= await verificar(`select * from diarios where id = ${id};`);
    document.getElementById('DiarioUA').innerText = 'Editar';
    document.getElementById('idEditDiario').innerHTML = buscar[0].id;
    fecha=document.getElementById('fechaeditDiario');
    tipo=document.getElementById('tipoeditDiario');
    fecha.type = 'text';
    fecha.value = buscar[0].fecha;
    tipo.value = buscar[0].tipo;
    fecha.readOnly = true;
}
async function nuevoDiario(){
    
    fecha=document.getElementById('fechaeditDiario').value;
    tipo=document.getElementById('tipoeditDiario').value;
    if (fecha == '' || tipo == ''){
        alert('Llene todos los campos');
    } else {
        id=document.getElementById('idEditDiario').innerHTML;
        if(id != 'ID'){
            alert ('se va a actualizar los datos');
            await verificar(`UPDATE diarios SET tipo = '${tipo}' WHERE id = ${id};`);
            location.reload();  
        } else {
            await verificar(`INSERT INTO diarios (fecha, tipo) VALUES ('${fecha}', '${tipo}');`);
            location.reload();          
    }
}
}
function mostrarmodal(){
    var modal = document.getElementById("DiarioJ");
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
}
function EliminarDiario(id){
    if (confirm('¿Seguro que desea eliminar este diario?')){
        verificar(`DELETE FROM diarios WHERE id = ${id};`);
        location.reload();
    }
}
function CerrarModalDiario(){
    var modal = document.getElementById("DiarioJ");
    if (modal) {
        modal.classList.add('hidden');
    } else {
        console.error('No se encontró el modal');
    }
}
function CerrarModalGanador(){
    var modal = document.getElementById("Winercreate");
    if (modal) {
        modal.classList.add('hidden');
    } else {
        console.error('No se encontró el modal');
    }
}
function agregarEditarGanador(){
    fecha=document.getElementById('fechaedit').value;
    tipo=document.getElementById('tipoedit').value;
    premio1=document.getElementById('premio1edit').value;
    premio2=document.getElementById('premio2edit').value;
    premio3=document.getElementById('premio3edit').value;
    premio4=document.getElementById('premio4edit').value;
    premio5=document.getElementById('premio5edit').value;
    premio6=document.getElementById('premio6edit').value;
    premio7=document.getElementById('premio7edit').value;
    premio8=document.getElementById('premio8edit').value;
    premio9=document.getElementById('premio9edit').value;
    premio10=document.getElementById('premio10edit').value;
    if (fecha == '' || tipo == '' || premio1 == '' || premio2 == '' || premio3 == '' || premio4 == '' || premio5 == '' || premio6 == '' || premio7 == '' || premio8 == '' || premio9 == '' || premio10 == ''){
        alert('Llene todos los campos');
    } else {
        id=document.getElementById('idEdit').innerHTML;
        if(id != 'ID'){
            alert ('se va a actualizar los datos');
            verificar(`UPDATE ganadors SET tipo = '${tipo}', premio1 = '${premio1}', premio2 = '${premio2}', premio3 = '${premio3}', premio4 = '${premio4}', premio5 = '${premio5}', premio6 = '${premio6}', premio7 = '${premio7}', premio8 = '${premio8}', premio9 = '${premio9}', premio10 = '${premio10}' WHERE id = ${id};`);
            location.reload();  
        } else {
            verificar(`INSERT INTO ganadors (fecha, tipo, premio1, premio2, premio3, premio4, premio5, premio6, premio7, premio8, premio9, premio10) VALUES ('${fecha}', '${tipo}', '${premio1}', '${premio2}', '${premio3}', '${premio4}', '${premio5}', '${premio6}', '${premio7}', '${premio8}', '${premio9}', '${premio10}');`);
            location.reload();
        }
    }    
}
function elimnarGanadores(id){
    if (confirm('¿Seguro que desea eliminar este ganador?')){
        verificar(`DELETE FROM ganadors WHERE id = ${id};`);
        location.reload();
    }
}
function AbrirModallimite(){
    modal = document.getElementById('modallimite');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    document.getElementById('idLimite').innerHTML = 'ID';
    document.getElementById('DigitoLimite').value = '';
    document.getElementById('localLimite').value = '';
    document.getElementById('LimiteSaldo').value = '';
}
function cerrarModalLimite(){
    modal = document.getElementById('modallimite');
    if (modal) {
        modal.classList.add('hidden');
    } else {
        console.error('No se encontró el modal');
    }
}
async function editarLimite(id){
    AbrirModallimite();
    data=await verificar(`SELECT * FROM limites WHERE id = ${id};`);
    document.getElementById('idLimite').innerHTML = data[0].id;
    document.getElementById('DigitoLimite').value = data[0].digito;
    document.getElementById('localLimite').value = data[0].local_id;
    document.getElementById('LimiteSaldo').value = data[0].limite;
}
function guardarLimite(){
    digito=document.getElementById('DigitoLimite').value;
    local=document.getElementById('localLimite').value;
    limite=document.getElementById('LimiteSaldo').value;
    id=document.getElementById('idLimite').innerHTML;
    if (digito == '' || local == '' || limite == ''){
        alert('Llene todos los campos');
    } else {
        if(id != 'ID'){
            alert('Se va a actualizar los datos');
            verificar(`UPDATE limites SET digito = ${digito}, local_id = ${local}, limite = ${limite} WHERE id = ${id};`);
            location.reload();  
        } else {
            verificar(`INSERT INTO limites (digito, local_id, limite) VALUES (${digito}, ${local}, ${limite});`);
            location.reload();
        }
    }
}
function abirmodalHorario(){
    modal = document.getElementById('modalHorario');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    
    document.getElementById('idhorarios').innerHTML = 'ID';
    document.getElementById('fechaHorario').type = 'date';
    document.getElementById('fechaHorario').value = '';
    document.getElementById('salidaHora').value = '';
    document.getElementById('entradaHora').value = '';
    document.getElementById('localHorarios').value = '';
}
function cerrarModalHorario(){
    modal = document.getElementById('modalHorario');
    if (modal) {
        modal.classList.add('hidden');
    } else {
        console.error('No se encontró el modal');
    }
}
function guardarHorario(){
    fecha=document.getElementById('fechaHorario').value;
    salida=document.getElementById('salidaHora').value;
    entrada=document.getElementById('entradaHora').value;
    local=document.getElementById('localHorarios').value;
    id=document.getElementById('idhorarios').innerHTML;
    if (salida == '' || entrada == '' || local == ''){
        alert('Llene todos los campos');
    } else {
        if(id != 'ID'){
            alert('Se va a actualizar los datos');
            verificar(`UPDATE horarios SET hora_entrada = '${entrada}', hora_salida = '${salida}' WHERE id = ${id};`);
            location.reload();  
        } else {
            verificar(`INSERT INTO horarios (fecha, hora_entrada, hora_salida, local_id) VALUES ('${fecha}', '${entrada}', '${salida}', ${local});`);
            location.reload();
        }
    }
}
async function editarHorario(id){
    abirmodalHorario();
    data= await verificar(`SELECT * FROM horarios WHERE id = ${id};`);
    document.getElementById('idhorarios').innerHTML = data[0].id;
    document.getElementById('fechaHorario').type = 'text';
    document.getElementById('fechaHorario').readOnly = true;
    document.getElementById('fechaHorario').value = data[0].fecha;
    var hora = convertirHora(data[0].hora_salida);
    var hora2 = convertirHora(data[0].hora_entrada);
    document.getElementById('salidaHora').value = hora;
    document.getElementById('entradaHora').value = hora2;
    document.getElementById('localHorarios').value = data[0].local_id;
}
async function EliminarHorarioid(id){
    if (confirm('¿Seguro que desea eliminar este horario?')){
        verificar(`DELETE FROM horarios WHERE id = ${id};`);
        location.reload();
    }
}
function esconderLosFormularios(){
    document.querySelectorAll('.formularioUser').forEach(function(form) {
        form.classList.add('hidden');
    });
}
function AbrirModalMatriz(){
    esconderLosFormularios();
    modal = document.getElementById('formMatriz');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    document.getElementById('idMatriz').innerHTML = 'ID';
    document.getElementById('nombreDistrito').value = '';
}
function guardarMatriz(){
    nombre=document.getElementById('nombreDistrito').value;
    id=document.getElementById('idMatriz').innerHTML;
    hoy = new Date();
    if (nombre == ''){
        alert('Llene todos los campos');
    } else {
        if(id != 'ID'){
            alert('Se va a actualizar los datos');
            verificar(`UPDATE matrizs SET nombre = '${nombre}' WHERE id = ${id};`);
            location.reload();  
        } else {
            verificar(`INSERT INTO matrizs (nombre, created_at) VALUES ('${nombre}', '${hoy}');`);
            location.reload();
        }
    }
}
async function EditarDistrito(id){
    esconderLosFormularios();
    AbrirModalMatriz();
    data= await verificar(`SELECT * FROM matrizs WHERE id = ${id};`);
    console.log(data);
    document.getElementById('idMatriz').innerHTML = data[0].id;
    document.getElementById('nombreDistrito').value = data[0].nombre;
}
function EliminarDistrito(id){
    if (confirm('¿Seguro que desea eliminar este distrito?')){
        verificar(`DELETE FROM matrizs WHERE id = ${id};`);
        location.reload();
    }
}
function masMatriz(id){
    Array.from(document.getElementsByClassName('locales')).forEach((element) => {
        element.style.display = 'none';
    });
    // Mostrar la fila de detalles correspondiente al id
    document.getElementById('L-' + id).style.removeProperty('display');
}
function masLocal(id){
    Array.from(document.getElementsByClassName('Pventa')).forEach((element) => {
        element.style.display = 'none';
    });
    // Mostrar la fila de detalles correspondiente al id
    document.getElementById('P-' + id).style.removeProperty('display');
}
function abrirModalLocal(){
    esconderLosFormularios();
    modal = document.getElementById('formLocal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    document.getElementById('idLocal').innerHTML = 'ID';
    document.getElementById('nombreLocal').value = '';
    document.getElementById('matrizLocal').value = '0';
}
async function editarLocal(id){
    esconderLosFormularios();
    abrirModalLocal();
    data= await verificar(`SELECT * FROM locals WHERE id = ${id};`);
    console.log(data);
    document.getElementById('idLocal').innerHTML = data[0].id;
    document.getElementById('nombreLocal').value = data[0].nombre;
    document.getElementById('matrizLocal').value = data[0].matriz_id;
    document.getElementById('matrizLocal').disabled = true;
}
async function eliminarLocal(id){
    if (confirm('¿Seguro que desea eliminar este local?')){
        consulta = await verificar(`DELETE FROM locals WHERE id = ${id};`);
        if (consulta.error){
            Erroralert('tienes que eliminar los puntos de venta asociados a este local');
        }else{
            location.reload();
        }
    }
}
function guardarLocal(){
    hoy = new Date();
    nombre=document.getElementById('nombreLocal').value;
    matriz=document.getElementById('matrizLocal').value;
    id=document.getElementById('idLocal').innerHTML;
    if (nombre == '' || matriz == '0'){
        alert('Llene todos los campos');
    } else {
        if(id != 'ID'){
            alert('Se va a actualizar los datos');
            verificar(`UPDATE locals SET nombre = '${nombre}' WHERE id = ${id};`);
            location.reload();  
        } else {
            verificar(`INSERT INTO locals (nombre, matriz_id, created_at) VALUES ('${nombre}', ${matriz}, '${hoy}');`);
            location.reload();
        }
    }
}
async function activate(){
    var selectMatriz = document.getElementById('matrizPventa');
    var selectLocal = document.getElementById('LocalPventa');
    if (selectMatriz.value != '0'){
        selectLocal.disabled = false;
        selectLocal.innerHTML = '';
        locales = await verificar(`SELECT * FROM locals WHERE matriz_id = ${selectMatriz.value};`);
        locales.forEach(local => {
            var option = document.createElement('option');
            option.value = local.id;
            option.text = local.nombre;
            selectLocal.add(option);
        });
    } else {
        selectLocal.disabled = true;
        selectLocal.innerHTML = '';
    }
}
function abrirModalPventa(){
    esconderLosFormularios();
    modal = document.getElementById('formPventa');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    document.getElementById('idPventa').innerHTML = 'ID';
    document.getElementById('nombrePventa').value = '';
    document.getElementById('matrizPventa').value = '0';
    document.getElementById('LocalPventa').value = '0';
}
async function editarPventa(id){
    esconderLosFormularios();
    abrirModalPventa();
    data= await verificar(`SELECT * FROM p_ventas WHERE id = ${id};`);
    console.log(data);
    document.getElementById('idPventa').innerHTML = data[0].id;
    document.getElementById('nombrePventa').value = data[0].npv;
    document.getElementById('matrizPventa').value = data[0].matriz_id;
    document.getElementById('LocalPventa').value = data[0].local_id;
    document.getElementById('matrizPventa').disabled = true;
    document.getElementById('LocalPventa').disabled = true;
}
async function eliminarPventa(id){
    if (confirm('¿Seguro que desea eliminar este punto de venta?')){
        verificar(`DELETE FROM p_ventas WHERE id = ${id};`);
        location.reload();  
    }
}
async function activarlocales(){
    matriz = document.getElementById('matrizUsuario').value;
    local = document.getElementById('LocalUsuario');
    pventa = document.getElementById('PventaUsuario');
    if (matriz != '0'){
        local.disabled = false;
        local.innerHTML = '';
        locales = await verificar(`SELECT * FROM locals WHERE matriz_id = ${matriz};`);
        console.log(locales);
        locales.forEach(locall => {
            var option = document.createElement('option');
            option.value = locall.id;
            option.text = locall.nombre;
            local.add(option);
            local.value = locall.id;
        });
    } else {
        local.disabled = true;
        local.innerHTML = '';
        pventa.disabled = true;
    }
    activarPventa();
}
async function activarPventa(){
    local = document.getElementById('LocalUsuario').value;
    pventa = document.getElementById('PventaUsuario');
    if (local != '0'){
        pventa.disabled = false;
        pventa.innerHTML = '';
        pventas = await verificar(`SELECT * FROM p_ventas WHERE local_id = ${local};`);
        console.log(pventas);
        pventas.forEach(pventai => {
            var option = document.createElement('option');
            option.value = pventai.id;
            option.text = pventai.npv;
            pventa.add(option);
        });
    } else {
        pventa.disabled = true;
        pventa.innerHTML = '';
    }
}

function guardarUsuario(){
    var id = document.getElementById('idUsers').innerText;
    var nombre = document.getElementById('nombreUsuario').value;
    var email = document.getElementById('email').value;
    var matriz = document.getElementById('matrizUsuario').value;
    var local = document.getElementById('LocalUsuario').value;
    var pventa = document.getElementById('PventaUsuario').value;
    var rol = document.getElementById('roleuser').value;
    var pass = document.getElementById('password').value;
    var pass2 = document.getElementById('Cpassword').value;

    var vacio = 0;

    if (!nombre) {
        document.getElementById('nombreUsuario').classList.add('border-red-500');
        vacio = 1;
    }
    if (!email) {
        document.getElementById('email').classList.add('border-red-500');
        vacio = 1;
    }
    if (matriz === '0') {
        document.getElementById('matrizUsuario').classList.add('border-red-500');
        vacio = 1;
    }
    if (local === '0') {
        document.getElementById('LocalUsuario').classList.add('border-red-500');
        vacio = 1;
    }
    if (pventa === '0') {
        document.getElementById('PventaUsuario').classList.add('border-red-500');
        vacio = 1;
    }
    if (rol === '0') {
        document.getElementById('roleuser').classList.add('border-red-500');
        vacio = 1;
    }
    if (!pass && id === 'ID') {
        document.getElementById('password').classList.add('border-red-500');
        vacio = 1;
    } else if (pass !== pass2) {
        document.getElementById('Cpassword').classList.add('border-red-500');
        alert('Las contraseñas no coinciden');
        vacio = 1;
    }

    if (vacio === 0) {
        // Crear el objeto de datos a enviar
        var data = {
            id: id,
            name: nombre,
            email: email,
            password: pass,
            matriz_id: matriz,
            local_id: local,
            p_venta_id: pventa,
            role: rol
        };

        // Enviar los datos a la ruta /register en Flask
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json()
        .then(data => {
            if (data.message === 'Usuario registrado/actualizado exitosamente') {
                alert('Usuario registrado/actualizado exitosamente');
                location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        }))
        .catch(error => {
            console.error('Error al procesar la respuesta:', error);
        });
    } else {
        alert('Llene todos los campos');
    }
}
function mostrarModalUsuario(){
    esconderLosFormularios();
    modal = document.getElementById('formUsers');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('No se encontró el modal');
    }
    document.getElementById('idUsers').innerText = 'ID';
    document.getElementById('nombreUsuario').value = '';
    document.getElementById('email').value = '';
    document.getElementById('matrizUsuario').value = '0';
    document.getElementById('LocalUsuario').value = '0';
    document.getElementById('LocalUsuario').disabled = true;
    document.getElementById('PventaUsuario').value = '0';
    document.getElementById('PventaUsuario').disabled = true;
    document.getElementById('roleuser').value = '0';
    document.getElementById('password').value = '';
    document.getElementById('Cpassword').value = '';
}
async function editarUsuario(id){
    esconderLosFormularios();
    usuario=  await verificar(`SELECT * FROM users WHERE id = ${id};`);
    console.log(usuario);
    mostrarModalUsuario();
    document.getElementById('idUsers').innerText = usuario[0].id;
    document.getElementById('nombreUsuario').value = usuario[0].name;
    document.getElementById('email').value = usuario[0].email;
    document.getElementById('matrizUsuario').value = usuario[0].matriz_id;
    document.getElementById('LocalUsuario').value = usuario[0].local_id;
    document.getElementById('LocalUsuario').disabled = false;
    document.getElementById('PventaUsuario').value = usuario[0].p_venta_id;
    document.getElementById('PventaUsuario').disabled = false;
    document.getElementById('roleuser').value = usuario[0].roles_id;

}
function eliminarUsuario(id){
    if (confirm('¿Seguro que desea eliminar este usuario?')){
        verificar(`DELETE FROM users WHERE id = ${id};`);
        location.reload();
    }
}
function updateImprime(checkbox, id){
    var newStatus = checkbox.checked ? 1 : 0;
    console.log(newStatus + ' ' + id);
    verificar(`UPDATE users SET print = ${newStatus} WHERE id = ${id};`);
    checkbox.checked = newStatus;
}
function convertirHora(hora) {
    var partes = hora.split(':');
    var horas = partes[0].padStart(2, '0'); // Asegura que las horas tengan dos dígitos
    var minutos = partes[1].padStart(2, '0'); // Asegura que los minutos tengan dos dígitos
    return horas + ':' + minutos;
}