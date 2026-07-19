<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Lattice\Lattice\Core\Enums\HttpMethod;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Rules\FileUploadItem;

it('uploads a file through a multipart payload', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/file-upload')
        ->assertSee('Drop files here or click to browse');

    $page->attach('@avatar-input', __DIR__.'/fixtures/avatar.jpg');

    assertSeeEventually($page, 'avatar.jpg');

    $page->click('@form-submit')
        ->assertSee('File upload')
        ->assertNoSmoke();
});

it('removes an existing file from the prefilled form', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/file-upload?state=existing')
        ->assertSee('avatar-existing.jpg')
        ->click('@avatar-remove-existing')
        ->assertDontSee('avatar-existing.jpg')
        ->click('@form-submit')
        ->assertNoSmoke();
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

it('signs, uploads, and validates a key against rustfs end-to-end', function (): void {
    if (! rustfsIsReachable()) {
        $this->markTestSkipped('RustFS/S3 is not reachable.');
    }

    $this->actingAs(workbenchTestUser());
    $signed = FileUpload::make('document')->disk('s3')->signedUpload()
        ->signUpload(Request::create('/', 'POST', ['filename' => 'invoice.pdf']));

    expect($signed->method)->toBe(HttpMethod::Put)
        ->and($signed->key)->toStartWith('tmp/');

    $put = Http::withHeaders($signed->headers)->send('PUT', $signed->url, ['body' => 'hello rustfs']);

    expect($put->successful())->toBeTrue()
        ->and(Storage::disk('s3')->exists($signed->key))->toBeTrue();

    Storage::disk('s3')->put('uploads/secret.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');
    $fails = fn (mixed $value): bool => Validator::make(['document' => $value], ['document' => [$rule]])->fails();

    expect($fails($signed->key))->toBeFalse()
        ->and($fails('uploads/secret.pdf'))->toBeTrue();

    Storage::disk('s3')->delete([$signed->key, 'uploads/secret.pdf']);
})->group('rustfs');
