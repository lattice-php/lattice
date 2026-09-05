<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Lattice\Actions\ActionDefinition;
use Lattice\Actions\BulkActionDefinition;
use Lattice\Core\Facades\Lattice;
use Lattice\Form\FormDefinition;
use Lattice\Media\Models\Media;
use Lattice\Table\TableDefinition;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\freezeTime;

/**
 * Asserts the write: a fake disk swallows failures into `false`, and a skipped
 * branch further down would not say so.
 */
function fakeImageMedia(string $name = 'source.jpg', int $width = 320, int $height = 200): Media
{
    expect(Storage::disk('public')->put(
        "media/{$name}",
        (string) UploadedFile::fake()->image($name, $width, $height)->getContent(),
    ))->toBeTrue();

    return Media::factory()->create(['path' => "media/{$name}", 'mime_type' => 'image/jpeg']);
}

/**
 * @param  array<int, class-string<TableDefinition>>  $tables
 * @param  array<int, class-string<ActionDefinition>>  $actions
 * @param  array<int, class-string<BulkActionDefinition>>  $bulkActions
 * @param  array<int, class-string<FormDefinition>>  $forms
 */
function bootstrapMediaTest(array $tables = [], array $actions = [], array $bulkActions = [], array $forms = []): void
{
    Storage::fake('public');

    // Media::url() signs a temporary URL against now(), so a test comparing a
    // URL a request produced with one the assertion produces gets two
    // different expirations whenever a second ticks between them.
    freezeTime();

    Lattice::tables($tables);
    Lattice::actions($actions);
    Lattice::bulkActions($bulkActions);
    Lattice::forms($forms);

    actingAs(workbenchTestUser());
}
