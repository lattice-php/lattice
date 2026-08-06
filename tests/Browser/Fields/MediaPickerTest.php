<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Lattice\Media\Models\Media;

it('picks existing media into the form and syncs the pivot', function (): void {
    Media::factory()->create(['name' => 'pick-me.jpg']);

    $page = $this->visitAsWorkbenchUser('/media-picker')
        ->assertPresent('@media-picker-gallery')
        ->click('@media-picker-open');

    assertSeeEventually($page, 'pick-me.jpg');

    $page->click('@media-card')
        ->click('@media-pick-confirm')
        ->assertPresent('@media-picker-item')
        ->assertSee('pick-me.jpg')
        ->click('@form-submit');

    retryUntil(function (): void {
        expect(DB::table('media_attachments')->where('collection', 'gallery')->count())->toBe(1);
    });

    $page->assertNoSmoke();
});

it('edits attachment fields inline and persists them into pivot meta', function (): void {
    Media::factory()->create(['name' => 'pick-me.jpg']);

    $page = $this->visitAsWorkbenchUser('/media-picker')
        ->click('@media-picker-open');

    assertSeeEventually($page, 'pick-me.jpg');

    $page->click('@media-card')
        ->click('@media-pick-confirm')
        ->assertPresent('@media-picker-item-fields')
        ->fill('input[name="gallery[0][caption]"]', 'Sunset at the beach')
        ->click('@form-submit');

    retryUntil(function (): void {
        $meta = DB::table('media_attachments')->where('collection', 'gallery')->value('meta');
        expect(json_decode((string) $meta, true))->toBe(['caption' => 'Sunset at the beach']);
    });

    $page->navigate('/media-picker')
        ->assertValue('input[name="gallery[0][caption]"]', 'Sunset at the beach')
        ->assertNoSmoke();
});
