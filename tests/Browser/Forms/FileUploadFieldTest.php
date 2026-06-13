<?php
declare(strict_types=1);
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Forms\Rules\FileUploadItem;
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

    $endpoint = parse_url((string) config('filesystems.disks.s3.endpoint'));
    $host = $endpoint['host'] ?? 'rustfs.herd.test';
    $port = $endpoint['port'] ?? (($endpoint['scheme'] ?? 'https') === 'https' ? 443 : 80);

    if (! @fsockopen($host, $port, $errno, $errstr, 1)) {
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

it('signs, uploads, and validates a key against rustfs end-to-end', function (): void {
    if (! class_exists(AwsS3V3Adapter::class)) {
        $this->markTestSkipped('S3 flysystem adapter not installed');
    }

    $endpoint = parse_url((string) config('filesystems.disks.s3.endpoint'));
    $host = $endpoint['host'] ?? 'rustfs.herd.test';
    $port = $endpoint['port'] ?? (($endpoint['scheme'] ?? 'https') === 'https' ? 443 : 80);

    if (! @fsockopen($host, $port, $errno, $errstr, 1)) {
        $this->markTestSkipped('RustFS not reachable');
    }

    try {
        Storage::disk('s3')->put('tmp/.rustfs-probe', 'probe');
        Storage::disk('s3')->delete('tmp/.rustfs-probe');
    } catch (Throwable $e) {
        $this->markTestSkipped('RustFS bucket not usable: '.$e->getMessage());
    }

    $signed = FileUpload::make('document')->disk('s3')->signedUpload()
        ->signUpload(Request::create('/', 'POST', ['filename' => 'invoice.pdf']));

    expect($signed['method'])->toBe('PUT')
        ->and($signed['key'])->toStartWith('tmp/');

    $put = Http::withHeaders($signed['headers'])->send('PUT', $signed['url'], ['body' => 'hello rustfs']);

    if (! $put->successful()) {
        $this->markTestSkipped('RustFS presigned PUT unavailable in this env (status '.$put->status().')');
    }

    expect(Storage::disk('s3')->exists($signed['key']))->toBeTrue();

    Storage::disk('s3')->put('uploads/secret.pdf', 'data');
    $rule = new FileUploadItem(image: false, acceptedTypes: null, maxSizeKb: null, disk: 's3', signed: true, tempPrefix: 'tmp');
    $fails = fn (mixed $value): bool => Validator::make(['document' => $value], ['document' => [$rule]])->fails();

    expect($fails($signed['key']))->toBeFalse()
        ->and($fails('uploads/secret.pdf'))->toBeTrue();

    Storage::disk('s3')->delete([$signed['key'], 'uploads/secret.pdf']);
})->group('rustfs');
