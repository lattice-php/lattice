<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Core\Facades\Lattice;
use Lattice\Media\Models\Media;
use Lattice\Media\Tables\MediaTable;
use Lattice\Table\Components\Table;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\getJson;

beforeEach(function (): void {
    Storage::fake('public');
    Lattice::tables([MediaTable::class]);
    actingAs(workbenchTestUser());
});

test('the media table serializes rows with url, name and usage count', function (): void {
    $media = Media::factory()->create(['name' => 'hero.jpg']);

    $table = wire(Table::use(MediaTable::class));
    $ref = $this->latticeRef($table);

    getJson('/lattice/tables/media.library', ['X-Lattice-Ref' => $ref])
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

    $ref = $this->latticeRef(wire(Table::use(MediaTable::class)));

    $row = getJson('/lattice/tables/media.library', ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->json('data.0');

    expect($row['preview_url'])->toContain('hero-thumb.webp')
        ->and($row['preview_url'])->toBe($media->url('thumb'))
        ->and($row['url'])->toContain('media/hero.jpg');
});

test('the row payload falls back to the original preview while no conversion exists', function (): void {
    Media::factory()->create(['path' => 'media/hero.jpg']);

    $ref = $this->latticeRef(wire(Table::use(MediaTable::class)));

    $row = getJson('/lattice/tables/media.library', ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->json('data.0');

    expect($row['preview_url'])->toBe($row['url']);
});

test('search matches names and the type filter narrows by mime prefix', function (): void {
    Media::factory()->create(['name' => 'invoice.pdf', 'mime_type' => 'application/pdf']);
    Media::factory()->create(['name' => 'photo.jpg']);

    $ref = $this->latticeRef(wire(Table::use(MediaTable::class)));

    getJson('/lattice/tables/media.library?q=invoice', ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonCount(1, 'data');

    getJson('/lattice/tables/media.library?tf[type][value]=image', ['X-Lattice-Ref' => $ref])
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'photo.jpg');
});

test('guests cannot query the media table', function (): void {
    $ref = $this->latticeRef(wire(Table::use(MediaTable::class)));

    auth()->logout();

    getJson('/lattice/tables/media.library', ['X-Lattice-Ref' => $ref])
        ->assertForbidden();
});
