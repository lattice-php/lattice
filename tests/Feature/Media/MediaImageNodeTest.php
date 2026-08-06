<?php
declare(strict_types=1);

use Lattice\Media\Forms\RichEditor\MediaImageNode;
use Tiptap\Editor;
use Tiptap\Nodes\Document;
use Tiptap\Nodes\Paragraph;
use Tiptap\Nodes\Text;

/**
 * @param  array<string, mixed>  $attrs
 */
function mediaImageNodeHtml(array $attrs): string
{
    return new Editor(['extensions' => [new Document, new Paragraph, new Text, new MediaImageNode]])
        ->setContent(['type' => 'doc', 'content' => [['type' => 'mediaImage', 'attrs' => $attrs]]])
        ->getHTML();
}

test('renderHTML emits an img with the resolved url and metadata attrs', function (): void {
    $html = mediaImageNodeHtml([
        'id' => 7,
        'alt' => 'A lamp',
        'conversion' => 'hero',
        'url' => 'https://cdn.test/a.jpg',
        'width' => 800,
        'height' => 600,
    ]);

    expect($html)->toContain('<img')
        ->toContain('src="https://cdn.test/a.jpg"')
        ->toContain('alt="A lamp"')
        ->toContain('width="800"')
        ->toContain('height="600"')
        ->toContain('loading="lazy"')
        ->toContain('data-media-id="7"')
        ->toContain('data-conversion="hero"');
});

test('the alt attr falls back to the media library alt', function (): void {
    $html = mediaImageNodeHtml(['id' => 7, 'url' => 'https://cdn.test/a.jpg', 'mediaAlt' => 'Library alt']);

    expect($html)->toContain('alt="Library alt"');
});

test('a node without a resolved url renders an empty span instead of a broken img', function (): void {
    expect(mediaImageNodeHtml(['id' => 999]))->not->toContain('<img');
});
