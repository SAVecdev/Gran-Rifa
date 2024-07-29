var pdfFrame = document.getElementById("pdfFrame");
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
async function openModal() {
    var factura = await realizarPago();
    var modal = document.getElementById("print");
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        pdfFrame.src = `/printer?factura=${factura}`;
    } else {
        console.error('No se encontró el modal');
    }
}
function closeModal() {
    var modal = document.getElementById("print");
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    } else {
        console.error('No se encontró el modal');
    }
}
async function realizarPago() {
    var tabla = document.getElementById("sales-details");
    var totalL = document.getElementById("total");
    var texto = totalL.innerText;
    let total = texto.replace("Total: ", "");
    var local;
    var usuario;
    var totalValue = parseFloat(total);
    var date = new Date();
    
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');
    var hora = hours + ':' + minutes + ':' + seconds;
    var created_at = year + '-' + month + '-' + day + ' ' + hora;

    var rows = tabla.rows;
    var products = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var fecha = row.cells[0].innerText;
        var tipo = row.cells[1].innerText;
        var juego = row.cells[2].innerText;
        var cantidad = row.cells[3].innerText;
        var precio = row.cells[4].innerText;
        var subtotal = row.cells[5].innerText;
        products.push({ fecha, tipo, juego, cantidad, precio, subtotal });
    }

    // Limpiar la tabla
    while (tabla.rows.length > 1) {
        tabla.innerHTML = '';
    }

    var factura = seconds + hours + day + minutes;
    try {
        const user = await getUserInfo();
        usuario = user.user_id;
        local = user.local_id;
        factura = factura + user.user_id;
        console.log(user);
        
        var query = `INSERT INTO tikets (Factura, total, fecha, hora, p_venta_id, user_id, created_at) 
        VALUES ('${factura}', ${totalValue}, '${year}-${month}-${day}', '${hora}', '${user.p_venta_id}', '${user.user_id}', '${created_at}')`;
        
        let result = await verificar(query);
        if (result.error) {
            alert('Error al realizar el pago:', result.error);
            return;
        }

        // Buscar el id de la factura
        query = `SELECT id FROM tikets WHERE Factura = '${factura}'`;
        result = await verificar(query);
        if (result.error) {
            alert('Error al realizar la consulta:', result.error);
            return;
        }
        const id = result[0].id;

        for (let product of products) {
            query = `INSERT INTO detalles (user_id, tipo, fecha, local_id, valor, cantidad, juego, tiket_id, created_at) 
            VALUES ('${usuario}', '${product.tipo}', '${product.fecha}', '${local}', '${product.precio}', '${product.cantidad}', '${product.juego}', '${id}', '${created_at}')`;
            result = await verificar(query);
            if (result.error) {
                alert('Error al realizar el pago:', result.error);
                console.error(result.error);
                return;
            }
        }
    } catch (error) {
        console.error('Error al realizar el pago:', error);
    }
    return factura;
}
