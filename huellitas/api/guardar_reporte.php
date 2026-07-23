<?php
/**
 * guardar_reporte.php
 * POST /api/guardar_reporte.php
 *
 * Ahora recibe multipart/form-data (no JSON), porque incluye un
 * archivo real de imagen. Campos esperados en $_POST:
 *   nombre, tipo, zona, barrioText, raza, color, telefono, correo, descripcion
 * Archivo esperado en $_FILES:
 *   imagen (la foto de la mascota)
 *
 * Guarda la foto en /imagenes/reportes/, guarda el reporte en la BD,
 * genera el PIN y trata de enviarlo por correo. Si el correo falla
 * (por ejemplo, config_email.php sin configurar), igual responde con
 * el PIN en el JSON para que el front-end lo muestre como respaldo.
 */

require_once "conexion.php";
require_once "enviar_correo.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido, usa POST."]);
    exit;
}

// --- Leer campos de texto desde $_POST (multipart/form-data) ---
$nombre      = trim($_POST['nombre'] ?? '');
$tipo        = trim($_POST['tipo'] ?? '');
$zona        = trim($_POST['zona'] ?? '');
$barrioText  = trim($_POST['barrioText'] ?? '');
$raza        = trim($_POST['raza'] ?? '');
$color       = trim($_POST['color'] ?? '');
$telefono    = trim($_POST['telefono'] ?? '');
$correo      = trim($_POST['correo'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');

// --- Validación de campos obligatorios ---
$camposTexto = [
    'nombre' => $nombre, 'tipo' => $tipo, 'zona' => $zona, 'barrioText' => $barrioText,
    'raza' => $raza, 'color' => $color, 'telefono' => $telefono, 'correo' => $correo,
    'descripcion' => $descripcion,
];
foreach ($camposTexto as $campo => $valor) {
    if ($valor === '') {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "Falta el campo obligatorio: $campo"]);
        exit;
    }
}

if (!in_array($tipo, ['perdido', 'encontrado'])) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "El campo 'tipo' debe ser 'perdido' o 'encontrado'."]);
    exit;
}

if (!preg_match('/^[0-9]{10}$/', $telefono)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "El teléfono debe tener exactamente 10 dígitos."]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "El correo electrónico no es válido."]);
    exit;
}

// --- Validar el archivo de imagen ---
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "Debes subir una foto de la mascota."]);
    exit;
}

$archivo = $_FILES['imagen'];

// Máximo 5 MB
if ($archivo['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "La imagen no puede pesar más de 5 MB."]);
    exit;
}

// Solo permitir imágenes reales (se valida el tipo MIME real del archivo, no solo la extensión)
$tiposPermitidos = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];

$infoArchivo = getimagesize($archivo['tmp_name']);
if ($infoArchivo === false || !isset($tiposPermitidos[$infoArchivo['mime']])) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "El archivo debe ser una imagen JPG, PNG o WEBP."]);
    exit;
}

$extension = $tiposPermitidos[$infoArchivo['mime']];
$nombreArchivo = uniqid('mascota_', true) . '.' . $extension;

// Carpeta donde se guardan las fotos subidas (relativa a /api)
$carpetaDestino = __DIR__ . '/../imagenes/reportes/';
if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0755, true);
}

$rutaCompleta = $carpetaDestino . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "No se pudo guardar la imagen en el servidor. Revisa los permisos de la carpeta imagenes/reportes."]);
    exit;
}

// Ruta relativa que se guarda en la BD y que usará el navegador para mostrar la foto
$rutaImagenBD = 'imagenes/reportes/' . $nombreArchivo;

// --- Coordenadas base por zona ---
$coordenadasZona = [
    'centro'            => [5.349390, -72.400750],
    'casimena'          => [5.33150, -72.38820],
    'resurgimiento'     => [5.341110, -72.400560],
    'unicentro'         => [5.347655, -72.389811],
    'sirivana'          => [5.34620, -72.37850],
    'terminal'          => [5.335335, -72.390474],
    'aeropuerto'        => [5.319440, -72.383890],
    'bicentenario'      => [5.340301, -72.390966],
    'hospital_materno'  => [5.325200, -72.396890],
    'horo'              => [5.341360, -72.407850],
    'parque_intra'      => [5.334213, -72.392534],
    'alkosto'           => [5.339935, -72.386091],
    'las_americas'      => [5.322863, -72.371022],
    'parque_hobos'      => [5.346465, -72.376269],
    'el_exito'          => [5.334998, -72.385180],
    'calle_40'          => [5.318734, -72.403926],
    'parque_herradura'  => [5.342630, -72.397892],
    'museo_oriente'     => [5.333874, -72.404915],
];

[$latBase, $lngBase] = $coordenadasZona[$zona] ?? [5.349390, -72.400750];

// Pequeño desvío aleatorio para que los pines no se superpongan
$desvioLat = (mt_rand(-15, 15) / 10000);
$desvioLng = (mt_rand(-15, 15) / 10000);

$lat = $latBase + $desvioLat;
$lng = $lngBase + $desvioLng;

// --- Generar PIN secreto de 4 dígitos ---
$pinSecreto = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

$sql = "INSERT INTO mascotas
        (nombre, tipo, zona, barrio_text, raza, color, telefono, correo, descripcion, imagen, pin_secreto, lat, lng)
        VALUES
        (:nombre, :tipo, :zona, :barrio_text, :raza, :color, :telefono, :correo, :descripcion, :imagen, :pin_secreto, :lat, :lng)";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nombre'      => $nombre,
        ':tipo'        => $tipo,
        ':zona'        => $zona,
        ':barrio_text' => $barrioText,
        ':raza'        => $raza,
        ':color'       => $color,
        ':telefono'    => $telefono,
        ':correo'      => $correo,
        ':descripcion' => $descripcion,
        ':imagen'      => $rutaImagenBD,
        ':pin_secreto' => $pinSecreto,
        ':lat'         => $lat,
        ':lng'         => $lng,
    ]);

    $idNuevo = $pdo->lastInsertId();

    // --- Intentar enviar el PIN por correo ---
    $asunto = "🐾 Tu PIN para el reporte de \"$nombre\" - Huellitas a Casa";
    $cuerpoHtml = "
        <div style='font-family: sans-serif; color:#23272a;'>
            <h2 style='color:#7f32d4;'>¡Reporte creado con éxito!</h2>
            <p>Gracias por publicar el reporte de <strong>$nombre</strong> en Huellitas a Casa Yopal.</p>
            <p>Este es tu código PIN. Lo necesitarás únicamente cuando quieras eliminar la publicación
            (por ejemplo, cuando la mascota ya haya regresado a casa):</p>
            <p style='font-size: 28px; font-weight:bold; letter-spacing: 4px; background:#f5f0ff; color:#7f32d4; padding: 12px 20px; display:inline-block; border-radius:10px;'>$pinSecreto</p>
            <p>Guárdalo en un lugar seguro. Nadie más podrá eliminar tu publicación sin este código.</p>
            <hr style='border:none; border-top:1px solid #e2e8f0; margin: 20px 0;'>
            <p style='font-size: 0.85rem; color:#64748b;'>Huellitas a Casa - Yopal, Casanare</p>
        </div>
    ";

    $correoEnviado = enviarCorreo($correo, $asunto, $cuerpoHtml);

    echo json_encode([
        "exito"          => true,
        "mensaje"        => "Reporte creado con éxito.",
        "id"             => $idNuevo,
        "pin_secreto"    => $pinSecreto,
        "correo_enviado" => $correoEnviado,
    ]);
} catch (PDOException $e) {
    // Si algo falla al guardar en la BD, borramos la imagen que ya se había subido
    if (file_exists($rutaCompleta)) {
        unlink($rutaCompleta);
    }
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error al guardar: " . $e->getMessage()]);
}
