<?php
declare(strict_types=1);

use Lattice\Blocks\BlockEditorRegistry;
use Lattice\Blocks\BlockRegistry;
use Lattice\Blocks\Builtin\ColumnsBlock;
use Lattice\Blocks\Builtin\HeadingBlock;
use Lattice\Core\Exceptions\UnknownComponent;
use Workbench\App\BlockEditors\PagesEditor;
use Workbench\App\Blocks\HeroBlock;

it('discovers built-in and workbench blocks by their attribute key', function (): void {
    $registry = app(BlockRegistry::class);

    expect($registry->resolve('lattice.heading'))->toBeInstanceOf(HeadingBlock::class)
        ->and($registry->resolve('workbench.hero'))->toBeInstanceOf(HeroBlock::class)
        ->and($registry->keyOf(ColumnsBlock::class))->toBe('lattice.columns')
        ->and($registry->has('nope'))->toBeFalse();
});

it('throws UnknownComponent for an unknown block key', function (): void {
    app(BlockRegistry::class)->resolve('nope');
})->throws(UnknownComponent::class);

it('describes a block type for the editor from its attribute, fields, and slots', function (): void {
    $type = app(BlockRegistry::class)->typeData('lattice.columns');

    expect($type->label)->toBe('Columns')
        ->and($type->icon)->toBe('columns-2')
        ->and($type->category)->toBe('layout')
        ->and($type->keywords)->toContain('grid')
        ->and(array_column($type->slots, 'name'))->toBe(['col_1', 'col_2', 'col_3', 'col_4'])
        ->and($type->defaults)->toBe(['count' => '2'])
        ->and($type->schema)->toHaveCount(1)
        ->and($type->supports->width)->toBeTrue();
});

it('offers only the editor definition its declared blocks', function (): void {
    $editors = app(BlockEditorRegistry::class);
    $definition = $editors->resolve('workbench.pages');

    expect($definition)->toBeInstanceOf(PagesEditor::class)
        ->and($editors->allowedTypes($definition))->toContain('workbench.hero', 'lattice.paragraph')
        ->and($editors->endpointFor('workbench.pages'))->toBe('/lattice/block-editors/workbench.pages');
});
