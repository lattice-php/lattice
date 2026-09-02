<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\Enums\BlockWidth;
use Workbench\App\Models\Page;

it('stores a block document as JSON and reads it back with styles intact', function (): void {
    $document = sampleBlockDocument();
    $page = Page::factory()->createOne(['draft' => $document]);

    $fresh = Page::query()->whereKey($page->getKey())->firstOrFail();

    expect($fresh->draft)->toBeInstanceOf(BlockDocument::class)
        ->and($fresh->draft?->find('b_left')?->data['content']['type'])->toBe('doc')
        ->and($fresh->published)->toBeNull()
        ->and(json_decode((string) $fresh->getRawOriginal('draft'), true)['blocks'][0]['type'])->toBe('lattice.heading');
});

it('accepts a plain array on write and normalizes it into a document', function (): void {
    $page = Page::factory()->createOne([
        'draft' => ['version' => 1, 'blocks' => [['id' => 'b_x', 'type' => 'lattice.spacer', 'style' => ['width' => 'wide']]]],
    ]);

    expect($page->refresh()->draft?->find('b_x')?->style->width)->toBe(BlockWidth::Wide);
});
