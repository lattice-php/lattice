<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Lattice\Core\Facades\Lattice;
use Lattice\Media\Actions\DeleteMediaAction;
use Lattice\Media\Actions\UpdateMediaAction;
use Lattice\Media\Actions\UploadMediaAction;
use Lattice\Media\Models\Media;
use Lattice\Media\Tables\MediaTable;
use Lattice\Table\TableQuery;
use Lattice\Tests\Fixtures\Media\CustomMedia;
use Lattice\Tests\Fixtures\Media\DenyMediaPolicy;
use Workbench\App\Models\Product;

use function Pest\Laravel\actingAs;

beforeEach(function (): void {
    Storage::fake('public');
    config(['media.model' => CustomMedia::class]);
});

test('the factory builds the configured model class', function (): void {
    expect(Media::factory()->create())->toBeInstanceOf(CustomMedia::class);
});

test('the media relation returns the configured model class and its conversions', function (): void {
    $product = Product::factory()->create();
    $product->syncMedia([Media::factory()->create()->getKey()], 'images');

    $attached = $product->media('images')->firstOrFail();

    expect($attached)->toBeInstanceOf(CustomMedia::class)
        ->and(array_keys($attached->defaultConversions()))->toBe(['square']);
});

test('the table builder queries the configured model class', function (): void {
    Media::factory()->create();

    expect((new MediaTable)->builder(TableQuery::empty())->get())->each->toBeInstanceOf(CustomMedia::class);
});

test('deleting the configured model cascades its attachment rows', function (): void {
    $product = Product::factory()->create();
    $media = Media::factory()->create();
    $product->syncMedia([$media->getKey()], 'images');

    Media::modelQuery()->whereKey($media->getKey())->firstOrFail()->delete();

    expect(DB::table('media_attachments')->count())->toBe(0);
});

test('class-string gate checks resolve the configured model policy', function (): void {
    actingAs(workbenchTestUser());
    $request = new Request;

    expect((new MediaTable)->authorize($request))->toBeTrue();

    Gate::policy(CustomMedia::class, DenyMediaPolicy::class);

    expect((new MediaTable)->authorize($request))->toBeFalse()
        ->and(app(UploadMediaAction::class)->authorize($request))->toBeFalse()
        ->and(app(UpdateMediaAction::class)->authorize($request))->toBeFalse()
        ->and(app(DeleteMediaAction::class)->authorize($request))->toBeFalse();
});

test('actions resolve media through the configured model class', function (): void {
    Lattice::tables([MediaTable::class]);
    Lattice::actions([UpdateMediaAction::class]);
    actingAs(workbenchTestUser());

    $media = Media::factory()->create();

    $retrievedConfiguredModel = false;
    Event::listen('eloquent.retrieved: '.CustomMedia::class, function () use (&$retrievedConfiguredModel): void {
        $retrievedConfiguredModel = true;
    });

    $this->callAction(UpdateMediaAction::class, [
        'media_id' => $media->getKey(),
        'name' => 'renamed.jpg',
    ])->assertOk();

    expect($retrievedConfiguredModel)->toBeTrue()
        ->and($media->refresh()->name)->toBe('renamed.jpg');
});

test('a subclass overriding previewConversion changes which derivative preview_url points at', function (): void {
    $media = Media::factory()->create([
        'path' => 'media/a.jpg',
        'meta' => ['conversions' => ['square' => ['path' => 'media/a-square.webp', 'width' => 100, 'height' => 100]]],
    ]);

    expect($media)->toBeInstanceOf(CustomMedia::class)
        ->and($media->previewConversion())->toBe('square')
        ->and($media->previewUrl())->toContain('media/a-square.webp');
});

test('a model config that is not a media class falls back to the base model', function (): void {
    config(['media.model' => stdClass::class]);

    expect(Media::modelClass())->toBe(Media::class)
        ->and(Media::modelQuery()->getModel()::class)->toBe(Media::class);
});
