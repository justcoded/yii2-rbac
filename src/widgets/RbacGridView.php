<?php

namespace justcoded\yii2\rbac\widgets;

use yii\grid\GridView;

class RbacGridView extends GridView
{
	/**
	 * @inheritdoc
	 * @var string
	 */
	public $layout = '
		{items}
		<div class="row">
			<div class="col-md-6">{summary}</div>
			<div class="col-md-6 text-right">{pager}</div>
		</div>';
}