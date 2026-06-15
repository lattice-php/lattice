<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\FileUpload;

describe('docs fixtures', function (): void {
    it('dumps the file upload example', function (): void {
        dumpFixture('file-upload.basic', [
            FileUpload::make('avatar', 'Avatar')->image()->maxSize(2048),
        ]);

        expect('docs/fixtures/file-upload.basic.json')->toBeReadableFile();
    });
});
