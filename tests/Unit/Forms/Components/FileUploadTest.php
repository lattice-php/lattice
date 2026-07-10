<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\FileUpload;
use Lattice\Lattice\Support\Wire;

describe('docs fixtures', function (): void {
    it('matches the file upload example fixture', function (): void {
        assertFixtureMatches('file-upload.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            FileUpload::make('avatar', 'Avatar')->image()->maxSize(2048),
        ]))));
    });
});
