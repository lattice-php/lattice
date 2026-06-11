<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Choice;

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
