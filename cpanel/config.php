<?php
declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'REPLACE_WITH_DATABASE_NAME';
const DB_USER = 'REPLACE_WITH_DATABASE_USER';
const DB_PASSWORD = 'REPLACE_WITH_DATABASE_PASSWORD';
const SITE_URL = 'https://your-domain.com';
const ADMIN_EMAIL = 'masud@bearingmardbd.com';

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

function setting(string $key, string $fallback = ''): string {
    $statement = db()->prepare('SELECT value FROM settings WHERE `key` = ? LIMIT 1');
    $statement->execute([$key]);
    return $statement->fetchColumn() ?: $fallback;
}

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function verify_csrf(): void {
    if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) { http_response_code(419); exit('Invalid request. Please try again.'); }
}

function admin_required(): void {
    if (empty($_SESSION['admin_id'])) { header('Location: admin.php'); exit; }
}

function upload_image(string $field): ?string {
    if (empty($_FILES[$field]['tmp_name']) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) return null;
    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $type = mime_content_type($_FILES[$field]['tmp_name']);
    if (!isset($allowed[$type]) || $_FILES[$field]['size'] > 5 * 1024 * 1024) return null;
    if (!is_dir(__DIR__ . '/uploads')) mkdir(__DIR__ . '/uploads', 0755, true);
    $name = bin2hex(random_bytes(16)) . '.' . $allowed[$type];
    move_uploaded_file($_FILES[$field]['tmp_name'], __DIR__ . '/uploads/' . $name);
    return 'uploads/' . $name;
}
