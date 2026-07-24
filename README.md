🐾 Huellitas a Casa - Yopal

Plataforma comunitaria para reportar y encontrar mascotas perdidas en Yopal, Casanare. Conecta a personas que perdieron una mascota con quienes la encontraron, usando un mapa interactivo de la ciudad y un sistema de reportes con foto.

Proyecto académico desarrollado con HTML, CSS, JavaScript, PHP y MySQL, pensado para correr en un entorno local con XAMPP.

 Funcionalidades
-Reportar mascotas perdidas o encontradas, con foto, raza, color, zona y descripción.
- Mapa interactivo (Leaflet + OpenStreetMap) con más de 15 zonas reales de Yopal.
- Eliminación segura de reportes mediante un PIN de 4 dígitos generado automáticamente.
- Envío del PIN por correo electrónico (vía SMTP con PHPMailer).
- Subida real de fotos (no enlaces externos) con validación de formato y tamaño.
- Diseño responsive, con menú tipo hamburguesa en pantallas pequeñas.
- Sección de historias de reencuentro y estadísticas de la comunidad.
- Tecnologías usadas
Capa	Tecnología
Front-end:	HTML5, CSS3, JavaScript (Vanilla, Fetch API)
Mapa:	Leaflet.js + OpenStreetMap
Back-end:	PHP (PDO)
Base de datos:	MySQL / MariaDB
Envío de correos:	PHPMailer vía SMTP
Entorno local	XAMPP (Apache + PHP + MySQL)

 Estructura del proyecto
huellitas/
├── index.html                 # Página principal (catálogo + mapa)
├── reportar.html               # Formulario para crear un reporte
├── estilos.css                 # Estilos generales del sitio
├── estilos-reportar.css        # Estilos exclusivos del formulario
├── scripts.js                  # Lógica del front-end (fetch a la API, mapa, modal, menú)
├── huellitas_yopal.sql         # Script para crear la base de datos desde cero
├── imagenes/
│   ├── Logo.png, Max.jpg, ...  # Imágenes estáticas del sitio
│   └── reportes/               # Fotos subidas por los usuarios (se llena solo)
└── api/
    ├── conexion.php            # Conexión PDO a MySQL
    ├── listar_mascotas.php     # GET  - Lista los reportes activos
    ├── guardar_reporte.php     # POST - Crea un reporte (con foto) y envía el PIN por correo
    ├── eliminar_reporte.php    # POST - Valida el PIN y marca un reporte como resuelto
    ├── enviar_correo.php       # Función auxiliar para enviar correos con PHPMailer
    ├── config_email.php        # Credenciales SMTP (debes completarlas tú)
    └── PHPMailer/               # Librería PHPMailer (PHPMailer.php, SMTP.php, Exception.php)

  Instalación local (XAMPP)
1. Requisitos
XAMPP con Apache, PHP ≥ 7.4 y MySQL/MariaDB.
Una cuenta de correo (recomendado: una cuenta de Gmail dedicada al proyecto) para el envío de PIN.
2. Clonar/copiar el proyecto

Coloca esta carpeta dentro de tu directorio htdocs:

C:\xampp\htdocs\huellitas\
3. Crear la base de datos
Inicia Apache y MySQL desde el panel de XAMPP.
Ve a http://localhost/phpmyadmin.
Pestaña Importar → selecciona huellitas_yopal.sql → Continuar.

Esto crea la base huellitas_yopal con las tablas mascotas y zonas, además de datos de ejemplo.

4. Configurar la conexión a la base de datos

Abre api/conexion.php y confirma tus credenciales (por defecto en XAMPP: usuario root, sin contraseña):

php
$DB_HOST = "localhost";
$DB_NAME = "huellitas_yopal";
$DB_USER = "root";
$DB_PASS = "";
5. Configurar el envío de correos (opcional, pero recomendado)

Edita api/config_email.php con tu propio correo y una contraseña de aplicación de Gmail (no tu contraseña normal — las instrucciones están dentro del mismo archivo):

php
define('SMTP_USER', 'tu_correo@gmail.com');
define('SMTP_PASS', 'xxxx xxxx xxxx xxxx');

Si no lo configuras, la aplicación sigue funcionando: el PIN simplemente se muestra en pantalla en lugar de llegar por correo.

6. Crear la carpeta de imágenes subidas

Verifica que exista esta carpeta (vacía) dentro del proyecto:

imagenes/reportes/
7. Abrir el sitio

Ve a:
http://localhost/huellitas/index.html

 Endpoints de la API
Método	Endpoint	Descripción
GET	api/listar_mascotas.php	Lista los reportes activos (filtros opcionales ?tipo= y ?zona=)
POST	api/guardar_reporte.php	Crea un nuevo reporte (recibe multipart/form-data, incluida la foto)
POST	api/eliminar_reporte.php	Marca un reporte como resuelto, validando id + pin

Más detalles y ejemplos de uso en api/README.md.

 Zonas de Yopal disponibles
El sistema ubica los reportes en más de 15 puntos reales de la ciudad: Centro (Parque Principal), Barrio Casimena, Parque El Resurgimiento, Unicentro, Vía Sirivana, Terminal de Transporte, Zona Aeropuerto, Parque Bicentenario, Hospital Materno Infantil, HORO, Parque Intra, Alkosto, Barrio Las Américas, Parque Los Hobos, El Éxito, Calle 40, Parque La Herradura y Museo Centro Histórico del Oriente.

 Posibles mejoras futuras
 Autenticación de usuarios (para gestionar varios reportes desde una sola cuenta).
 Panel de administración para moderar publicaciones.
 Notificaciones push cuando una mascota reportada como "encontrada" coincida con una "perdida" en la misma zona.
 Búsqueda y filtros por raza/color en el catálogo.
 
 Licencia
Este proyecto se comparte con fines educativos. Puedes usarlo, modificarlo y adaptarlo libremente citando la fuente original.

 Autor
Desarrollado como proyecto académico para la comunidad de Yopal, Casanare. 🐾
