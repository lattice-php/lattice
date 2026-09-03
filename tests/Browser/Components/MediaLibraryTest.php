<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Lattice\Media\Models\Media;

it('renders the media grid and narrows it through the search box', function (): void {
    Media::factory()->create(['name' => 'alpha.jpg']);
    Media::factory()->create(['name' => 'beta.jpg']);

    $page = $this->visitAsWorkbenchUser('/media')
        ->assertPresent('@media-library')
        ->assertSee('alpha.jpg')
        ->assertSee('beta.jpg');

    $page->fill('@media-search', 'alpha');

    assertDontSeeEventually($page, 'beta.jpg');

    $page->assertSee('alpha.jpg')
        ->assertNoSmoke();
});

it('previews the generated derivative in the grid rather than the original', function (): void {
    Media::factory()->create([
        'name' => 'hero.jpg',
        'path' => 'media/hero.jpg',
        'meta' => ['conversions' => [
            'thumb' => ['path' => 'media/conversions/hero-thumb.webp', 'width' => 400, 'height' => 400],
        ]],
    ]);

    $page = $this->visitAsWorkbenchUser('/media')->assertSee('hero.jpg');

    $page->assertAttributeContains('[data-test="media-card"] img', 'src', 'media/conversions/hero-thumb.webp')
        ->assertNoSmoke();
});

it('uploads a file through the dropzone input', function (): void {
    $page = $this->visitAsWorkbenchUser('/media')
        ->assertPresent('@media-upload-button');

    $page->attach('@media-upload-input', __DIR__.'/../Fields/fixtures/avatar.jpg');

    // The plugin's in-process server drops uploaded files (LaravelHttpServer
    // builds the kernel request with an empty files array), so the action stores
    // nothing — UploadMediaActionTest covers the server-side store. The toast is
    // client-side and counts accepted requests, so reaching it with one file
    // proves the client transport ran.
    assertSeeEventually($page, '1 file(s) uploaded');

    $page->assertNoSmoke();
});

it('edits alt text and deletes a file from the inspector', function (): void {
    $media = Media::factory()->create(['name' => 'detail.jpg']);

    $page = $this->visitAsWorkbenchUser('/media')->assertSee('detail.jpg');

    $page->click('@media-card')
        ->fill('@media-detail-alt', 'Alt text here')
        ->click('@media-detail-save');

    retryUntil(function () use ($media): void {
        $fresh = $media->fresh();
        assert($fresh !== null);
        expect($fresh->alt)->toBe('Alt text here');
    });

    $page->click('@media-detail-delete')
        ->click('@confirm-accept');

    retryUntil(function () use ($media): void {
        expect($media->fresh())->toBeNull();
    });

    $page->assertNoSmoke();
});

it('turns the inspector into a slideout on a narrow viewport', function (): void {
    Media::factory()->create(['name' => 'narrow.jpg']);

    $page = $this->visitAsWorkbenchUser('/media')
        ->assertSee('narrow.jpg')
        ->assertPresent('@media-inspector')
        ->assertMissing('[role="dialog"]');

    $page->resize(390, 844)
        ->click('@media-card')
        ->assertPresent('[role="dialog"] [data-test="media-detail"]');

    $page->resize(1280, 800)
        ->assertNoSmoke();
});

it('bulk deletes the selected media', function (): void {
    Media::factory()->create(['name' => 'doomed.jpg']);

    $page = $this->visitAsWorkbenchUser('/media')->assertSee('doomed.jpg');

    $page->click('@media-card-select')
        ->click('@media-bulk-delete');

    assertDontSeeEventually($page, 'doomed.jpg');

    retryUntil(function (): void {
        expect(Media::query()->count())->toBe(0);
    });

    $page->assertNoSmoke();
});

it('uploads a file through the real signed flow against rustfs', function (): void {
    if (! rustfsIsReachable()) {
        $this->markTestSkipped('RustFS/S3 is not reachable.');
    }

    $media = null;

    try {
        $page = $this->visitAsWorkbenchUser('/media?signed=1')
            ->assertPresent('@media-upload-input');

        $page->attach('@media-upload-input', __DIR__.'/../Fields/fixtures/avatar.jpg');

        assertSeeEventually($page, '1 file(s) uploaded');

        retryUntil(function () use (&$media): void {
            $media = Media::query()->where('disk', 's3')->latest('id')->first();
            expect($media)->not->toBeNull();
        });
        assert($media instanceof Media);

        assertSeeEventually($page, $media->name);

        expect($media->disk)->toBe('s3')
            ->and(Storage::disk('s3')->exists($media->path))->toBeTrue();

        $page->assertNoSmoke();
    } finally {
        if ($media instanceof Media) {
            Storage::disk('s3')->delete($media->path);
            $media->delete();
        }
    }
})->group('rustfs');
