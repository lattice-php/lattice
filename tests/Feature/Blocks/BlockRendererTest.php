<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockRenderer;
use Lattice\Blocks\BlockStyle;
use Lattice\Blocks\Components\BlockView;
use Lattice\Blocks\Enums\BlockWidth;
use Lattice\Core\Support\Wire;
use Lattice\Ui\Enums\Gap;

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

it('carries the stored style, its resolved classes and the block supports on the frame', function (): void {
    $node = new BlockNode('b_sep', 'lattice.separator', [], new BlockStyle(width: BlockWidth::Wide, paddingTop: Gap::Large, anchor: 'rule'));
    $frame = Wire::toArray(app(BlockRenderer::class)->renderShallow($node));

    expect($frame['props']['style']['width'])->toBe('wide')
        ->and($frame['props']['style']['anchor'])->toBe('rule')
        ->and($frame['props']['classes']['inner'])->toContain('max-w-6xl')
        ->and($frame['props']['classes']['outer'])->toBe('pt-12')
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

it('marks the inline-editable spots of the built-in blocks with their field bindings', function (): void {
    $rendered = app(BlockRenderer::class)->renderShallowAll(sampleBlockDocument());

    $heading = Wire::toArray($rendered['b_heading']);
    $paragraph = Wire::toArray($rendered['b_left']);

    expect($heading['schema'][0]['type'])->toBe('heading')
        ->and($heading['schema'][0]['props']['binding'])->toBe('text')
        ->and($paragraph['schema'][0]['type'])->toBe('blocks.rich-text')
        ->and($paragraph['schema'][0]['props']['binding'])->toBe('content')
        ->and($paragraph['schema'][0]['props']['document']['type'])->toBe('doc')
        ->and($paragraph['schema'][0]['props']['html'])->toContain('Left');
});

it('renders an empty paragraph without markup but with its placeholder and binding for the editor', function (): void {
    $frame = Wire::toArray(app(BlockRenderer::class)->renderShallow(BlockNode::make('lattice.paragraph')));

    expect($frame['schema'][0]['props']['document'] ?? null)->toBeNull()
        ->and($frame['schema'][0]['props']['html'] ?? '')->toBe('')
        ->and($frame['schema'][0]['props']['placeholder'])->toContain('Write something')
        ->and($frame['schema'][0]['props']['binding'])->toBe('content');
});

it('keeps empty caption and source spots in the editor render but prunes them from the view', function (): void {
    $image = BlockNode::make('lattice.image', ['caption' => ''], id: 'b_image');
    $quote = BlockNode::make('lattice.quote', ['quote' => 'Less is more.', 'cite' => ''], id: 'b_quote');
    $renderer = app(BlockRenderer::class);

    $editorImage = Wire::toArray($renderer->renderShallow($image));
    $editorQuote = Wire::toArray($renderer->renderShallow($quote));
    $viewQuote = Wire::toArray($renderer->renderDeep($quote));

    expect(array_column($editorImage['schema'][0]['schema'], 'type'))->toBe(['raw-block', 'text'])
        ->and(array_column($editorQuote['schema'][0]['schema'], 'type'))->toBe(['text', 'text'])
        ->and($renderer->renderDeep($image))->toBeNull()
        ->and(array_column($viewQuote['schema'][0]['schema'], 'type'))->toBe(['text'])
        ->and($viewQuote['schema'][0]['schema'][0]['props']['text'])->toBe('Less is more.');
});

it('drops blocks that render nothing from the view, inside slots too', function (): void {
    $document = new BlockDocument([
        BlockNode::make('lattice.image', id: 'b_empty'),
        BlockNode::make('lattice.section', ['title' => 'Kept'], ['content' => [
            BlockNode::make('lattice.gallery', id: 'b_gallery'),
            BlockNode::make('lattice.separator', id: 'b_sep'),
        ]], id: 'b_section'),
    ]);

    $wire = Wire::toArray(BlockView::document($document));
    $slot = $wire['schema'][0]['schema'][0]['schema'][1];

    expect(array_column($wire['schema'], 'key'))->toBe(['b_section'])
        ->and($slot['type'])->toBe('blocks.slot')
        ->and(array_column($slot['schema'], 'key'))->toBe(['b_sep']);
});

it('shows heading and quote placeholders only while editing', function (): void {
    $heading = BlockNode::make('lattice.heading', ['text' => '']);
    $renderer = app(BlockRenderer::class);

    expect(Wire::toArray($renderer->renderShallow($heading))['schema'][0]['props']['text'])->toBe('Heading')
        ->and(Wire::toArray($renderer->renderDeep($heading))['schema'][0]['props']['text'])->toBe('');
});
