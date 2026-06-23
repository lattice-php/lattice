<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Section;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Components\Tooltip;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Gap;

it('serializes a card tooltip', function (): void {
    $node = wire(Card::make('Plan')->tooltip('Billed monthly.'));

    expect($node['props']['tooltip'])->toBe('Billed monthly.');
});

it('serializes a null card tooltip when unset', function (): void {
    $node = wire(Card::make('Plan'));

    expect($node['props']['tooltip'])->toBeNull();
});

describe('docs fixtures', function (): void {
    it('dumps the card example', function (): void {
        dumpFixture('components.card', [
            Card::make('Team settings', 'Manage how your team appears.')
                ->tooltip('These settings affect everyone on the team.')
                ->schema([
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

    it('dumps the section example', function (): void {
        dumpFixture('components.section', [
            Section::make('Members', 'People with access to this team.')
                ->collapsible()
                ->tooltip('Only admins can change who has access.')
                ->headerActions([Button::make('Invite member')->variant(ButtonVariant::Outline)])
                ->schema([
                    Text::make('Three people have access to this team.'),
                    Badge::make('3 active'),
                ]),
        ]);

        expect('docs/fixtures/components.section.json')->toBeReadableFile();
    });

    it('dumps the tooltip example', function (): void {
        dumpFixture('components.tooltip', [
            Stack::make()->direction('row')->gap(Gap::Small)->schema([
                Badge::make('Plan: Pro'),
                Tooltip::make()->content('Includes unlimited seats and priority support.'),
            ]),
        ]);

        expect('docs/fixtures/components.tooltip.json')->toBeReadableFile();
    });

    it('dumps the button variants example', function (): void {
        dumpFixture('components.buttons', [
            Stack::make()->direction('row')->gap(Gap::Small)->schema([
                Button::make('Default')->variant(ButtonVariant::Default),
                Button::make('Secondary')->variant(ButtonVariant::Secondary),
                Button::make('Success')->variant(ButtonVariant::Success),
                Button::make('Info')->variant(ButtonVariant::Info),
                Button::make('Destructive')->variant(ButtonVariant::Destructive),
                Button::make('Outline')->variant(ButtonVariant::Outline),
                Button::make('Ghost')->variant(ButtonVariant::Ghost),
            ]),
        ]);

        expect('docs/fixtures/components.buttons.json')->toBeReadableFile();
    });
});
