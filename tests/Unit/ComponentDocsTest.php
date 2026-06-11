<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Gap;

describe('docs fixtures', function (): void {
    it('dumps the card example', function (): void {
        dumpFixture('components.card', [
            Card::make('Team settings', 'Manage how your team appears.')->schema([
                Stack::make()->gap(Gap::Small)->schema([
                    Heading::make('Members', 2),
                    Text::make('Three people have access to this team.'),
                    Badge::make('3 active'),
                ]),
                Button::make('Invite member')->variant(ButtonVariant::Default),
            ]),
        ]);

        expect('docs/fixtures/components.card.json')->toBeReadableFile();
    });

    it('dumps the grid example', function (): void {
        dumpFixture('components.grid', [
            Grid::make()->columns(3)->schema([
                Badge::make('First'),
                Badge::make('Second'),
                Badge::make('Third'),
            ]),
        ]);

        expect('docs/fixtures/components.grid.json')->toBeReadableFile();
    });
});
