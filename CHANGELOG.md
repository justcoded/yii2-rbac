CHANGELOG
=====================

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
* Bugfix: Fix wrong unique name validations for Role and Permission creating form

v1.0.2
---------------------
* Bugfix: Routes Scanner take info from comments as well, not class definition.

v1.0.1
---------------------
* Disable inherit permissions in role permissions multi-select box.

v1.0
---------------------
* Rbac console command to init, assign, scan roles
* DbManager, PhpManager with auto master permission set
* Module with GUI interface to manage RBAC
* RouteAccessFilter to use as main access filter
