/* =========================================================
   Huellitas Yopal - scripts.js
   Ahora conectado a la API PHP (carpeta /api) en vez de
   guardar los datos en localStorage.
   ========================================================= */

// Carpeta donde vive la API relativa a los archivos HTML
const API_URL = "api/";

// Guardamos en memoria la última lista de mascotas que trajo la API,
// para poder abrir el modal de detalles sin volver a consultar el servidor.
let listaMascotasActual = [];
let idMascotaAbierta = null;

/* =========================================================
   1. CATÁLOGO: cargar y pintar las tarjetas desde la API
   ========================================================= */
async function cargarMascotas(filtroTipo = null, filtroZona = null) {
    const grid = document.getElementById('mascotas-dinamicas-grid');
    if (!grid) return;

    let url = `${API_URL}listar_mascotas.php`;
    const parametros = [];
    if (filtroTipo && filtroTipo !== 'todas' && filtroTipo !== 'todos') {
        parametros.push(`tipo=${encodeURIComponent(filtroTipo)}`);
    }
    if (filtroZona && filtroZona !== 'todas') {
        parametros.push(`zona=${encodeURIComponent(filtroZona)}`);
    }
    if (parametros.length) url += '?' + parametros.join('&');

    grid.innerHTML = '<p class="mensaje-estado">Cargando mascotas...</p>';

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (!datos.exito) {
            grid.innerHTML = `<p class="mensaje-estado">No se pudieron cargar los reportes: ${datos.mensaje}</p>`;
            return;
        }

        listaMascotasActual = datos.mascotas;
        grid.innerHTML = '';

        if (listaMascotasActual.length === 0) {
            grid.innerHTML = '<p class="mensaje-estado">Todavía no hay reportes en esta categoría.</p>';
            return;
        }

        listaMascotasActual.forEach((mascota, index) => {
            const claseEstado = mascota.tipo === 'perdido' ? 'perdido' : 'encontrado';
            const textoEstado = mascota.tipo.toUpperCase();
            const textoBarrio = mascota.barrio_text || `Sector: ${mascota.zona}`;

            const card = document.createElement('div');
            card.className = 'pet-card mascota-card';
            card.setAttribute('data-estado', mascota.tipo);
            card.setAttribute('data-zona', mascota.zona);

            card.innerHTML = `
                <span class="pet-status ${claseEstado}">${textoEstado}</span>
                <img src="${mascota.imagen}" alt="${mascota.nombre}">
                <div class="pet-info">
                    <h3>${mascota.nombre}</h3>
                    <p class="pet-location">📍 ${textoBarrio}</p>
                    <div class="pet-tags">
                        <span>${mascota.raza}</span>
                        <span>${mascota.color}</span>
                    </div>
                    <button class="btn-details" onclick="abrirModal(${index})">Ver detalles</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error al conectar con la API:', error);
        grid.innerHTML = '<p class="mensaje-estado">No se pudo conectar con el servidor. Verifica que Apache y MySQL estén encendidos en XAMPP.</p>';
    }
}

/* =========================================================
   2. MODAL DE DETALLES
   ========================================================= */
function abrirModal(index) {
    const mascota = listaMascotasActual[index];
    if (!mascota) return;

    document.getElementById('modal-img').src = mascota.imagen;
    document.getElementById('modal-nombre').innerText = mascota.nombre;
    document.getElementById('modal-ubicacion').innerText = mascota.barrio_text || mascota.zona;
    document.getElementById('modal-raza').innerText = mascota.raza;
    document.getElementById('modal-color').innerText = mascota.color;
    document.getElementById('modal-descripcion').innerText = mascota.descripcion || "Sin descripción particular.";
    document.getElementById('modal-telefono').innerText = mascota.telefono || "No registrado";

    const badge = document.getElementById('modal-badge');
    badge.innerText = mascota.tipo.toUpperCase();
    badge.className = `pet-status modal-badge ${mascota.tipo}`;

    idMascotaAbierta = mascota.id;
    document.getElementById('modal-detalles').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-detalles').style.display = 'none';
}

/* =========================================================
   3. FORMULARIO reportar.html: crear un nuevo reporte
   ========================================================= */
async function procesarReporte(event) {
    event.preventDefault();

    const formulario = event.target;
    const boton = formulario.querySelector('button[type="submit"]');
    const textoOriginalBoton = boton ? boton.innerText : null;
    if (boton) {
        boton.disabled = true;
        boton.innerText = "Publicando...";
    }

    const selectZona = document.getElementById('zona-mapa');
    const archivoImagen = document.getElementById('imagen-archivo').files[0];

    const datosFormulario = new FormData();
    datosFormulario.append('nombre', document.getElementById('nombre').value.trim());
    datosFormulario.append('tipo', document.getElementById('tipo-reporte').value);
    datosFormulario.append('zona', selectZona.value);
    datosFormulario.append('barrioText', selectZona.options[selectZona.selectedIndex].text);
    datosFormulario.append('raza', document.getElementById('raza').value.trim());
    datosFormulario.append('color', document.getElementById('color').value.trim());
    datosFormulario.append('telefono', document.getElementById('telefono').value.trim());
    datosFormulario.append('correo', document.getElementById('correo').value.trim());
    datosFormulario.append('descripcion', document.getElementById('detalles').value.trim());
    datosFormulario.append('imagen', archivoImagen);

    try {
        const respuesta = await fetch(`${API_URL}guardar_reporte.php`, {
            method: 'POST',
            body: datosFormulario
            // OJO: no se pone header "Content-Type" a propósito.
            // El navegador lo arma solo (con el "boundary" del archivo)
            // al usar FormData; si lo forzamos manualmente, se rompe la subida.
        });
        const datos = await respuesta.json();

        if (!datos.exito) {
            alert(`❌ ${datos.mensaje}`);
            if (boton) {
                boton.disabled = false;
                boton.innerText = textoOriginalBoton;
            }
            return;
        }

        if (datos.correo_enviado) {
            alert(`🎉 ¡Reporte creado con éxito!\n\n📧 Te enviamos el código PIN al correo que registraste. Guárdalo, lo necesitarás para eliminar la publicación cuando la mascota regrese a casa.`);
        } else {
            // Si el correo no se pudo enviar (ej. SMTP mal configurado), mostramos el PIN igual para que no quede perdido
            alert(`🎉 ¡Reporte creado con éxito!\n\n⚠️ No pudimos enviarte el correo con el PIN, así que aquí lo tienes:\n\n🔑 PIN: ${datos.pin_secreto}\n\nGuárdalo, lo necesitarás para eliminar el reporte.`);
        }

        window.location.href = "index.html";
    } catch (error) {
        console.error('Error al guardar el reporte:', error);
        alert("❌ No se pudo conectar con el servidor. Verifica que Apache y MySQL estén encendidos e inténtalo de nuevo.");
        if (boton) {
            boton.disabled = false;
            boton.innerText = textoOriginalBoton;
        }
    }
}

/* =========================================================
   4. ELIMINAR / MARCAR COMO RESUELTO (valida PIN vía API)
   ========================================================= */
async function solicitarEliminar() {
    if (idMascotaAbierta === null) return;

    const pinIngresado = prompt("Para marcar este reporte como resuelto, ingresa el código PIN de 4 dígitos creado al registrar la mascota:");
    if (pinIngresado === null) return; // El usuario canceló

    try {
        const respuesta = await fetch(`${API_URL}eliminar_reporte.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idMascotaAbierta, pin: pinIngresado.trim() })
        });
        const datos = await respuesta.json();

        if (!datos.exito) {
            alert(`❌ ${datos.mensaje}`);
            return;
        }

        alert(`✨ ${datos.mensaje}`);
        cerrarModal();
        cargarMascotas();
        cargarMarcadoresMapa();
    } catch (error) {
        console.error('Error al eliminar el reporte:', error);
        alert("❌ No se pudo conectar con el servidor.");
    }
}

/* =========================================================
   5. NAVEGACIÓN Y SCROLL
   ========================================================= */
function verTodosLosReportes(event) {
    if (event) event.preventDefault();
    cargarMascotas();
    cerrarMenu();
}

function desplazarASeccion(event, idSeccion) {
    event.preventDefault();
    const seccion = document.getElementById(idSeccion);
    if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth' });
    }
    cerrarMenu();
}

// Acción del botón "Buscar Mascota": desplaza al catálogo
function irABuscarMascota(event) {
    event.preventDefault();
    const contenedorCatalogo = document.getElementById('mascotas-dinamicas-grid');
    if (contenedorCatalogo) {
        contenedorCatalogo.closest('.catalog-section').scrollIntoView({ behavior: 'smooth' });

        const filtroEstado = document.getElementById('filtro-estado');
        if (filtroEstado) filtroEstado.focus();
    }
    cerrarMenu();
}

/* =========================================================
   6. MENÚ HAMBURGUESA (navbar responsive)
   ========================================================= */
function alternarMenu() {
    const nav = document.getElementById('nav-menu');
    const boton = document.getElementById('nav-toggle');
    if (!nav || !boton) return;

    const abierto = nav.classList.toggle('nav-abierto');
    boton.classList.toggle('nav-toggle-activo', abierto);
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
}

function cerrarMenu() {
    const nav = document.getElementById('nav-menu');
    const boton = document.getElementById('nav-toggle');
    if (!nav || !boton) return;

    nav.classList.remove('nav-abierto');
    boton.classList.remove('nav-toggle-activo');
    boton.setAttribute('aria-expanded', 'false');
}

/* =========================================================
   7. MAPA COMUNITARIO (Leaflet) - marcadores desde la API
   ========================================================= */
let mapaLeaflet = null;
let capaMarcadores = null;

function inicializarMapa() {
    const mapaElemento = document.getElementById('mapa-comunitario');
    if (!mapaElemento || typeof L === 'undefined') return;

    const latYopal = 5.33775;
    const lngYopal = -72.39586;

    const limitesYopal = L.latLngBounds(
        L.latLng(5.300, -72.440), // Suroeste
        L.latLng(5.370, -72.350)  // Noreste
    );

    mapaLeaflet = L.map('mapa-comunitario', {
        center: [latYopal, lngYopal],
        zoom: 14,
        minZoom: 13,
        maxZoom: 18,
        maxBounds: limitesYopal,
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapaLeaflet);

    capaMarcadores = L.layerGroup().addTo(mapaLeaflet);

    cargarMarcadoresMapa();

    // Evita que el mapa se vea "cortado" si el navegador redimensiona la ventana
    window.addEventListener('resize', () => {
        if (mapaLeaflet) mapaLeaflet.invalidateSize();
    });
}

async function cargarMarcadoresMapa() {
    if (!mapaLeaflet || !capaMarcadores) return;

    capaMarcadores.clearLayers();

    try {
        const respuesta = await fetch(`${API_URL}listar_mascotas.php`);
        const datos = await respuesta.json();
        if (!datos.exito) return;

        datos.mascotas.forEach((mascota, index) => {
            if (!mascota.lat || !mascota.lng) return;

            const marcador = L.marker([parseFloat(mascota.lat), parseFloat(mascota.lng)]);

            const contenidoPopup = `
                <div style="font-family: sans-serif; width: 180px; text-align: center;">
                    <img src="${mascota.imagen}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 5px;">
                    <strong style="font-size: 1.1rem; color: #1e293b;">${mascota.nombre}</strong>
                    <p style="margin: 4px 0; font-size: 0.85rem; color: #64748b;">📍 ${mascota.barrio_text || 'Ubicación desconocida'}</p>
                    <span style="display:inline-block; padding: 2px 8px; font-size: 0.75rem; border-radius: 12px; font-weight: bold; background-color: ${mascota.tipo === 'perdido' ? '#fee2e2' : '#d1fae5'}; color: ${mascota.tipo === 'perdido' ? '#ef4444' : '#10b981'};">
                        ${mascota.tipo.toUpperCase()}
                    </span>
                    <br>
                    <a href="#" onclick="abrirModal(${index}); return false;" style="display: inline-block; margin-top: 8px; font-size: 0.85rem; color: #8b5cf6; text-decoration: none; font-weight: bold;">Ver detalles completo →</a>
                </div>
            `;

            marcador.bindPopup(contenidoPopup);
            capaMarcadores.addLayer(marcador);
        });
    } catch (error) {
        console.error('Error al cargar los marcadores del mapa:', error);
    }
}

/* =========================================================
   8. INICIALIZACIÓN
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    cargarMascotas();
    inicializarMapa();
});
