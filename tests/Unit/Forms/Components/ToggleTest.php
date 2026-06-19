<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Toggle;

it('serializes the shared focus options', function (): void {
    $node = wire(Toggle::make('published', 'Published')->autoFocus()->tabIndex(3));

    expect($node['type'])->toBe('field.toggle')
        ->and($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 3]);
});

it('serializes a default boolean value', function (): void {
    $node = wire(Toggle::make('published', 'Published')->value(true));

    expect($node['props'])->toMatchArray([
        'name' => 'published',
        'label' => 'Published',
        'value' => true,
    ]);
});

describe('docs fixtures', function (): void {
    it('dumps the toggle example', function (): void {
        dumpFixture('toggle.basic', [
            Toggle::make('published', 'Published')->helperText('Show this item publicly.'),
        ]);

        expect('docs/fixtures/toggle.basic.json')->toBeReadableFile();
    });
});
