<?php

namespace justcoded\yii2\src\components;

use justcoded\yii2\src\models\Item;
use yii\db\Query;
use yii\rbac\Permission;

class PhpManager extends \yii\rbac\PhpManager
{
	use AutoMasterItemTrait;

	/**
	 * @var Permission|null
	 */
	protected $_masterPermission;
}
