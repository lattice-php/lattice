<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockHtmlRenderer;
use Lattice\Blocks\BlockNode;
use Lattice\Blocks\BlockRenderer;
use Lattice\Core\Support\Wire;

beforeEach(function (): void {
    Storage::fake('public');
});

it('renders a chosen image with its caption in the canvas, the view and the HTML output', function (): void {
    $media = fakeImageMedia('hero.jpg');
    $node = BlockNode::make('lattice.image', ['image' => $media->getKey(), 'alt' => 'A hero', 'caption' => 'Shot on site'], id: 'b_img');
    $renderer = app(BlockRenderer::class);

    $editor = Wire::toArray($renderer->renderShallow($node))['schema'][0]['schema'];
    $view = Wire::toArray($renderer->renderDeep($node))['schema'][0]['schema'];
    $html = app(BlockHtmlRenderer::class)->render(new BlockDocument([$node]))->toHtml();

    expect(array_column($editor, 'type'))->toBe(['image', 'text'])
        ->and($editor[0]['props']['src'])->toContain('hero.jpg')
        ->and($editor[0]['props']['alt'])->toBe('A hero')
        ->and(array_column($view, 'type'))->toBe(['image', 'text'])
        ->and($html)->toContain('<figure')
        ->toContain('hero.jpg')
        ->toContain('alt="A hero"')
        ->toContain('<figcaption class="text-sm text-lt-muted-fg">Shot on site</figcaption>');
});

it('renders a gallery as an image grid and drops the block from the view while it holds no images', function (): void {
    $first = fakeImageMedia('one.jpg');
    $second = fakeImageMedia('two.jpg');
    $renderer = app(BlockRenderer::class);
    $filled = BlockNode::make('lattice.gallery', ['images' => [$first->getKey(), ['id' => $second->getKey()], 'nope'], 'columns' => '4']);
    $empty = BlockNode::make('lattice.gallery');

    $grid = Wire::toArray($renderer->renderDeep($filled))['schema'][0];
    $html = app(BlockHtmlRenderer::class)->render(new BlockDocument([$filled, $empty]))->toHtml();

    expect($grid['type'])->toBe('grid')
        ->and(array_column($grid['schema'], 'type'))->toBe(['image', 'image'])
        ->and($grid['schema'][1]['props']['src'])->toContain('two.jpg')
        ->and(Wire::toArray($renderer->renderShallow($empty))['schema'][0]['type'])->toBe('raw-block')
        ->and($renderer->renderDeep($empty))->toBeNull()
        ->and(substr_count($html, '<img '))->toBe(2)
        ->and($html)->toContain('md:grid-cols-4')
        ->and(substr_count($html, 'data-block-type="lattice.gallery"'))->toBe(1);
});
