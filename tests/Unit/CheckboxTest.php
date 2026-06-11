<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Checkbox;

it('serializes the shared focus options', function (): void {
    $node = wire(Checkbox::make('terms', 'Accept terms')->autoFocus()->tabIndex(3));

    expect($node['type'])->toBe('form.checkbox')
        ->and($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 3]);
});

describe('docs fixtures', function (): void {
    it('dumps the checkbox example', function (): void {
        dumpFixture('checkbox.basic', [
            Checkbox::make('newsletter', 'Subscribe to the newsletter'),
        ]);

        expect('docs/fixtures/checkbox.basic.json')->toBeReadableFile();
    });
});
