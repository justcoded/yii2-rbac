<?php
/* @var $this View */
/* @var $model \justcoded\yii2\rbac\forms\RoleForm */
/* @var $form \justcoded\yii2\rbac\widgets\RbacActiveForm */

use yii\helpers\Html;
use yii\helpers\Json;
use yii\web\View;

$allowTree = $model->getLinearTree($model->allowPermissions);
$denyTree = $model->getLinearTree($model->denyPermissions);
$inheritTree = $model->getLinearTree($model->inheritPermissions, false);

$this->registerJs('window.allowPermissions = ' . Json::encode(array_values($allowTree)), View::POS_BEGIN);
$this->registerJs('window.denyPermissions = ' . Json::encode(array_values($denyTree)), View::POS_BEGIN);
$this->registerJs('window.inheritPermissions = ' . Json::encode(array_values($inheritTree)), View::POS_BEGIN);
?>
<div class="row js-tree-box">
	<?php if ($model::SCENARIO_CREATE !== $model->scenario) : ?>
		<div class="col-md-3">
			<h4>Inherit Permissions</h4>
			<input type="text" class="simple-input" id="inheritSearch" placeholder="Search..." />
			<div id="inheritPermissions"></div>
		</div>
	<?php endif; ?>
	<div class="col-md-4">
		<h4>Allowed Permissions</h4>
		<input type="text" class="simple-input" id="allowSearch" placeholder="Search..." />
		<div id="allowPermissions"></div>
		<select name="<?= $model->formName() ?>[allowPermissions][]" id="allowPermissionsCntrl" multiple="multiple" class="hidden">
		</select>
	</div>
	<div class="col-md-1">
		<div class="btn-holder">
			<button type="button" class="btn-simple add-all" id="permissions-right-all">move right all</button>
			<button type="button" class="btn-simple add" id="permissions-right">move right</button>
			<button type="button" class="btn-simple remove" id="permissions-left">move left</button>
			<button type="button" class="btn-simple remove-all" id="permissions-left-all">move left all</button>
		</div>
	</div>
	<div class="col-md-4">
		<h4>Denied Permissions</h4>
		<input type="text" class="simple-input" id="denySearch" placeholder="Search..." />
		<div id="denyPermissions"></div>
	</div>
</div>
