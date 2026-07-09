<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Enums\FieldType;

test('the block editor field type maps to its wire string', function (): void {
    expect(FieldType::BlockEditor->value)->toBe('field.block-editor')
        ->and(FieldType::wireType(FieldType::BlockEditor))->toBe('field.block-editor');
});
