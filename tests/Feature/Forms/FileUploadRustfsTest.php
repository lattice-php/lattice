<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Lattice\Form\Components\FileUpload;
use Lattice\Form\Rules\FileUploadItem;
use Lattice\Ui\Enums\HttpMethod;

it('signs, uploads, and validates a key against rustfs end-to-end', function (): void {
    if (! rustfsIsReachable()) {
        $this->markTestSkipped('RustFS/S3 is not reachable.');
    }

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
