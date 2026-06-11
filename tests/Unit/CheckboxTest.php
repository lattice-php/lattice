<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Checkbox;

describe('docs fixtures', function (): void {
    it('dumps the checkbox example', function (): void {
        dumpFixture('checkbox.basic', [
            Checkbox::make('newsletter', 'Subscribe to the newsletter'),
        ]);

        expect('docs/fixtures/checkbox.basic.json')->toBeReadableFile();
    });
});
