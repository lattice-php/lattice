<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Textarea;

it('serializes a textarea', function (): void {
    $node = Textarea::make('bio', 'Bio')->rows(4)->placeholder('Tell us about yourself')->toArray();

    expect($node['type'])->toBe('form.textarea')
        ->and($node['props'])->toMatchArray([
            'name' => 'bio',
            'label' => 'Bio',
            'rows' => 4,
            'placeholder' => 'Tell us about yourself',
        ]);
});
