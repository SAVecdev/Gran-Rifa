

// src/static/js/script.js
function loadComponent(componentName) {
    fetch(`/component/${componentName}`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => console.error('Error loading component:', error));
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    // Ocultar todos los elementos con clase "tabcontent"
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.add("hidden");
    }

    // Eliminar la clase "active" de todos los elementos con clase "tablinks"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostrar la pestaña actual y añadir una clase "active" al botón que abrió la pestaña
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.remove("hidden");
    evt.currentTarget.className += " active";
}


