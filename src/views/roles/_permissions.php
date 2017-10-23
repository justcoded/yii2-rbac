<?php
/* @var $this View */
/* @var $model \justcoded\yii2\rbac\forms\RoleForm */
/* @var $form \yii\bootstrap\ActiveForm */

use yii\helpers\Html;
use yii\helpers\Json;
use yii\web\View;

$allowTree = $model->getLinearTree($model->allowPermissions);
$denyTree = $model->getLinearTree($model->denyPermissions);
$inheritTree = $model->getLinearTree($model->inheritPermissions, false);

$this->registerJs('window.allowPermissions = ' . Json::encode(array_values($allowTree)), View::POS_BEGIN);
$this->registerJs('window.denyPermissions = ' . Json::encode(array_values($denyTree)), View::POS_BEGIN);
$this->registerJs('window.inheritPermissions = ' . Json::encode(array_values($inheritTree)), View::POS_BEGIN);
// TODO: update to tree structured dual list panel
?>
<div class="row permissions-tree">
	<div class="col-md-3">
		<h4>Inherit Permissions</h4>
		<input type="text" class="simple-input" id="inheritSearch" placeholder="Search..." />
		<div id="inheritPermissions"></div>
	</div>
	<div class="col-md-4">
		<h4>Allowed Permissions</h4>
		<input type="text" class="simple-input" id="allowSearch" placeholder="Search..." />
		<div id="allowPermissions"></div>
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

<?php /*
<div class="row">
	<div class="col-sm-5">
		<h4>Allowed Permissions</h4>
		<select name="<?= $model->formName() ?>[allowPermissions][]" id="allow_permissions" class="form-control" size="16" multiple="multiple">
			<?= $this->render('_permission-options', ['treeItems' => $allowTree]); ?>

			<?php if (!empty($inheritTree)) : ?>
			<optgroup label="Inherit Permissions" data-weight="<?= end($inheritTree)['order']; ?>">
				<?= $this->render('_permission-options', ['treeItems' => $inheritTree, 'disabled' => true]); ?>
			</optgroup>
			<?php endif; ?>
		</select>
	</div>

	<div class="col-sm-2">
		<h4>&nbsp;</h4>
		<button type="button" id="allow_permissions_rightAll" class="btn btn-block"><i class="glyphicon glyphicon-forward"></i></button>
		<button type="button" id="allow_permissions_rightSelected" class="btn btn-block"><i class="glyphicon glyphicon-chevron-right"></i></button>
		<button type="button" id="allow_permissions_leftSelected" class="btn btn-block"><i class="glyphicon glyphicon-chevron-left"></i></button>
		<button type="button" id="allow_permissions_leftAll" class="btn btn-block"><i class="glyphicon glyphicon-backward"></i></button>
	</div>

	<div class="col-sm-5">
		<h4>Denied Permissions</h4>
		<select id="deny_permissions" class="form-control" size="16" multiple="multiple">
			<?= $this->render('_permission-options', ['treeItems' => $denyTree]); ?>
		</select>
	</div>
</div>
 */ ?>