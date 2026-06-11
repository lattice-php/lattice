<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Choice;

it('serializes the shared focus options', function (): void {
    $node = wire(Choice::make('plan', 'Plan')->autoFocus()->tabIndex(2));

    expect($node['type'])->toBe('form.choice')
        ->and($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 2]);
});

describe('docs fixtures', function (): void {
    it('dumps the choice example', function (): void {
        dumpFixture('choice.basic', [
            Choice::make('plan', 'Plan')->options([
                Choice::option('Free', 'free'),
                Choice::option('Pro', 'pro'),
                Choice::option('Enterprise', 'enterprise'),
            ]),
        ]);

        expect('docs/fixtures/choice.basic.json')->toBeReadableFile();
    });
});
