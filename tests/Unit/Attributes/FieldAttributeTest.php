<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;

it('carries a built-in type from the FieldType enum', function () {
    $attribute = new AsField(FieldType::TextInput);

    expect($attribute->type)->toBe('field.text-input');
});

it('accepts a prefixed raw string type for a custom field', function () {
    $attribute = new AsField('field.color-picker');

    expect($attribute->type)->toBe('field.color-picker');
});

it('prefixes a custom field type when the field namespace is omitted', function () {
    $attribute = new AsField('color-picker');

    expect($attribute->type)->toBe('field.color-picker');
});
