<?php

namespace justcoded\yii2\rbac\forms;

use yii\base\Model;
use Yii;
use yii\helpers\ArrayHelper;

abstract class ItemForm extends Model
{
	const SCENARIO_CREATE = 'create';

	public $name;
	public $type;
	public $description;
	public $ruleName;
	public $data;
	public $createdAt;
	public $updatedAt;

	/**
	 * @return array
	 */
	public function rules()
	{
		return  [
			['name', 'match', 'pattern' => static::getNamePattern()],
			[['type', 'name'], 'required'],
			['name', 'uniqueItemName', 'on' => static::SCENARIO_CREATE],
			[['name', 'ruleName'], 'trim'],
			[['name', 'description', 'ruleName', 'data'], 'string'],
			[['type', 'createdAt', 'updatedAt'], 'integer'],
		];
	}

	/**
	 * Validate item (permission/role) name to be unique
	 *
	 * @param string $attribute
	 * @param array  $params
	 * @param mixed  $validator
	 *
	 * @return bool
	 */
	abstract public function uniqueItemName($attribute, $params, $validator);

	/**
	 * @inheritdoc
	 */
	public function attributeLabels()
	{
		return [
			'name' => 'Name',
			'description' => 'Description',
			'ruleName' => 'Rule Class',
		];
	}

	/**
	 * RBAC Item name validation pattern
	 *
	 * @return string
	 */
	public static function getNamePattern()
	{
		return '/^[a-z0-9\s\_\-\/\*]+$/i';
	}

}