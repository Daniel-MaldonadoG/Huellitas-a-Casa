// Al puro inicio de tu scripts.js (afuera de cualquier función)
let indiceMascotaAbierta = null;
// Base de datos simulada inicial con coordenadas geográficas para el mapa de Yopal
const mascotasPredefinidas = [
    { 
        id: 1, 
        nombre: "Toby", 
        tipo: "perdido", 
        zona: "casimena", 
        raza: "Bulldog", 
        color: "Blanco/Negro", 
        telefono: "3114567890", 
        descripcion: "Tiene un collar rojo con cascabel. Es muy amigable pero puede estar asustado.", 
        imagen: "imagenes/Toby.jpg", 
        barrioText: "Barrio Casimena",
        lat: 5.33150,  // 👈 Coordenadas reales de Casimena
        lng: -72.38820 
    },
    { 
        id: 2, 
        nombre: "Misi", 
        tipo: "encontrado", 
        zona: "resurgimiento", 
        raza: "Gato Mestizo", 
        color: "Blanco y Negro", 
        telefono: "3209876543", 
        descripcion: "Se encontró buscando comida cerca de las canchas. Está muy bien cuidado y es mansito.", 
        imagen: "imagenes/Misi.jpg", 
        barrioText: "Parque El Resurgimiento",
        lat: 5.34215,  // 👈 Coordenadas reales de El Resurgimiento
        lng: -72.39260 
    },
    { 
        id: 3, 
        nombre: "Mishi", 
        tipo: "perdido", 
        zona: "unicentro", 
        raza: "Siamés", 
        color: "Crema y Cafe", 
        telefono: "3152345678", 
        descripcion: "Ojos azules muy claros. Tiene una pequeña cicatriz en su oreja izquierda.", 
        imagen: "imagenes/Mishi.jpg", 
        barrioText: "Cerca al Unicentro",
        lat: 5.32880,  // 👈 Coordenadas reales del sector Unicentro
        lng: -72.39410 
    },
    { 
        id: 4, 
        nombre: "Kira", 
        tipo: "encontrado", 
        zona: "sirivana", 
        raza: "Husky Mix", 
        color: "Negro y Blanco", 
        telefono: "3127654321", 
        descripcion: "Cojina un poco de la pata trasera derecha. Trae un pañuelo verde militar en el cuello.", 
        imagen: "imagenes/Kira.jpg", 
        barrioText: "Vía Sirivana",
        lat: 5.34620,  // 👈 Coordenadas reales de la salida/vía Sirivana
        lng: -72.37850 
    }
];

// Inicializar localStorage si está vacío
if (!localStorage.getItem('mascotas')) {
    localStorage.setItem('mascotas', JSON.stringify(mascotasPredefinidas));
}

// 1. Cargar y pintar las tarjetas en el HTML
function cargarMascotas() {
    const grid = document.getElementById('mascotas-dinamicas-grid');
    if (!grid) return; 

    const mascotas = JSON.parse(localStorage.getItem('mascotas'));
    grid.innerHTML = ''; 

    mascotas.forEach((mascota, index) => {
        const claseEstado = mascota.tipo === 'perdido' ? 'perdido' : 'encontrado';
        const textoEstado = mascota.tipo.toUpperCase();
        const textoBarrio = mascota.barrioText || `📍 Sector: ${mascota.zona}`;

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
}

// 2. Lógica de la Ventana Modal Flotante
function abrirModal(index) {
    const mascotas = JSON.parse(localStorage.getItem('mascotas'));
    const mascota = mascotas[index];
    

    if (!mascota) return;

    // Inyectamos los textos dinámicos
    document.getElementById('modal-img').src = mascota.imagen;
    document.getElementById('modal-nombre').innerText = mascota.nombre;
    document.getElementById('modal-ubicacion').innerText = mascota.barrioText || mascota.zona;
    document.getElementById('modal-raza').innerText = mascota.raza;
    document.getElementById('modal-color').innerText = mascota.color;
    
    // NUEVO: Inyectar la descripción en la modal
    document.getElementById('modal-descripcion').innerText = mascota.descripcion || "Sin descripción particular.";
    
    document.getElementById('modal-telefono').innerText = mascota.telefono || "No registrado";

    // Badge de Estado
    const badge = document.getElementById('modal-badge');
    badge.innerText = mascota.tipo.toUpperCase();
    badge.className = `pet-status ${mascota.tipo}`;

    idMascotaAbierta = mascota.id;
    document.getElementById('modal-detalles').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-detalles').style.display = 'none';
}



// 4. Procesar el formulario de reportar.html (CON DISPERSIÓN DE COORDENADAS)
function procesarReporte(event) {
    event.preventDefault(); 
    

    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipo-reporte').value;
    const zona = document.getElementById('zona-mapa').value; 
    const selectZona = document.getElementById('zona-mapa');
    const textoBarrioSeleccionado = selectZona.options[selectZona.selectedIndex].text;
    
    const imagenUrl = document.getElementById('imagen-url').value || "imagenes/default.jpg";
    const raza = document.getElementById('raza').value;
    const color = document.getElementById('color').value;
    const telefono = document.getElementById('telefono').value;
    const descripcion = document.getElementById('detalles').value;
    

    // Coordenadas base por defecto
    let latDefault = 5.33775;  
    let lngDefault = -72.39586;

    if (zona === "casimena") {
        latDefault = 5.33150; lngDefault = -72.38820;
    } else if (zona === "resurgimiento") {
        latDefault = 5.34215; lngDefault = -72.39260;
    } else if (zona === "unicentro") {
        latDefault = 5.32880; lngDefault = -72.39410;
    } else if (zona === "sirivana") {
        latDefault = 5.34620; lngDefault = -72.37850;
    }

    // 🌍 TRUCO DE INGENIERÍA: Sumar un pequeño desvío aleatorio 
    // Esto evita que los pines se tapen entre sí si eligen el mismo barrio
    const desvioLat = (Math.random() - 0.5) * 0.003; // Pequeña variación al norte/sur
    const desvioLng = (Math.random() - 0.5) * 0.003; // Pequeña variación al este/oeste
    const pinSecreto = Math.floor(1000 + Math.random() * 9000).toString();

    const nuevaMascota = {
        id: Date.now(), // Añadimos un ID único basado en milisegundos
        nombre: nombre,
        tipo: tipo,
        zona: zona,
        raza: raza,       
        color: color,     
        telefono: telefono,
        descripcion: descripcion,
        imagen: imagenUrl, 
        barrioText: textoBarrioSeleccionado,
        pinSecreto: pinSecreto,
        // Guardamos la coordenada con el desvío incluido
        lat: latDefault + desvioLat,
        lng: lngDefault + desvioLng
        
    };

    const listaActual = JSON.parse(localStorage.getItem('mascotas')) || [];
    
    // Cambiamos .unshift por .push para mantener el orden secuencial de los índices
    listaActual.push(nuevaMascota); 
    localStorage.setItem('mascotas', JSON.stringify(listaActual));

    alert(`🎉 ¡Reporte creado con éxito!\n\n🔑 IMPORTANTE: Guarda este código PIN para cuando encuentres a "${nombre}": ${pinSecreto}\nLo necesitarás para borrar el reporte.`);
    window.location.href = "index.html";
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarMascotas);

function desplazarASeccion(event, idSeccion) {
    event.preventDefault();
    const seccion = document.getElementById(idSeccion);
    if (seccion) {
        seccion.scrollIntoView({ behavior: 'smooth' });
    }
}

// Acción del botón "Buscar Mascota": desplaza al catálogo y enfoca el filtro de estado
function irABuscarMascota(event) {
    event.preventDefault();
    const contenedorCatalogo = document.getElementById('mascotas-dinamicas-grid');
    if (contenedorCatalogo) {
        // Hace scroll hasta la sección del catálogo
        contenedorCatalogo.closest('.catalog-section').scrollIntoView({ behavior: 'smooth' });
        
        // Pone el foco visual en el filtro de estado si existe
        const filtroEstado = document.getElementById('filtro-estado');
        if (filtroEstado) filtroEstado.focus();
    }
}

// Acción del botón "Reportar Encontrado": desplaza al catálogo y pre-filtra por Encontrados
function irAReportarEncontrado(event) {
    event.preventDefault();
    
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroZona = document.getElementById('filtro-zona');
    
    // Cambiamos el selector a 'encontrado' y reseteamos la zona a 'todas'
    if (filtroEstado) filtroEstado.value = 'encontrado';
    if (filtroZona) filtroZona.value = 'todas';
    
    // Ejecutamos la función de filtrado original que ya tenías hecha
    if (typeof filtrarMascotas === "function") {
        filtrarMascotas();
    }

    // Desplazamos la vista suavemente al catálogo ya filtrado
    const contenedorCatalogo = document.getElementById('mascotas-dinamicas-grid');
    if (contenedorCatalogo) {
        contenedorCatalogo.closest('.catalog-section').scrollIntoView({ behavior: 'smooth' });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mapaElemento = document.getElementById('mapa-comunitario');
    if (!mapaElemento) return;

    // 1. Coordenadas centrales de Yopal (Casanare)
    const latYopal = 5.33775;
    const lngYopal = -72.39586;

    // 2. Límites estrictos para que no se arrastre fuera de Yopal
    const limitesYopal = L.latLngBounds(
        L.latLng(5.300, -72.440), // Suroeste
        L.latLng(5.370, -72.350)  // Noreste
    );

    // 3. Inicializar el mapa
    const mapa = L.map('mapa-comunitario', {
        center: [latYopal, lngYopal],
        zoom: 14,
        minZoom: 13,
        maxZoom: 18,
        maxBounds: limitesYopal,
        maxBoundsViscosity: 1.0
    });

    // 4. Cargar diseño visual del mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapa);

    // 5. OBTENER LAS MASCOTAS ACTUALES (Las mismas de las tarjetas)
    const listaMascotas = JSON.parse(localStorage.getItem('mascotas')) || [];

    // 6. RECORRER EL ARREGLO Y CREAR UN MARCADOR POR CADA UNA
    listaMascotas.forEach((mascota, index) => {
        // Validamos que la mascota tenga coordenadas asignadas para evitar errores
        if (mascota.lat && mascota.lng) {
            
            // Creamos el marcador en la ubicación de la mascota
            const marcador = L.marker([mascota.lat, mascota.lng]).addTo(mapa);

            // Diseñamos el recuadro que se abre al darle clic al punto del mapa
            const contenidoPopup = `
                <div style="font-family: sans-serif; width: 180px; text-align: center;">
                    <img src="${mascota.imagen}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 5px;">
                    <strong style="font-size: 1.1rem; color: #1e293b;">${mascota.nombre}</strong>
                    <p style="margin: 4px 0; font-size: 0.85rem; color: #64748b;">📍 ${mascota.barrioText || 'Ubicación desconocida'}</p>
                    <span style="display:inline-block; padding: 2px 8px; font-size: 0.75rem; border-radius: 12px; font-weight: bold; background-color: ${mascota.tipo === 'perdido' ? '#fee2e2' : '#d1fae5'}; color: ${mascota.tipo === 'perdido' ? '#ef4444' : '#10b981'};">
                        ${mascota.tipo.toUpperCase()}
                    </span>
                    <br>
                    <a href="#" onclick="abrirModal(${index}); return false;" style="display: inline-block; margin-top: 8px; font-size: 0.85rem; color: #8b5cf6; text-decoration: none; font-weight: bold;">Ver detalles completo →</a>
                </div>
            `;

            // Vincular el recuadro al marcador
            marcador.bindPopup(contenidoPopup);
        }
    });
});
// Función corregida para usar "pinSecreto" e ID único
function solicitarEliminar() {
    if (idMascotaAbierta === null) return;

    // 1. Traer la base de datos actualizada
    let listaActual = JSON.parse(localStorage.getItem('mascotas')) || [];
    
    // Buscamos la posición real comparando los IDs únicos
    const posicionReal = listaActual.findIndex(m => m.id === idMascotaAbierta);

    if (posicionReal === -1) {
        alert("❌ No se encontró el reporte en el sistema.");
        return;
    }

    const mascota = listaActual[posicionReal];

    // 2. Pedir el PIN al usuario
    const pinIngresado = prompt(`Para eliminar el reporte de ${mascota.nombre}, ingresa el código PIN de 4 dígitos creado al registrar la mascota:`);

    if (pinIngresado === null) return; // Si cancela, no hace nada

    // 3. 🎯 CORRECCIÓN AQUÍ: Buscamos "pinSecreto" que es como lo guardas en tu formulario
    const pinCorrecto = mascota.pinSecreto || "1234";

    if (pinIngresado.trim() === pinCorrecto.toString().trim()) {
        // Borramos del arreglo usando la posición real
        listaActual.splice(posicionReal, 1);
        localStorage.setItem('mascotas', JSON.stringify(listaActual));
        
        alert(`✨ ¡Qué gran noticia! Nos alegra mucho que ${mascota.nombre} ya esté a salvo en casa. El reporte ha sido removido.`);
        
        cerrarModal();
        window.location.reload(); // Recarga para actualizar las tarjetas y el mapa
    } else {
        alert("❌ El código PIN ingresado es incorrecto. No tienes permisos para borrar este reporte.");
    }
}