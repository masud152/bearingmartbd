<?php
declare(strict_types=1);
require __DIR__ . '/config.php';

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    if (strlen($password) < 10) $message = 'Choose a password with at least 10 characters.';
    else {
        $sql = file_get_contents(__DIR__ . '/schema.sql');
        foreach (array_filter(array_map('trim', explode(";", $sql))) as $query) db()->exec($query);
        db()->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)')
            ->execute([ADMIN_EMAIL, password_hash($password, PASSWORD_DEFAULT)]);
        $defaults = [
            'hero_title' => 'Quality Bearings. Smooth Solutions.',
            'hero_text' => 'Reliable bearings and machinery solutions for workshops, factories, and industrial operations across Bangladesh.',
            'phone' => '+880 1730-015018',
            'address' => '10, Modonpal Lane, Siddique Machineries Market (2nd Floor), Nawabpur, Dhaka-1100',
        ];
        $insert = db()->prepare('INSERT IGNORE INTO settings (`key`, value) VALUES (?, ?)');
        foreach ($defaults as $key => $value) $insert->execute([$key, $value]);
        $message = 'Installation complete. Delete install.php now, then sign in from admin.php.';
    }
}
?>
<!doctype html><html><head><meta charset="utf-8"><title>Install Bearing Mart BD</title><link rel="stylesheet" href="style.css"></head><body class="admin-body"><main class="login-card"><h1>Install admin panel</h1><p>Admin email: <?= htmlspecialchars(ADMIN_EMAIL) ?></p><?php if ($message): ?><p class="notice"><?= htmlspecialchars($message) ?></p><?php endif; ?><form method="post"><label>Set admin password<input type="password" name="password" minlength="10" required></label><button>Install</button></form></main></body></html>
