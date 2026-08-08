<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Storage;

it('attaches a file and submits the multipart form', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/file-upload')
        ->assertSee('Drop files here or click to browse');

    $page->attach('@avatar-input', __DIR__.'/fixtures/avatar.jpg');

    assertSeeEventually($page, 'avatar.jpg');

    // The plugin's in-process server drops uploaded files (LaravelHttpServer
    // builds the kernel request with an empty files array), so the stored
    // result cannot be asserted here — FileUploadFieldTest covers the
    // server-side multipart store. This test covers the client interaction.
    $page->click('@form-submit')
        ->assertNoSmoke();
});

it('removes an existing file from the prefilled form', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/file-upload?state=existing')
        ->assertSee('avatar-existing.jpg')
        ->click('@avatar-remove-existing');

    assertDontSeeEventually($page, 'avatar-existing.jpg');

    $page->click('@form-submit');

    retryUntil(function (): void {
        expect(Storage::disk('public')->exists('uploads/avatar-existing.jpg'))->toBeFalse();
    });

    $page->assertNoSmoke();
});

it('uploads directly to s3 via the signed flow', function (): void {
    if (! rustfsIsReachable()) {
        $this->markTestSkipped('RustFS/S3 is not reachable.');
    }

    $page = $this->visitAsWorkbenchUser('/form/fields/file-upload?type=signed')
        ->assertPresent('@document-input');

    $page->attach('@document-input', __DIR__.'/fixtures/avatar.jpg');

    assertSeeEventually($page, 'avatar.jpg');
    assertPresentEventually($page, '[data-test="document-uploaded"]');

    $page->click('@form-submit')
        ->assertNoSmoke();
})->group('rustfs');
