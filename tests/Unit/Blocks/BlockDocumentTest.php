<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;

it('reads a stored document tolerating malformed entries', function (): void {
    $document = BlockDocument::fromArray([
        'version' => 1,
        'blocks' => [
            ['id' => 'a', 'type' => 'lattice.heading', 'data' => ['text' => 'Hi'], 'slots' => new stdClass],
            'garbage',
            ['type' => 'lattice.columns', 'slots' => ['col_1' => [['id' => 'c', 'type' => 'lattice.paragraph']], 'bad' => 'nope']],
        ],
    ]);

    expect($document->blocks)->toHaveCount(2)
        ->and($document->blocks[0]->id)->toBe('a')
        ->and($document->blocks[0]->data)->toBe(['text' => 'Hi'])
        ->and($document->blocks[1]->id)->toStartWith('b_')
        ->and($document->blocks[1]->slots)->toHaveKey('col_1')
        ->and($document->blocks[1]->slots)->not->toHaveKey('bad')
        ->and($document->find('c')?->type)->toBe('lattice.paragraph');
});

it('walks depth-first through every slot', function (): void {
    $document = new BlockDocument([
        BlockNode::make('lattice.section', [], ['content' => [BlockNode::make('lattice.paragraph', id: 'inner')]], id: 'outer'),
        BlockNode::make('lattice.separator', id: 'after'),
    ]);

    expect(array_map(fn (BlockNode $node): string => $node->id, iterator_to_array($document->walk(), false)))
        ->toBe(['outer', 'inner', 'after']);
});

it('decodes a JSON string the way the cast stores it', function (): void {
    $json = (string) json_encode(['version' => 1, 'blocks' => [['id' => 'x', 'type' => 'lattice.spacer', 'data' => [], 'style' => [], 'slots' => []]]]);

    expect(BlockDocument::fromArray($json)->find('x'))->not->toBeNull()
        ->and(BlockDocument::fromArray(null)->isEmpty())->toBeTrue();
});
