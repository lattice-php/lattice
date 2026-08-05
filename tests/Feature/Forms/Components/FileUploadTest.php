<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\FileUpload;

describe('docs fixtures', function (): void {
    it('matches the file upload example fixture', function (): void {
        assertFixtureMatches('file-upload.basic', Wire::toWire([
            FileUpload::make('avatar', 'Avatar')->image()->maxSize(2048),
        ]));
    });
});
