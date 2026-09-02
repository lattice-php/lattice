<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockValidator;

it('reports field errors per block id and field', function (): void {
    $document = new BlockDocument([
        BlockNode::make('lattice.heading', ['text' => '', 'level' => '2'], id: 'b_heading'),
        BlockNode::make('lattice.quote', ['quote' => 'Fine'], id: 'b_quote'),
    ]);

    $errors = app(BlockValidator::class)->validate($document);

    expect($errors)->toHaveKey('b_heading')
        ->and($errors['b_heading'])->toHaveKey('text')
        ->and($errors)->not->toHaveKey('b_quote');
});

it('keeps unknown block types in a draft but rejects them when publishing', function (): void {
    $document = new BlockDocument([BlockNode::make('vendor.gone', ['x' => 1], id: 'b_gone')]);
    $validator = app(BlockValidator::class);

    expect($validator->validate($document))->toBe([])
        ->and($validator->validate($document, strict: true))->toHaveKey('b_gone')
        ->and($validator->validate($document, allowedTypes: ['lattice.heading'], strict: true)['b_gone'])->toHaveKey(BlockValidator::TYPE_ERROR);
});

it('rejects blocks an editor does not offer only in strict mode', function (): void {
    $document = new BlockDocument([BlockNode::make('lattice.heading', ['text' => 'Ok'], id: 'b_h')]);
    $validator = app(BlockValidator::class);

    expect($validator->validate($document, allowedTypes: ['lattice.paragraph']))->toBe([])
        ->and($validator->validate($document, allowedTypes: ['lattice.paragraph'], strict: true))->toHaveKey('b_h');
});

it('flags children living in a slot the block no longer renders', function (): void {
    $document = new BlockDocument([
        BlockNode::make('lattice.columns', ['count' => '2'], [
            'col_1' => [BlockNode::make('lattice.paragraph', ['content' => richParagraph('Left')], id: 'b_left')],
            'col_3' => [BlockNode::make('lattice.paragraph', ['content' => richParagraph('Lost')], id: 'b_lost')],
        ], id: 'b_columns'),
    ]);

    $validator = app(BlockValidator::class);

    expect($validator->validate($document))->toBe([])
        ->and($validator->validate($document, strict: true)['b_columns'])->toHaveKey('_slots.col_3');
});

it('validates a single block through its fields', function (): void {
    $errors = app(BlockValidator::class)->validateBlock(BlockNode::make('lattice.heading', ['text' => str_repeat('x', 201)]));

    expect($errors)->toHaveKey('text');
});
