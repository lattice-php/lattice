<?php
declare(strict_types=1);

use Lattice\Media\Models\Media;
use Lattice\Media\Tables\MediaTable;
use Lattice\Table\Components\Table;

beforeEach(function (): void {
    bootstrapMediaTest(tables: [MediaTable::class]);
});

test('the media table serializes rows with url, name and usage count', function (): void {
    $media = Media::factory()->create(['name' => 'hero.jpg']);

    $this->loadTable(MediaTable::class)
        ->assertOk()
        ->assertJsonPath('data.0.name', 'hero.jpg')
        ->assertJsonPath('data.0.attachments_count', 0)
        ->assertJsonPath('data.0.id', $media->getKey())
        ->assertJsonPath('data.0.url', $media->url());
});

test('the row payload previews the generated derivative next to the original', function (): void {
    $media = Media::factory()->create([
        'path' => 'media/hero.jpg',
        'meta' => ['conversions' => ['thumb' => ['path' => 'media/conversions/hero-thumb.webp', 'width' => 400, 'height' => 400]]],
    ]);

    $row = $this->loadTable(MediaTable::class)
        ->assertOk()
        ->json('data.0');

    expect($row['preview_url'])->toContain('hero-thumb.webp')
        ->and($row['preview_url'])->toBe($media->url('thumb'))
        ->and($row['url'])->toContain('media/hero.jpg');
});

test('the row payload falls back to the original preview while no conversion exists', function (): void {
    Media::factory()->create(['path' => 'media/hero.jpg']);

    $row = $this->loadTable(MediaTable::class)
        ->assertOk()
        ->json('data.0');

    expect($row['preview_url'])->toBe($row['url']);
});

test('search matches names and the type filter narrows by mime prefix', function (): void {
    Media::factory()->create(['name' => 'invoice.pdf', 'mime_type' => 'application/pdf']);
    Media::factory()->create(['name' => 'photo.jpg']);

    $this->loadTable(MediaTable::class, ['q' => 'invoice'])
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->loadTable(MediaTable::class, ['tf' => ['type' => ['value' => 'image']]])
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'photo.jpg');
});

test('guests cannot query the media table', function (): void {
    $ref = $this->latticeRef(wire(Table::use(MediaTable::class)));

    auth()->logout();

    $this->latticeGet('/lattice/tables/media.library', $ref)
        ->assertForbidden();
});
