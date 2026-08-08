<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Media\Actions\DeleteMediaAction;
use Lattice\Media\Actions\DeleteSelectedMediaAction;
use Lattice\Media\Actions\UpdateMediaAction;
use Lattice\Media\Models\Media;
use Lattice\Media\Tables\MediaTable;

beforeEach(function (): void {
    bootstrapMediaTest(
        tables: [MediaTable::class],
        actions: [UpdateMediaAction::class, DeleteMediaAction::class],
        bulkActions: [DeleteSelectedMediaAction::class],
    );
});

test('update edits name and alt', function (): void {
    $media = Media::factory()->create();

    $this->callAction(UpdateMediaAction::class, [
        'media_id' => $media->getKey(),
        'name' => 'renamed.jpg',
        'alt' => 'A renamed image',
    ])->assertOk();

    expect($media->refresh())
        ->name->toBe('renamed.jpg')
        ->alt->toBe('A renamed image');
});

test('update validates name as required', function (): void {
    $media = Media::factory()->create();

    $this->callAction(UpdateMediaAction::class, [
        'media_id' => $media->getKey(),
        'name' => '',
    ])->assertUnprocessable();
});

test('delete removes the row and the disk object', function (): void {
    $media = Media::factory()->create();
    Storage::disk('public')->put($media->path, 'bytes');

    $this->callAction(DeleteMediaAction::class, ['media_id' => $media->getKey()])
        ->assertOk();

    expect(Media::query()->count())->toBe(0)
        ->and(Storage::disk('public')->exists($media->path))->toBeFalse();
});

test('bulk delete removes only the selection', function (): void {
    [$a, $b, $c] = Media::factory()->count(3)->create();

    $this->callBulkAction(DeleteSelectedMediaAction::class, [
        'selected' => [$a->getKey(), $b->getKey()],
    ], ['table' => 'media.library'])->assertOk();

    expect(Media::query()->pluck('id')->all())->toBe([$c->getKey()]);
});
