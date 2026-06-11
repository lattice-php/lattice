<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Textarea;

it('serializes a textarea', function (): void {
    $node = wire(Textarea::make('bio', 'Bio')->rows(4)->placeholder('Tell us about yourself'));

    expect($node['type'])->toBe('form.textarea')
        ->and($node['props'])->toMatchArray([
            'name' => 'bio',
            'label' => 'Bio',
            'rows' => 4,
            'placeholder' => 'Tell us about yourself',
        ]);
});

describe('docs fixtures', function (): void {
    it('dumps the textarea example', function (): void {
        dumpFixture('textarea.basic', [
            Textarea::make('bio', 'Bio')->rows(4)->placeholder('Tell us about yourself'),
        ]);

        expect('docs/fixtures/textarea.basic.json')->toBeReadableFile();
    });
});
