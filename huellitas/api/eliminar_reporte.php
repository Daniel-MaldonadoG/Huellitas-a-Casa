<?php
/**
 * eliminar_reporte.php
 * POST /api/eliminar_reporte.php
 * Body JSON esperado:
 * { "id": 12, "pin": "1234" }
 *
 * Valida el PIN y, si es correcto, desactiva el reporte
 * (estado_activo = 0) en lugar de borrarlo físicamente,
 * para conservar el historial.
 */

require_once "conexion.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido, usa POST."]);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true);

if (!$datos || empty($datos['id']) || empty($datos['pin'])) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "Debes enviar 'id' y 'pin'."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nombre, pin_secreto FROM mascotas WHERE id = :id AND estado_activo = 1");
    $stmt->execute([':id' => $datos['id']]);
    $mascota = $stmt->fetch();

    if (!$mascota) {
        http_response_code(404);
        echo json_encode(["exito" => false, "mensaje" => "No se encontró el reporte."]);
        exit;
    }

    if (trim((string) $datos['pin']) !== trim((string) $mascota['pin_secreto'])) {
        http_response_code(403);
        echo json_encode(["exito" => false, "mensaje" => "El PIN ingresado es incorrecto."]);
        exit;
    }

    $update = $pdo->prepare("UPDATE mascotas SET estado_activo = 0 WHERE id = :id");
    $update->execute([':id' => $datos['id']]);

    echo json_encode([
        "exito"   => true,
        "mensaje" => "¡Qué gran noticia! {$mascota['nombre']} ya fue marcado como resuelto."
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error al eliminar: " . $e->getMessage()]);
}
