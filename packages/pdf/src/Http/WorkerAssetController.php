<?php

declare(strict_types=1);

namespace Lattice\Pdf\Http;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class WorkerAssetController
{
    public function __invoke(): BinaryFileResponse
    {
        $path = dirname(__DIR__, 2).'/dist/pdf.worker.min.mjs';

        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Type' => 'text/javascript; charset=utf-8',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
