<?php

namespace justcoded\yii2\rbac\assets;

class RbacAssetBundle extends \yii\web\AssetBundle
{
	public $sourcePath = '@vendor/justcoded/yii2-rbac/src/assets';

	public $css = [
		'css/jstree.min.css',
		'css/custom.css',
	];

	public $js = [
		'js/jstree.min.js',
		'js/jstree-double-panel.js',
		'js/rbac.js'
	];
	public $depends = [
		'yii\web\YiiAsset',
		'yii\bootstrap\BootstrapAsset',
	];
}
