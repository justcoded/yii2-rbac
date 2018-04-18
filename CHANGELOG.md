CHANGELOG
=====================

v1.1.3
---------------------
* Bugfix: Compatibility with Adminlte v2.6.0 (conflict of $.fn.tree plugin name). @ap

v1.1.2
---------------------
* AccessControl filter update default regexp to ^site, in debug mode add gii and debug modules.

v1.1.1
---------------------
* Bugfix: Permission Child/Parents boxes cleanup available options from already exists.
* Bugfix: Permission Child/Parents fixed fatal error on hierarchy loop.

v1.1
---------------------
* NEW: Permissions selector as a real Tree-based selector.
* Bugfix: Fix wrong unique name validations for Role and Permission creating form.
* Bugfix: Fatal error on creating Role/Permission with existed name.

v1.0.2
---------------------
* Bugfix: Routes Scanner take info from comments as well, not class definition.

v1.0.1
---------------------
* Disable inherit permissions in role permissions selector.

v1.0
---------------------
* Rbac console command to init, assign, scan roles
* DbManager, PhpManager with auto master permission set
* Module with GUI interface to manage RBAC
* RouteAccessFilter to use as main access filter
