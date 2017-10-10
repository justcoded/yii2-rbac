<?php

namespace justcoded\yii2\rbac\assets;

class RbacAssetBundle extends \yii\web\AssetBundle
{
	public $sourcePath = '@vendor/justcoded/yii2-rbac/src/assets';

	public $css = [
	];

	public $js = [
		'js/multiselect.min.js',
		'js/rbac.js'
	];
	public $depends = [
		'yii\web\YiiAsset',
		'yii\bootstrap\BootstrapAsset',
	];
}
