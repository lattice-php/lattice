<?php
declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Lattice\Media\Models\Media;

it('inserts library media into the rich editor, stores only the id, and prefills on reload', function (): void {
    $media = Media::factory()->create(['name' => 'photo.jpg', 'meta' => ['alt' => 'A photo']]);

    $page = $this->visitAsWorkbenchUser('/media-picker')
        ->click('@editor-media-image-insert');

    assertSeeEventually($page, 'photo.jpg');

    $page->click('@media-card')
        ->click('@media-pick-confirm')
        ->assertPresent('@editor-media-image')
        ->click('@form-submit');

    retryUntil(function () use ($media): void {
        $body = json_decode((string) DB::table('products')->value('body'), true);
        $node = collect((array) ($body['content'] ?? []))->firstWhere('type', 'mediaImage');

        expect($node)->not->toBeNull()
            ->and($node['attrs']['id'])->toBe($media->getKey())
            ->and($node['attrs'])->not->toHaveKey('url');
        expect(DB::table('media_attachments')->where('collection', 'content')->count())->toBe(1);
    });

    $page->navigate('/media-picker')
        ->assertPresent('@editor-media-image')
        ->assertNoSmoke();
});
