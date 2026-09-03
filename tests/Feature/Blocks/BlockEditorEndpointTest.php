<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\Components\BlockEditor;
use Lattice\Core\Support\Wire;
use Workbench\App\BlockEditors\PagesEditor;

use function Pest\Laravel\patchJson;
use function Pest\Laravel\postJson;

it('serializes the editor with its document, shallow renders, and offered block types', function (): void {
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => pageWithDraft()->getKey()]));

    expect($editor['type'])->toBe('blocks.editor')
        ->and($editor['props']['endpoint'])->toBe('/lattice/block-editors/workbench.pages')
        ->and($editor['props']['ref'])->toBeString()
        ->and($editor['props']['revision'])->toBe(1)
        ->and($editor['props']['title'])->toBe('Landing')
        ->and($editor['props']['previewUrl'])->toBe('/p/landing')
        ->and(array_column($editor['props']['patterns'], 'key'))->toBe(['hero-cta', 'text-image'])
        ->and(array_keys($editor['props']['rendered']))->toBe(['b_heading', 'b_columns', 'b_left', 'b_right'])
        ->and(array_column($editor['props']['types'], 'type'))->toContain('workbench.hero', 'lattice.columns')
        ->and($editor['props']['seedType'])->toBe('lattice.paragraph')
        ->and($editor['props']['styleClasses']['width']['wide'])->toContain('max-w-6xl')
        ->and($editor['props']['document']['blocks'][1]['slots']['col_1'][0]['id'])->toBe('b_left');
});

it('rejects requests without a signed reference', function (): void {
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => pageWithDraft()->getKey()]));

    patchJson($editor['props']['endpoint'], ['document' => Wire::toArray(BlockDocument::empty()), 'revision' => 1])->assertForbidden();
});

it('re-renders a single block and reports its field errors', function (): void {
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => pageWithDraft()->getKey()]));

    $response = postJson($editor['props']['endpoint'], [
        '_op' => 'render',
        'block' => Wire::toArray(BlockNode::make('lattice.heading', ['text' => '', 'level' => '3'], id: 'b_new')),
    ], ['X-Lattice-Ref' => $editor['props']['ref']]);

    $response->assertOk();

    expect($response->json('node.type'))->toBe('blocks.frame')
        ->and($response->json('node.props.blockId'))->toBe('b_new')
        ->and($response->json('node.schema.0.props.level'))->toBe(3)
        ->and($response->json('errors'))->toHaveKey('text');
});

it('refuses to render a block type the editor does not offer', function (): void {
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => pageWithDraft()->getKey()]));

    postJson($editor['props']['endpoint'], [
        '_op' => 'render',
        'block' => Wire::toArray(BlockNode::make('vendor.gone', [], id: 'b_new')),
    ], ['X-Lattice-Ref' => $editor['props']['ref']])->assertUnprocessable();
});

it('saves a draft, bumps the revision, and returns non-blocking field errors', function (): void {
    $page = pageWithDraft();
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => $page->getKey()]));
    $document = new BlockDocument([BlockNode::make('lattice.heading', ['text' => ''], id: 'b_empty')]);

    $response = patchJson($editor['props']['endpoint'], [
        'document' => Wire::toArray($document),
        'revision' => 1,
    ], ['X-Lattice-Ref' => $editor['props']['ref']]);

    $response->assertOk();

    expect($response->json('revision'))->toBe(2)
        ->and($response->json('errors.b_empty'))->toHaveKey('text')
        ->and($page->refresh()->revision)->toBe(2)
        ->and($page->draft?->find('b_empty'))->not->toBeNull()
        ->and($page->published)->toBeNull();
});

it('answers 409 with the current revision when the draft was saved from a stale revision', function (): void {
    $page = pageWithDraft();
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => $page->getKey()]));
    $page->forceFill(['revision' => 5])->save();

    $response = patchJson($editor['props']['endpoint'], [
        'document' => Wire::toArray(BlockDocument::empty()),
        'revision' => 1,
    ], ['X-Lattice-Ref' => $editor['props']['ref']]);

    $response->assertConflict();

    expect($response->json('revision'))->toBe(5)
        ->and($page->refresh()->draft?->isEmpty())->toBeFalse();
});

it('publishes a valid document after saving it as the draft', function (): void {
    $page = pageWithDraft();
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => $page->getKey()]));

    $response = postJson($editor['props']['endpoint'], [
        '_op' => 'publish',
        'document' => Wire::toArray(sampleBlockDocument()),
        'revision' => 1,
    ], ['X-Lattice-Ref' => $editor['props']['ref']]);

    $response->assertOk();

    $page->refresh();

    expect($response->json('revision'))->toBe(2)
        ->and($page->published?->find('b_heading'))->not->toBeNull()
        ->and($page->published_at)->not->toBeNull();
});

it('refuses to publish a document with field errors or unknown blocks', function (): void {
    $page = pageWithDraft();
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => $page->getKey()]));
    $document = new BlockDocument([
        BlockNode::make('lattice.heading', ['text' => ''], id: 'b_empty'),
        BlockNode::make('vendor.gone', [], id: 'b_gone'),
    ]);

    $response = postJson($editor['props']['endpoint'], [
        '_op' => 'publish',
        'document' => Wire::toArray($document),
        'revision' => 1,
    ], ['X-Lattice-Ref' => $editor['props']['ref']]);

    $response->assertUnprocessable();

    expect($response->json('errors.b_empty'))->toHaveKey('text')
        ->and($response->json('errors.b_gone'))->toHaveKey('_type')
        ->and($page->refresh()->published)->toBeNull();
});

it('returns 404 for an unknown operation', function (): void {
    $editor = $this->sealBlockEditor(fn (): BlockEditor => BlockEditor::use(PagesEditor::class, ['page' => pageWithDraft()->getKey()]));

    postJson($editor['props']['endpoint'], ['_op' => 'explode'], ['X-Lattice-Ref' => $editor['props']['ref']])->assertNotFound();
});
