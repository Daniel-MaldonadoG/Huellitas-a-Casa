<?php
/**
 * conexion.php
 * Conexión centralizada a la base de datos huellitas_yopal usando PDO.
 * Todos los demás archivos de la API incluyen este archivo.
 */

// --- Datos de conexión (por defecto en XAMPP) ---
$DB_HOST = "localhost";
$DB_NAME = "huellitas_yopal";
$DB_USER = "root";
$DB_PASS = ""; // XAMPP por defecto no tiene contraseña

// --- Cabeceras comunes para toda la API (JSON + CORS para pruebas locales) ---
header('Content-Type: application/json; charset=utf8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Peticiones preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "exito"   => false,
        "mensaje" => "Error de conexión a la base de datos: " . $e->getMessage()
    ]);
    exit;
}
