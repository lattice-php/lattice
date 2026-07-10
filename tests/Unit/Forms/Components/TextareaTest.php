<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Support\Wire;

it('serializes a textarea', function (): void {
    $node = wire(Textarea::make('bio', 'Bio')->rows(4)->placeholder('Tell us about yourself'));

    expect($node['type'])->toBe('field.textarea')
        ->and($node['props'])->toMatchArray([
            'name' => 'bio',
            'label' => 'Bio',
            'rows' => 4,
            'placeholder' => 'Tell us about yourself',
        ]);
});

describe('docs fixtures', function (): void {
    it('matches the textarea example fixture', function (): void {
        assertFixtureMatches('textarea.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Textarea::make('bio', 'Bio')->rows(4)->placeholder('Tell us about yourself'),
        ]))));
    });
});
