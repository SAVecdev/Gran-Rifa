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
async function buscarID() {
    var id = document.getElementById("buscaID").value;
    const tabla = document.getElementById('keyshare').getElementsByTagName('tbody')[0];
    const query = `SELECT * FROM tikets WHERE id = '${id}'`;
    
    try {
        const datos = await verificar(query);
        console.log(datos);
        tabla.innerHTML = '';

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' }; // Opciones para formatear la fecha

        for (const dato of datos) {         
            const row = tabla.insertRow();
            const cell1 = row.insertCell(0); // id
            const cell2 = row.insertCell(1); // factura
            const cell3 = row.insertCell(2); // total
            const cell4 = row.insertCell(3); // fecha
            const cell5 = row.insertCell(4); // hora

            // Agrega los valores a las celdas
            cell1.textContent = dato.id; // Reemplaza con el nombre real de la columna
            cell2.textContent = dato.Factura; // Reemplaza con el nombre real de la columna
            cell3.textContent = dato.total; // Reemplaza con el nombre real de la columna
            cell4.textContent = dato.created_at;

            if (dato.eliminado == 0) {
                cell5.textContent = "No";
            } else {
                cell5.textContent = "Si";
            }
        }    
    } catch (error) {
        console.error('Error al buscar el pago:', error);
    }
}