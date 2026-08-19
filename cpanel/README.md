# Bearing Mart BD — cPanel deployment

This folder contains the PHP/MySQL version of the site and its admin panel.

## Deploy

1. Create a MySQL database and database user in cPanel.
2. Upload the contents of this `cpanel` folder to `public_html`.
3. Edit `config.php` with the database details and your domain URL.
4. Visit `/install.php` once to create the tables and set the first admin password.
5. Delete `install.php` after installation, then sign in at `/admin.php`.

The panel lets the administrator update products, prices, homepage text, contact details, slideshow images, and partner logos.
