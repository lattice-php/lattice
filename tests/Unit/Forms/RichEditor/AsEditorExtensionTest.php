<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;

it('returns the wire type declared by the attribute', function (): void {
    expect(new AsEditorExtension('heading')->wireType())->toBe('heading');
});

it('throws for a class missing the attribute', function (): void {
    AsEditorExtension::wireTypeForClass(stdClass::class);
})->throws(LogicException::class);
