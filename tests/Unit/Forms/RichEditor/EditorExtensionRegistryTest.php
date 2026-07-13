<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\RichEditor\Attributes\AsEditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtension;
use Lattice\Lattice\Forms\RichEditor\EditorExtensionRegistry;

#[AsEditorExtension('sample')]
final class SampleRegistryExtension extends EditorExtension {}

#[AsEditorExtension('sample')]
final class ConflictingRegistryExtension extends EditorExtension {}

it('registers an extension by its wire type', function (): void {
    $registry = new EditorExtensionRegistry;

    $registry->register(SampleRegistryExtension::class);

    expect($registry->all())->toBe(['sample' => SampleRegistryExtension::class]);
});

it('rejects a class without the AsEditorExtension attribute', function (): void {
    $registry = new EditorExtensionRegistry;

    $registry->register(stdClass::class);
})->throws(InvalidArgumentException::class);

it('rejects a different class claiming an already-used wire type', function (): void {
    $registry = new EditorExtensionRegistry;

    $registry->register(SampleRegistryExtension::class);
    $registry->register(ConflictingRegistryExtension::class);
})->throws(InvalidArgumentException::class);

it('re-registering the same class is a silent no-op', function (): void {
    $registry = new EditorExtensionRegistry;

    $registry->register(SampleRegistryExtension::class);
    $registry->register(SampleRegistryExtension::class);

    expect($registry->all())->toBe(['sample' => SampleRegistryExtension::class]);
});

it('resolves a wire type to its class', function (): void {
    $registry = new EditorExtensionRegistry;

    $registry->register(SampleRegistryExtension::class);

    expect($registry->classFor('sample'))->toBe(SampleRegistryExtension::class)
        ->and($registry->classFor('unknown'))->toBeNull();
});
