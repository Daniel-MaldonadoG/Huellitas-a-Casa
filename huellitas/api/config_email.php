<?php
/**
 * config_email.php
 *
 * Datos de la cuenta de correo que la API usará para ENVIAR los PIN.
 * IMPORTANTE: debes completar esto con tus propios datos antes de que
 * el envío de correos funcione. Mientras tanto, la app sigue funcionando
 * igual (el PIN simplemente se muestra en pantalla como respaldo).
 *
 * -----------------------------------------------------------------
 * CÓMO CONSEGUIR UNA "CONTRASEÑA DE APLICACIÓN" DE GMAIL (recomendado):
 * 1. Entra a https://myaccount.google.com/security
 * 2. Activa la "Verificación en 2 pasos" (si no la tienes activada).
 * 3. Busca "Contraseñas de aplicaciones" (App Passwords).
 * 4. Crea una nueva, elige "Otra" y ponle de nombre "Huellitas Yopal".
 * 5. Google te da una clave de 16 letras: esa (SIN espacios) va en
 *    SMTP_PASS de abajo. NO es la contraseña normal de tu Gmail.
 * -----------------------------------------------------------------
 */

// Cuenta de Gmail (u otro proveedor SMTP) que enviará los correos
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'huellitasyopal@gmail.com');      // 👈 Cambia esto
define('SMTP_PASS', 'ilqi cbcu pxif qyxp');       // 👈 Cambia esto (contraseña de aplicación)
define('SMTP_FROM_NAME', 'Huellitas a Casa - Yopal');
