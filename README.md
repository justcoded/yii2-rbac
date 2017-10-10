<p align="center">
    <a href="https://github.com/yiisoft" target="_blank">
        <img src="https://avatars0.githubusercontent.com/u/993323" height="100px">
    </a>
    <h1 align="center">Yii 2 JustCoded RBAC extension</h1>
    <br>
</p>

Extended RBAC Manager with route-based access.

### Features

#### Pre-defined Roles and Permissions

By default this extension init such roles and permissions:

__Permissions:__

* __\*__ - master permission. parent of all other permissions 
* __administer__ - permission you may use to check access to admin panel

__Roles:__

* __Guest__ - not authenticated user
* __Authenticated__ - authenticated user (you will need to add it by yourself you users)
* __Administrator__ - has `administer` permission, so has access to admin panel
* __Master__ - has `*` permission, super user with access to everything

#### Routes Scanner

Special console command (or GUI interface) has feature to scan your project files and import permissions like:

* {controller->uniqueId}/*
* {controller->uniqueId}/{action->id}

You can create additional roles (or add permissions to existed roles) to configure your system high-level access.

#### Routes Access filter

Most popular thing in RBAC configuration is to close access to some parts of the site (logged in area, 
different user roles, admin area, etc.).

Extension provides filter very similar to standard AccessControl which check `{controller->uniqueId}/*`, 
`{controller->uniqueId}/{action->id}` permission on page load and throw 403 error if you're not allowed
to access routes.

#### GUI

Simple GUI* interface to manage your roles and permissions.

> **Note:** GUI still has alpha version features. Don't share access to this GUI to your clients!

### Installation

The preferred way to install this extension is through composer.

Either run

```bash
php composer.phar require --prefer-dist justcoded/yii2-rbac "*"
```

or add

```
"justcoded/yii2-rbac": "*"
```

to the require section of your composer.json.

### Configuration

#### Component Setup

To use the RBAC extension, you need to configure the components array in your application configuration:

```php
'modules' => [
	...
	'rbac' => [
		'class' => 'justcoded\yii2\rbac\Module'
	],
	...
],
'components' => [
	...
	'authManager' => [
		'class' => 'justcoded\yii2\rbac\components\DbManager',
		//'class' => 'justcoded\yii2\rbac\components\PhpManager',
	],
	...
],
```

#### Basic RBAC configuration

Please follow [oficial documentation](http://www.yiiframework.com/doc-2.0/guide-security-authorization.html#configuring-rbac)
to configure RBAC storage (create necessary files or database tables).

If you use DbManager you can init database tables with the following migration command:
 
```bash
yii migrate --migrationPath=@yii/rbac/migrations
```

#### Init base roles

Before usage this extension you will need to init default roles, which are pre-defined for it.

To do that you will need to run several commands:

```bash
# init base roles and administer/master permission 
php yii rbac/init

# assign master role to some user (in this case user with ID = 1)
php yii rbac/assign-master 1

# scan your application routes
php yii rbac/scan

# ADVANCED TEMPLATE ONLY: scan routes for rbac module.
php yii rbac/scan -p='@vendor/justcoded/yii2-rbac' -b='rbac/'

# BASIC TEMPLATE ONLY: in case you use 'admin' module for backend:
php yii rbac/scan -p='@vendor/justcoded/yii2-rbac' -b='admin/rbac/'
```


### Usage

#### GUI interface

To use graphical interface just follow the route you specified as base when scan routes / configure module.

> **Note:** Role Permissions selector is a hotfix solution, so it doesn't display proper tree structure when
you move items between boxes.
> This will be fixed in next versions.

#### Route Access filter

RouteAccessControl filter can be used inside specific controller (or globally) to control access to 
controller actions on very high level.

Routes scanner insert permissions like:

{controller->uniqueId}/*
{controller->uniqueId}/{action->id}

On controller beforeAction this filter check that current logged in user has permissions to access these routes. 

To enable filter inside some specific controller:

```php
	public function actions()
	{
		return [
			'routeAccess' => [
				'class' => 'justcoded\yii2\rbac\filters\RouteAccessControl',
			],
		];
	}
```

Or you can configure this filter globally. Inside you current application config just add such section:

```php
	'as routeAccess' => [
		'class' => 'justcoded\yii2\rbac\filters\RouteAccessControl',
		'allowActions' => [
			'site/*',
		],
		'allowRegexp' => '/(gii)/i', // optional
	],
```

### Example

You can check the example on our [Yii2 starter kit](https://github.com/justcoded/yii2-starter).