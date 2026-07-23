<?php
/**
 * enviar_correo.php
 * Función auxiliar que envía un correo usando PHPMailer + SMTP.
 * La usan guardar_reporte.php (para mandar el PIN).
 *
 * Devuelve true si el correo se envió, false si falló (por ejemplo,
 * si config_email.php todavía tiene los datos de ejemplo sin cambiar).
 */

require_once __DIR__ . "/PHPMailer/Exception.php";
require_once __DIR__ . "/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/PHPMailer/SMTP.php";
require_once __DIR__ . "/config_email.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function enviarCorreo(string $destinatario, string $asunto, string $cuerpoHtml): bool
{
    // Si el usuario no ha configurado sus propios datos SMTP, no intentamos enviar
    if (SMTP_USER === 'tu_correo@gmail.com' || SMTP_PASS === 'xxxx xxxx xxxx xxxx') {
        error_log("[Huellitas] config_email.php no ha sido configurado todavía. No se envió el correo.");
        return false;
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom(SMTP_USER, SMTP_FROM_NAME);
        $mail->addAddress($destinatario);

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body    = $cuerpoHtml;
        $mail->AltBody  = strip_tags($cuerpoHtml);

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("[Huellitas] Error al enviar correo: " . $mail->ErrorInfo);
        return false;
    }
}
