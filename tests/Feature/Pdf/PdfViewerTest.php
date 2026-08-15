<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Lang;
use Lattice\Pdf\Components\PdfViewer;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

it('serializes the viewer with a resolved url and defaults', function (): void {
    $node = wire(
        PdfViewer::make('manual')
            ->url('https://files.example.test/manual.pdf')
            ->filename('manual.pdf')
            ->height(600)
            ->zoom(1.5),
    );

    expect($node)->toMatchArray(['type' => 'pdf', 'key' => 'manual'])
        ->and($node['props'])->toMatchArray([
            'url' => 'https://files.example.test/manual.pdf',
            'filename' => 'manual.pdf',
            'downloadable' => true,
            'searchable' => true,
            'height' => 600,
            'initialZoom' => 1.5,
        ])
        ->and($node['props']['workerUrl'])->toContain('lattice/pdf/worker.js');
});

it('resolves a closure url at serialization time', function (): void {
    $node = wire(PdfViewer::make()->url(fn (): string => 'https://files.example.test/from-closure.pdf'));

    expect($node['props']['url'])->toBe('https://files.example.test/from-closure.pdf');
});

it('requires a document url', function (): void {
    wire(PdfViewer::make());
})->throws(InvalidArgumentException::class, 'PdfViewer requires a document url.');

it('rejects a closure url that resolves to an empty string', function (): void {
    wire(PdfViewer::make()->url(fn (): string => '  '));
})->throws(InvalidArgumentException::class, 'PdfViewer url must resolve to a non-empty string.');

it('rejects heights below the minimum', function (): void {
    PdfViewer::make()->height(120);
})->throws(InvalidArgumentException::class, 'PdfViewer height must be at least 240 pixels.');

it('serializes a max height cap instead of the fixed height', function (): void {
    $node = wire(PdfViewer::make()->url('https://files.example.test/manual.pdf')->maxHeight(900));

    expect($node['props'])->toMatchArray(['maxHeight' => 900, 'height' => 720]);
});

it('rejects max heights below the minimum', function (): void {
    PdfViewer::make()->maxHeight(120);
})->throws(InvalidArgumentException::class, 'PdfViewer maxHeight must be at least 240 pixels.');

it('rejects zoom outside the supported range', function (float $zoom): void {
    PdfViewer::make()->zoom($zoom);
})->with([
    'below minimum' => [0.1],
    'above maximum' => [4.5],
])->throws(InvalidArgumentException::class, 'PdfViewer zoom must be between 0.25 and 4.0.');

it('prefers a configured worker url over the package route', function (): void {
    config()->set('pdf.worker_url', 'https://cdn.example.test/pdf.worker.min.mjs');

    $node = wire(PdfViewer::make()->url('https://files.example.test/manual.pdf'));

    expect($node['props']['workerUrl'])->toBe('https://cdn.example.test/pdf.worker.min.mjs');
});

it('passes configured asset urls through to the wire', function (): void {
    config()->set('pdf.cmap_url', 'https://cdn.example.test/cmaps/');
    config()->set('pdf.standard_font_data_url', 'https://cdn.example.test/standard_fonts/');
    config()->set('pdf.wasm_url', 'https://cdn.example.test/wasm/');

    $node = wire(PdfViewer::make()->url('https://files.example.test/manual.pdf'));

    expect($node['props'])->toMatchArray([
        'cmapUrl' => 'https://cdn.example.test/cmaps/',
        'standardFontDataUrl' => 'https://cdn.example.test/standard_fonts/',
        'wasmUrl' => 'https://cdn.example.test/wasm/',
    ]);
});

it('serves the bundled worker artifact with immutable caching', function (): void {
    $response = $this->get('/lattice/pdf/worker.js');

    $response->assertOk();

    $file = $response->baseResponse;
    assert($file instanceof BinaryFileResponse);

    expect($response->headers->get('Content-Type'))->toBe('text/javascript; charset=utf-8')
        ->and($response->headers->get('Cache-Control'))->toContain('immutable')
        ->and($file->getFile()->getSize())->toBeGreaterThan(0);
});

it('registers the worker route under the configured path', function (): void {
    expect(route('lattice.pdf.worker', absolute: false))->toBe('/lattice/pdf/worker.js');
});

it('serves both bundled pdf locales', function (): void {
    expect(__('pdf::pdf.loading'))->toBe('Loading document…');

    Lang::setLocale('de');

    expect(__('pdf::pdf.loading'))->toBe('Dokument wird geladen…');
});
