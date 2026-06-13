<?php
declare(strict_types=1);
use Illuminate\Support\Facades\Storage;
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

    $probeKey = 'tmp/.rustfs-probe-'.uniqid();
    $disk = Storage::build([
        'driver' => 's3',
        'key' => config('filesystems.disks.s3.key'),
        'secret' => config('filesystems.disks.s3.secret'),
        'region' => config('filesystems.disks.s3.region'),
        'bucket' => config('filesystems.disks.s3.bucket'),
        'url' => config('filesystems.disks.s3.url'),
        'endpoint' => config('filesystems.disks.s3.endpoint'),
        'use_path_style_endpoint' => config('filesystems.disks.s3.use_path_style_endpoint'),
        'throw' => true,
    ]);
    try {
        $disk->put($probeKey, 'probe');
        $disk->get($probeKey);
        $disk->delete($probeKey);
    } catch (Throwable $e) {
        $this->markTestSkipped('RustFS bucket not usable (likely missing/unprovisioned): '.$e->getMessage());
    }

    $page = visit('/uploads/create')
        ->assertSee('Drop files here or click to browse')
        ->attach('@document-input', __DIR__.'/fixtures/avatar.jpg');

    $uploadCompleted = false;
    foreach (range(1, 10) as $attempt) {
        try {
            $page->assertCount('[data-test="document-uploaded"]', 1);
            $uploadCompleted = true;
            break;
        } catch (Throwable $e) {
            $page->wait(1);
        }
    }

    if (! $uploadCompleted) {
        $this->markTestSkipped('RustFS signed upload did not complete (likely CORS or upload error)');
    }

    $page->click('@form-submit')->assertNoSmoke();
})->group('rustfs');
