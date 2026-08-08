<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Checkbox;

describe('docs fixtures', function (): void {
    it('matches the checkbox example fixture', function (): void {
        assertFixtureMatches('checkbox.basic', Wire::toWire([
            Checkbox::make('newsletter', 'Subscribe to the newsletter'),
        ]));
    });
});
