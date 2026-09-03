<?php
declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Lattice\Media\Actions\DeleteMediaAction;
use Lattice\Media\Actions\UpdateMediaAction;
use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Components\MediaLibrary;
use Lattice\Media\Models\Media;
use Lattice\Media\Tables\MediaTable;

beforeEach(function (): void {
    bootstrapMediaTest(
        tables: [MediaTable::class],
        actions: [UploadMediaAction::class, UpdateMediaAction::class, DeleteMediaAction::class],
    );
});

/**
 * @param  array<array-key, mixed>  $node
 * @return array<array-key, mixed>
 */
function uploadNode(array $node): array
{
    return (array) collect((array) $node['schema'])->firstWhere('key', 'media-upload');
}

test('the media library composes its table and action nodes', function (): void {

    $node = wire(MediaLibrary::make());

    expect($node['type'])->toBe('media.library')
        ->and($node['props']['picker'])->toBeFalse();

    $types = array_column($node['schema'], 'type');
    expect($types[0])->toBe('table');

    $keys = array_map(fn (array $child): ?string => $child['key'] ?? null, array_slice($node['schema'], 1));
    expect($keys)->toContain('media-upload', 'media-update', 'media-delete');
});

test('the library composes a document viewer template for the inspector', function (): void {
    $node = wire(MediaLibrary::make());

    $viewer = collect((array) $node['schema'])->firstWhere('key', 'media-pdf');

    expect($viewer)->not->toBeNull()
        ->and($viewer['type'])->toBe('pdf')
        ->and($viewer['props']['url'])->toBe('')
        ->and($viewer['props']['workerUrl'])->not->toBe('')
        ->and($viewer['props']['searchable'])->toBeFalse();

    $pickerKeys = array_map(
        fn (array $child): ?string => $child['key'] ?? null,
        (array) wire(MediaLibrary::make()->picker())['schema'],
    );

    expect($pickerKeys)->not->toContain('media-pdf');
});

test('pick mode composes only the table and the upload action', function (): void {
    $node = wire(MediaLibrary::make()->picker());

    expect($node['props']['picker'])->toBeTrue()
        ->and($node['schema'])->toHaveCount(2);

    $types = array_column($node['schema'], 'type');
    expect($types[0])->toBe('table');

    $keys = array_map(fn (array $child): ?string => $child['key'] ?? null, array_slice($node['schema'], 1));
    expect($keys)->toBe(['media-upload']);
});

test('switching to pick mode after a render recomposes the children', function (): void {
    $library = MediaLibrary::make();
    wire($library);

    $node = wire($library->picker());

    expect($node['schema'])->toHaveCount(2);

    $keys = array_map(fn (array $child): ?string => $child['key'] ?? null, array_slice($node['schema'], 1));
    expect($keys)->toBe(['media-upload']);
});

test('the library offers the configured accepted types to the file picker', function (): void {
    config()->set('media.accepted_types', ['image/*', 'application/pdf']);

    expect(wire(MediaLibrary::make())['props']['accept'])->toBe('image/*,application/pdf');
});

test('per-instance upload settings reach both the wire prop and the sealed action context', function (): void {
    Storage::fake('uploads');
    Storage::disk('uploads')->put('tmp/team.jpg', 'bytes');

    $node = wire(MediaLibrary::make()->signedUpload()->disk('uploads'));
    $upload = uploadNode($node);

    expect($node['props']['signed'])->toBeTrue();

    $this->postJson($upload['props']['endpoint'], ['files' => ['tmp/team.jpg']], $this->latticeHeaders($upload))
        ->assertOk();

    $media = Media::query()->sole();

    expect($media->disk)->toBe('uploads')
        ->and($media->path)->toStartWith('media/')
        ->and(Storage::disk('uploads')->exists($media->path))->toBeTrue();
});

test('mutating the library after a render reseals the upload context', function (): void {
    Storage::fake('uploads');
    Storage::disk('uploads')->put('tmp/team.jpg', 'bytes');

    $library = MediaLibrary::make();
    wire($library);

    $node = wire($library->signedUpload()->disk('uploads'));
    $upload = uploadNode($node);

    expect($node['props']['signed'])->toBeTrue();

    $this->postJson($upload['props']['endpoint'], ['files' => ['tmp/team.jpg']], $this->latticeHeaders($upload))
        ->assertOk();

    expect(Media::query()->sole()->disk)->toBe('uploads');
});

test('an instance accept tolerates spaces between the mime patterns', function (): void {
    Storage::fake('public');

    $upload = uploadNode(wire(MediaLibrary::make()->accept('image/*, application/pdf')));

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->create('report.pdf', 10, 'application/pdf')]],
        $this->latticeHeaders($upload),
    )->assertOk();

    expect(Media::query()->sole()->name)->toBe('report.pdf');
});

test('instance upload rules reject a file that violates them', function (): void {
    Storage::fake('public');

    $upload = uploadNode(wire(MediaLibrary::make()->uploadRules(['dimensions:max_width=50'])));

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->image('wide.jpg', 400, 100)]],
        $this->latticeHeaders($upload),
    )->assertStatus(422)->assertJsonValidationErrors('files.0');

    expect(Media::query()->count())->toBe(0);

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->image('small.jpg', 40, 40)]],
        $this->latticeHeaders($upload),
    )->assertOk();

    expect(Media::query()->sole()->name)->toBe('small.jpg');
});

test('upload rules survive the sealed context as strings and keep resealing after a render', function (): void {
    Storage::fake('public');

    $library = MediaLibrary::make();
    wire($library);

    $upload = uploadNode(wire($library->uploadRules([Rule::dimensions()->maxWidth(50)])));

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->image('wide.jpg', 400, 100)]],
        $this->latticeHeaders($upload),
    )->assertStatus(422);

    expect(Media::query()->count())->toBe(0);
});

test('signed uploads cannot enforce dimension rules because the server never sees the bytes', function (): void {
    Storage::fake('public');
    Storage::disk('public')->put('tmp/photo.jpg', 'bytes');

    $upload = uploadNode(wire(
        MediaLibrary::make()->signedUpload()->uploadRules(['dimensions:max_width=50']),
    ));

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => ['tmp/photo.jpg']],
        $this->latticeHeaders($upload),
    )->assertOk();

    expect(Media::query()->count())->toBe(1);
});

test('a category scope narrows the listing and stamps every upload', function (): void {
    Media::factory()->create(['name' => 'photo.jpg']);
    Media::factory()->create(['name' => 'import.csv', 'category' => 'imports']);

    $node = wire(MediaLibrary::make()->category('imports'));
    $table = (array) collect((array) $node['schema'])->firstWhere('type', 'table');

    $this->latticeGet($table['props']['endpoint'], $table)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'import.csv');

    $upload = uploadNode($node);

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->image('fresh.jpg')]],
        $this->latticeHeaders($upload),
    )->assertOk();

    expect(Media::query()->where('name', 'fresh.jpg')->sole()->category)->toBe('imports');
});

test('upload-only mode composes just the upload action', function (): void {
    $node = wire(MediaLibrary::make()->picker()->uploadOnly());

    expect($node['schema'])->toHaveCount(1)
        ->and($node['schema'][0]['key'])->toBe('media-upload');
});

test('an upload label override reaches the upload action node', function (): void {
    expect(uploadNode(wire(MediaLibrary::make()->uploadLabel('Import file')))['props']['label'])
        ->toBe('Import file');
});

test('an instance accept narrows what the upload endpoint takes', function (): void {
    Storage::fake('public');

    $upload = uploadNode(wire(MediaLibrary::make()->accept('image/*')));

    $this->postJson(
        $upload['props']['endpoint'],
        ['files' => [UploadedFile::fake()->create('report.pdf', 10, 'application/pdf')]],
        $this->latticeHeaders($upload),
    )->assertStatus(422);

    expect(Media::query()->count())->toBe(0);
});
