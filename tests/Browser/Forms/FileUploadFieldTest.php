<?php
declare(strict_types=1);
use League\Flysystem\AwsS3V3\AwsS3V3Adapter;

it('uploads a file via multipart and shows it in the dropzone', function (): void {
    visit('/uploads/create')
        ->assertSee('Drop files here or click to browse')
        ->attach('@avatar-input', __DIR__.'/fixtures/avatar.jpg')
        ->assertSee('avatar.jpg')
        ->click('@form-submit')
        ->assertSee('Uploads')
        ->assertNoSmoke();
});

it('uploads directly to s3 via the signed flow', function (): void {
    if (! class_exists(AwsS3V3Adapter::class)) {
        $this->markTestSkipped('S3 flysystem adapter not installed');
    }

    if (! @fsockopen('rustfs.herd.test', 443, $errno, $errstr, 1)) {
        $this->markTestSkipped('RustFS not reachable');
    }

    visit('/uploads/create')
        ->assertSee('Drop files here or click to browse')
        ->attach('@document-input', __DIR__.'/fixtures/avatar.jpg')
        ->waitForText('100%')
        ->click('@form-submit')
        ->assertNoSmoke();
})->group('rustfs');
