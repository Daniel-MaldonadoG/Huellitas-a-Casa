<?php
/**
 * listar_mascotas.php
 * GET /api/listar_mascotas.php
 * GET /api/listar_mascotas.php?tipo=perdido
 * GET /api/listar_mascotas.php?zona=casimena
 *
 * Devuelve el listado de mascotas activas (estado_activo = 1),
 * con filtros opcionales por tipo y/o zona.
 */

require_once "conexion.php";

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido, usa GET."]);
    exit;
}

$sql = "SELECT id, nombre, tipo, zona, barrio_text, raza, color, telefono,
               descripcion, imagen, lat, lng, fecha_creacion
        FROM mascotas
        WHERE estado_activo = 1";

$condiciones = [];
$parametros  = [];

if (!empty($_GET['tipo']) && in_array($_GET['tipo'], ['perdido', 'encontrado'])) {
    $condiciones[] = "tipo = :tipo";
    $parametros[':tipo'] = $_GET['tipo'];
}

if (!empty($_GET['zona'])) {
    $condiciones[] = "zona = :zona";
    $parametros[':zona'] = $_GET['zona'];
}

if ($condiciones) {
    $sql .= " AND " . implode(" AND ", $condiciones);
}

$sql .= " ORDER BY fecha_creacion DESC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($parametros);
    $mascotas = $stmt->fetchAll();

    echo json_encode([
        "exito"    => true,
        "total"    => count($mascotas),
        "mascotas" => $mascotas
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error al consultar: " . $e->getMessage()]);
}
