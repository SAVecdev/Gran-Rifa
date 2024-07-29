let currentPage = 1;
const rowsPerPage = 10;

async function getUserInfo() {
    try {
        const response = await fetch('/user_info');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
}

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
function buscarTipo() {
    const fecha = document.getElementById('datep').value;
    const query = `SELECT * FROM diarios WHERE fecha = '${fecha}'`;
    const gameTypeSelect = document.getElementById('game-type');
    
    // Limpiar las opciones del select
    gameTypeSelect.innerHTML = '';

    // Obtener la información del usuario
    getUserInfo()
        .then(user => {
            const user_local = user.local_id;

            // Ejecutar la primera consulta
            return verificar(query)
                .then(data => {
                    if (data && data.length > 0) {
                        if (data[0].tipo == 'LTT') {
                            const option = document.createElement('option');
                            option.value = 'LTT';
                            option.text = 'Lotto';
                            gameTypeSelect.appendChild(option);
                        }
                        if (data[0].tipo == 'LTRIA') {
                            const option = document.createElement('option');
                            option.value = 'LTRIA';
                            option.text = 'Loteria';
                            gameTypeSelect.appendChild(option);
                        }
                        if (data[0].tipo == 'LTT+LTRIA') {
                            let option1 = document.createElement('option');
                            option1.value = 'LTT+LTRIA';
                            option1.text = 'Loteria y Lotto';
                            gameTypeSelect.appendChild(option1);

                            let option2 = document.createElement('option');
                            option2.value = 'LTT';
                            option2.text = 'Lotto';
                            gameTypeSelect.appendChild(option2);

                            let option3 = document.createElement('option');
                            option3.value = 'LTRIA';
                            option3.text = 'Loteria';
                            gameTypeSelect.appendChild(option3);
                        }
                    } else {
                        const option = document.createElement('option');
                        option.value = 'no';
                        option.text = 'No hubo datos';
                        gameTypeSelect.appendChild(option);
                    }

                    // Ejecutar la segunda consulta basada en user_local y fecha
                    const query2 = `SELECT 
                        d.juego
                    FROM 
                        detalles d
                    JOIN 
                        limites l ON d.local_id = l.local_id AND LENGTH(d.juego) = l.digito
                    WHERE 
                        d.local_id = ${user_local} and d.fecha = '${fecha}' and d.eliminado = 0
                    GROUP BY 
                        d.juego, d.fecha, d.local_id, l.limite
                    HAVING 
                        SUM(d.valor) >= l.limite;`;

                    return verificar(query2);
                })
                .then(data => {
                    const tableBody = document.getElementById('limites-table-body');
                    if (tableBody) {
                        tableBody.innerHTML = '';  // Limpiar el cuerpo de la tabla
                        if (data && data.length > 0) {
                            data.forEach(item => {
                                const row = document.createElement('tr');
                                row.innerHTML = `
                                    <td class="py-2 px-4">${item.juego}</td>
                                `;
                                tableBody.appendChild(row);
                            });
                        }
                    } else {
                        console.error('El elemento con id "limites-table-body" no existe en el DOM.');
                    }
                });
        })
        .catch(error => console.error('Error fetching or processing data:', error));
}
function setValue(amount) {
    document.getElementById('value').value = amount.toFixed(2);
}
async function addSaleDetail() {
    const date = document.getElementById('datep').value;
    const isWithinLimit = await verificarlimite();
    const horario = await verificarHorario(date);
        if (verificarDatos()==1 && isWithinLimit && horario) {
            console.log('Agregando detalle de venta...');
            const game = document.getElementById('game').value;
            const gameType = document.getElementById('game-type').value;
            const quantity = document.getElementById('quantity').value;
            const value = document.getElementById('value').value;
            const total = (quantity * value).toFixed(2);

            const newRow = `
                <tr>
                    <td class="py-2 px-4">${date}</td>
                    <td class="py-2 px-4">${gameType}</td>
                    <td class="py-2 px-4">${game}</td>
                    <td class="py-2 px-4">${quantity}</td>
                    <td class="py-2 px-4">${value}</td>
                    <td class="py-2 px-4">${total}</td>
                    <td class="py-2 px-4"><button class="text-red-500" onclick="removeSaleDetail(this)">Eliminar</button></td>
                </tr>
            `;

            document.getElementById('sales-details').insertAdjacentHTML('beforeend', newRow);
            
            
            updateTotal();
            updatePagination();
            
        }
}

function removeSaleDetail(button) {
    const row = button.closest('tr');
    row.remove();
    updateTotal();
    updatePagination();
}

function updateTotal() {
    let total = 0;
    document.querySelectorAll('#sales-details tr').forEach(row => {
        const rowTotal = parseFloat(row.cells[5].textContent);
        total += rowTotal;
    });
    document.querySelector('.text-lg.font-semibold').textContent = `Total: ${total.toFixed(2)}`;
    document.querySelector('.text-lg.font-semibold').value = total.toFixed(2);

}

function paginate(rows, currentPage, rowsPerPage) {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    for (let i = 0; i < rows.length; i++) {
        if (i >= startIndex && i < endIndex) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

function updatePagination() {
    const rows = document.querySelectorAll('#sales-details tr');
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const paginationContainer = document.getElementById('pagination');
    paginationContainer.classList.add('flex', 'justify-center', 'space-x-2');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('px-3', 'py-1', 'mx-1', 'rounded', 'bg-cyan-300', 'hover:bg-gray-400', 'focus:outline-none', 'transition-colors', 'duration-300');

        if (i === currentPage) {
            button.classList.add('bg-cyan-950', 'text-white');
        }

        button.addEventListener('click', () => {
            currentPage = i;
            updatePagination(); // Actualizar los botones después de cambiar la página
            paginate(rows, currentPage, rowsPerPage);
        });

        paginationContainer.appendChild(button);
    }

    paginate(rows, currentPage, rowsPerPage);
}
function verificarDatos(){
    //verificar si la fecha es menor a la actual
    const today = new Date().toISOString().split('T')[0];
    con
    if (document.getElementById('datep').value == ''){
        alert('Por favor, seleccione una fecha');
        return 0;
    }else if (document.getElementById('datep').value < today ){
        alert('La fecha seleccionada es menor a la fecha actual');
        return 0;
    }
    //verificar si el juego es diferente a vacio
    if (document.getElementById('game').value == ''){
        alert('Por favor, seleccione un juego');
        document.getElementById('game').focus();
        return 0;
    }
    //verificar si el tipo de juego es diferente a vacio
    if (document.getElementById('game-type').value == 'no'){
        alert('no existen datos para la fecha seleccionada comuniquese con su supervisor');
        document.getElementById('game-type').focus();
        return 0;
    }
    //verificar si la cantidad es diferente a vacio
    if (document.getElementById('quantity').value == ''){
        alert('Por favor, ingrese una cantidad');
        document.getElementById('quantity').focus();
        return 0;
    }
    //verificar si el valor es diferente a vacio
    if (document.getElementById('value').value == 0 ){
        alert('Por favor, ingrese un valor');
        document.getElementById('value').focus();
        return 0;
    }
    return 1;


}
async function verificarlimite() {
    const juego = document.getElementById('game').value;
    const cantidad = parseFloat(document.getElementById('quantity').value);
    const valor = parseFloat(document.getElementById('value').value);
    const total = cantidad * valor;
    const fecha = document.getElementById('datep').value;
    const digitos = juego.length;

    getUserInfo();
    const user = await getUserInfo();
    const local = user.local_id;
    // Verificar en la base de datos
    let Tbd = 0;
    let Ltotal = 0;

    const query1 = `SELECT SUM(valor * cantidad) AS total FROM detalles WHERE eliminado = 0 and juego = '${juego}' AND fecha = '${fecha}' AND local_id = ${local}`;
    const data1 = await verificar(query1);
    if (data1 && data1.length > 0) {
        Tbd = data1[0].total || 0; // Manejar null o undefined
    }

    const query2 = `SELECT limite FROM limites WHERE local_id = ${local} AND digito = ${digitos} LIMIT 1`;
    const data2 = await verificar(query2);
    if (data2 && data2.length > 0) {
        Ltotal = data2[0].limite || 0; // Manejar null o undefined
    } else {
        alert('No se pudo obtener el límite de ventas para este juego.');
        return false;
    }

    // Verificar en el frontend
    let TablaTotal = 0;
    const tabla = document.getElementById('sales-details');
    for (let i = 0; i < tabla.rows.length; i++) {
        const rowGame = tabla.rows[i].cells[2].textContent;
        if (rowGame === juego) {
            const rowQuantity = parseFloat(tabla.rows[i].cells[3].textContent);
            const rowValue = parseFloat(tabla.rows[i].cells[4].textContent);
            TablaTotal += rowQuantity * rowValue;
        }
    }
    
    sum= parseFloat(Tbd) + parseFloat(TablaTotal)+parseFloat(total);
    console.log(sum);
    if (sum > Ltotal) {
        const disponible = Ltotal - Tbd - TablaTotal;
        alert(`Ha superado el límite de ventas para este juego. Solo puede vender ${disponible.toFixed(2)} en este momento.`);
        return false;
    }
    return 1;
    console.log('No se ha superado el límite de ventas para este juego.');

    
}
async function verificarHorario(fecha) {
    var horaEntrada = '00:00:01';
    var horaSalida = '20:00:00';
    const user = await getUserInfo();
    const local = user.local_id;
    var hora = new Date().getTime;
    const dato = await verificar(`SELECT hora_entrada, hora_salida FROM horarios WHERE local_id= '${local}' and fecha = '${fecha}'`);
    if (dato && dato.length > 0) {
        horaEntrada = dato[0].hora_entrada;
        horaSalida = dato[0].hora_salida;
    }
    var horahoy = timeToSeconds(new Date().toLocaleTimeString());
    if (horahoy < timeToSeconds(horaEntrada) || horahoy > timeToSeconds(horaSalida)) {
        alert('No se puede realizar la venta en este horario');
        return false;
    }else
    {
        return true;
    }
}
function timeToSeconds(time) {
    var parts = time.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    var seconds = parseInt(parts[2], 10);
    return hours * 3600 + minutes * 60 + seconds;
}
