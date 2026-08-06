<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Lattice\Media\Models\Media;

use function Pest\Laravel\actingAs;

test('guests are denied all media abilities', function (string $ability): void {
    $media = Media::factory()->create();

    expect(Gate::forUser(null)->allows($ability, $ability === 'viewAny' || $ability === 'create' ? Media::class : $media))->toBeFalse();
})->with(['viewAny', 'create', 'update', 'delete', 'attach']);

test('authenticated users are allowed by default', function (): void {
    actingAs(workbenchTestUser());
    $media = Media::factory()->create();

    expect(Gate::allows('viewAny', Media::class))->toBeTrue()
        ->and(Gate::allows('update', $media))->toBeTrue();
});
