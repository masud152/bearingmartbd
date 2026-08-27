import pathlib
import sqlite3

connection = sqlite3.connect(":memory:")
connection.executescript(pathlib.Path("drizzle/0000_site_stats.sql").read_text())
connection.executescript(pathlib.Path("drizzle/0001_admin_panel.sql").read_text())

assert connection.execute("select count(*) from products").fetchone()[0] == 24
assert connection.execute("select count(*) from categories").fetchone()[0] == 6
assert connection.execute("select count(*) from roles").fetchone()[0] == 6
permission_count = connection.execute("select count(*) from permissions").fetchone()[0]
assert permission_count >= 25
assert connection.execute("select count(*) from role_permissions where role_id = 'role_super_admin'").fetchone()[0] == permission_count
print({"products": 24, "categories": 6, "roles": 6, "permissions": permission_count})
