<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Choice;

describe('docs fixtures', function (): void {
    it('matches the choice example fixture', function (): void {
        assertFixtureMatches('choice.basic', Wire::toWire([
            Choice::make('plan', 'Plan')->options([
                Choice::option('Free', 'free'),
                Choice::option('Pro', 'pro'),
                Choice::option('Enterprise', 'enterprise'),
            ]),
        ]));
    });
});
