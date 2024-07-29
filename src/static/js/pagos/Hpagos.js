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
async function buscarPago() {
    const factura = document.getElementById('pagofactura').value;
    const tabla = document.getElementById('historipagos').getElementsByTagName('tbody')[0];
    const consulta = document.getElementById('consulta');
    const query = `SELECT * FROM premios WHERE factura = '${factura}'`;
    
    try {
        const datos = await verificar(query);
        
        // Limpiar la tabla existente
        tabla.innerHTML = '';
        
        if (datos.length === 0) {
            // Mostrar mensaje cuando no hay datos
            consulta.innerHTML = 'No tiene premios registrados';
            consulta.style.color = 'red';
            consulta.style.fontSize = '24px';
            consulta.style.fontWeight = 'bold';
        } else {
            // Inicializar la suma
            let suma = 0;
            
            // Agregar los datos a la tabla
            for (const dato of datos) {
                let juego;
                const detalleQuery = `SELECT juego FROM detalles WHERE id= ${dato.detalle_id};`
                const numero = await verificar(detalleQuery);
                
                numero.forEach(nn => {
                    juego = nn.juego;
                });
                
                
                
                const row = tabla.insertRow();
                const cell1 = row.insertCell(0); // id
                const cell2 = row.insertCell(1); // factura
                const cell3 = row.insertCell(2); // juego
                const cell4 = row.insertCell(3); // fecha
                const cell5 = row.insertCell(4); // premio
                const cell6 = row.insertCell(5); // accion

                // Agrega los valores a las celdas
                cell1.textContent = dato.detalle_id; // Reemplaza con el nombre real de la columna
                cell2.textContent = dato.factura; // Reemplaza con el nombre real de la columna
                cell3.textContent = juego; // Reemplaza con el nombre real de la columna

                // Convertir y formatear la fecha para mostrar solo la fecha en español
                const fecha = new Date(dato.created_at);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                cell4.textContent = fecha.toLocaleDateString('es-ES', options);

                cell5.textContent = dato.Saldo; // Reemplaza con el nombre real de la columna
                const pagado = await verificar(`SELECT * FROM pagos WHERE detalle_id = '${dato.detalle_id}' and suerte = '${dato.suerte}'`);
                if (pagado.length > 0) {
                    cell6.textContent = 'Pagado';
                }else{
                    suma += parseFloat(dato.Saldo); // Sumar los valores de Saldo 
                    cell6.innerHTML = `<button class="px-4 py-2 font-bold text-white bg-gray-800 rounded botonpagar hover:bg-blue-700" onclick="pagarSuerte('${dato.id}')">Pagar</button>`;
                }
            }
            
            // Mostrar el total
            consulta.innerHTML = `Total: ${suma}`;
            consulta.style.color = 'white';
            consulta.style.fontSize = '24px';
            consulta.style.fontWeight = 'bold';
        }
    } catch (error) {
        console.error('Error al buscar el pago:', error);
        consulta.innerHTML = 'Error al realizar la consulta';
        consulta.style.color = 'red';
        consulta.style.fontSize = '24px';
        consulta.style.fontWeight = 'bold';
    }
}
async function pagarSuerte(id) {
    try {
        const query = `SELECT * FROM premios WHERE id = ${id}`;
        const premio = await verificar(query); // Asegúrate de que verificar sea una función asincrónica que devuelve una promesa

        // Iterar sobre los resultados y mostrar en consola
        premio.forEach(async item => {
            fecha=formatDate(new Date());
            const echo =await verificar(`insert into pagos (detalle_id, Saldo, user_id, created_at, suerte) 
                values ('${item.detalle_id}', '${item.Saldo}', '${item.user_id}', '${fecha}', '${item.suerte}')`);
            console.log(echo);
            buscarPago();
        });
    } catch (error) {
        console.error('Error al obtener el premio:', error);
    }
}
function formatDate(dateString) {
    // Crear un objeto Date a partir de la cadena de fecha
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    
    // Extraer las partes de la fecha
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son de 0 a 11
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Formatear la fecha según el formato deseado
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
