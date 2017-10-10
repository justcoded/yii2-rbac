<?php

namespace justcoded\yii2\rbac\components;

use justcoded\yii2\rbac\models\Item;
use yii\db\Query;
use yii\rbac\Permission;

class DbManager extends \yii\rbac\DbManager
{
	use AutoMasterItemTrait;

	/**
	 * @var Permission|null
	 */
	protected $_masterPermission;
}
