<?php
/* @var $this \yii\web\View */
/* @var $treeItems array */
/* @var $disabled bool */

use yii\helpers\Html;

?>
<?php foreach ($treeItems as $item) : ?>
	<option value="<?= Html::encode($item['id']) ?>" data-weight="<?= $item['order']; ?>"
			<?= !empty($disabled)? 'disabled="disabled"' : '' ?>
	        style="padding-left: <?= $item['depth'] * 20; ?>px;" selected="selected">
		<?= Html::encode($item['text']) ?>
	</option>
<?php endforeach; ?>
