<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockRenderer;
use Lattice\Blocks\BlockStyle;
use Lattice\Blocks\Components\BlockView;
use Lattice\Blocks\Enums\BlockWidth;
use Lattice\Core\Support\Wire;

it('renders the whole tree with frames around blocks and children inside slot outlets', function (): void {
    $wire = Wire::toArray(BlockView::document(sampleBlockDocument()));

    expect($wire['type'])->toBe('blocks.view')
        ->and($wire['schema'])->toHaveCount(2)
        ->and($wire['schema'][0]['type'])->toBe('blocks.frame')
        ->and($wire['schema'][0]['props']['blockId'])->toBe('b_heading')
        ->and($wire['schema'][0]['schema'][0]['type'])->toBe('heading')
        ->and($wire['schema'][0]['schema'][0]['props']['text'])->toBe('Welcome')
        ->and($wire['schema'][0]['schema'][0]['props']['level'])->toBe(2);

    $columns = $wire['schema'][1];
    $grid = $columns['schema'][0];

    expect($grid['type'])->toBe('grid')
        ->and($grid['schema'])->toHaveCount(2)
        ->and($grid['schema'][0]['type'])->toBe('blocks.slot')
        ->and($grid['schema'][0]['props']['name'])->toBe('col_1')
        ->and($grid['schema'][0]['schema'][0]['props']['blockId'])->toBe('b_left')
        ->and($grid['schema'][0]['schema'][0]['schema'][0]['props']['html'])->toContain('Left');
});

it('renders shallowly for the editor, leaving slot outlets empty', function (): void {
    $rendered = app(BlockRenderer::class)->renderShallowAll(sampleBlockDocument());

    expect(array_keys($rendered))->toBe(['b_heading', 'b_columns', 'b_left', 'b_right']);

    $columns = Wire::toArray($rendered['b_columns']);

    expect($columns['schema'][0]['schema'][0]['type'])->toBe('blocks.slot')
        ->and($columns['schema'][0]['schema'][0]['schema'] ?? [])->toBe([]);
});

it('carries the stored style and the block supports on the frame', function (): void {
    $node = new BlockNode('b_sep', 'lattice.separator', [], new BlockStyle(width: BlockWidth::Wide, anchor: 'rule'));
    $frame = Wire::toArray(app(BlockRenderer::class)->renderShallow($node));

    expect($frame['props']['style']['width'])->toBe('wide')
        ->and($frame['props']['style']['anchor'])->toBe('rule')
        ->and($frame['props']['supports']['background'])->toBeFalse()
        ->and($frame['props']['supports']['width'])->toBeTrue();
});

it('renders a placeholder for a block whose type is gone and keeps rendering the rest', function (): void {
    $document = new BlockDocument([
        BlockNode::make('vendor.gone', ['x' => 1], id: 'b_gone'),
        BlockNode::make('lattice.separator', id: 'b_sep'),
    ]);

    $wire = Wire::toArray(BlockView::document($document));

    expect($wire['schema'][0]['schema'][0]['type'])->toBe('blocks.unknown')
        ->and($wire['schema'][0]['schema'][0]['props']['blockType'])->toBe('vendor.gone')
        ->and($wire['schema'][0]['props']['supports']['width'])->toBeFalse()
        ->and($wire['schema'][1]['schema'][0]['type'])->toBe('separator');
});

it('renders a half-filled draft without validating it', function (): void {
    $frame = Wire::toArray(app(BlockRenderer::class)->renderShallow(BlockNode::make('lattice.heading', ['text' => ''])));

    expect($frame['schema'][0]['props']['text'])->toBe('Heading');
});
