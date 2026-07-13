<?php
declare(strict_types=1);

use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Avatar;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Card;
use Lattice\Lattice\Ui\Components\Grid;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Image;
use Lattice\Lattice\Ui\Components\RawBlock;
use Lattice\Lattice\Ui\Components\Section;
use Lattice\Lattice\Ui\Components\SegmentedControl;
use Lattice\Lattice\Ui\Components\Separator;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Tab;
use Lattice\Lattice\Ui\Components\Tabs;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Components\Tooltip;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\Orientation;
use Lattice\Lattice\Ui\Enums\Size;
use Lattice\Lattice\Ui\Enums\StackDirection;

it('serializes a card tooltip', function (): void {
    $node = wire(Card::make('Plan')->tooltip('Billed monthly.'));

    expect($node['props']['tooltip'])->toBe('Billed monthly.');
});

it('serializes a null card tooltip when unset', function (): void {
    $node = wire(Card::make('Plan'));

    expect($node['props']['tooltip'])->toBeNull();
});

describe('docs fixtures', function (): void {
    it('matches the card example fixture', function (): void {
        assertFixtureMatches('components.card', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Card::make('Team settings', 'Manage how your team appears.')
                ->tooltip('These settings affect everyone on the team.')
                ->schema([
                    Stack::make()->gap(Gap::Small)->schema([
                        Heading::make('Members', 2),
                        Text::make('Three people have access to this team.'),
                        Badge::make('3 active'),
                    ]),
                    Button::make('Invite member'),
                ]),
        ]))));
    });

    it('matches the grid example fixture', function (): void {
        assertFixtureMatches('components.grid', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Grid::make()->columns(3)->schema([
                Badge::make('First'),
                Badge::make('Second'),
                Badge::make('Third'),
            ]),
        ]))));
    });

    it('matches the section example fixture', function (): void {
        assertFixtureMatches('components.section', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Section::make('Members', 'People with access to this team.')
                ->collapsible()
                ->tooltip('Only admins can change who has access.')
                ->headerActions([Button::make('Invite member')->variant(ButtonVariant::Outline)])
                ->schema([
                    Text::make('Three people have access to this team.'),
                    Badge::make('3 active'),
                ]),
        ]))));
    });

    it('matches the tooltip example fixture', function (): void {
        assertFixtureMatches('components.tooltip', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->direction(StackDirection::Row)->gap(Gap::Small)->schema([
                Badge::make('Plan: Pro'),
                Tooltip::make()->content('Includes unlimited seats and priority support.'),
            ]),
        ]))));
    });

    it('matches the button variants example fixture', function (): void {
        assertFixtureMatches('components.buttons', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->direction(StackDirection::Row)->gap(Gap::Small)->schema([
                Button::make('Default')->variant(ButtonVariant::Default),
                Button::make('Secondary')->variant(ButtonVariant::Secondary),
                Button::make('Success')->variant(ButtonVariant::Success),
                Button::make('Info')->variant(ButtonVariant::Info),
                Button::make('Destructive')->variant(ButtonVariant::Destructive),
                Button::make('Outline')->variant(ButtonVariant::Outline),
                Button::make('Ghost')->variant(ButtonVariant::Ghost),
            ]),
        ]))));
    });

    it('matches the stack example fixture', function (): void {
        assertFixtureMatches('components.stack', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->direction(StackDirection::Row)->gap(Gap::Small)->schema([
                Button::make('Save')->variant(ButtonVariant::Default),
                Button::make('Cancel')->variant(ButtonVariant::Ghost),
            ]),
        ]))));
    });

    it('matches the display example fixture', function (): void {
        assertFixtureMatches('components.text', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->gap(Gap::Small)->schema([
                Heading::make('Billing', 2),
                Text::make('Invoices are sent on the first of each month.'),
                Badge::make('Trialing'),
            ]),
        ]))));
    });

    it('matches the raw block example fixture', function (): void {
        assertFixtureMatches('components.raw-block', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            RawBlock::make()->html('<p>Rendered from <strong>trusted</strong> server HTML.</p>'),
        ]))));
    });

    it('matches the segmented control example fixture', function (): void {
        assertFixtureMatches('components.segmented-control', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            SegmentedControl::make('appearance', 'Appearance')
                ->options([
                    SegmentedControl::option('Light', 'light'),
                    SegmentedControl::option('Dark', 'dark'),
                    SegmentedControl::option('System', 'system'),
                ])
                ->value('light')
                ->emits('appearance-changed'),
        ]))));
    });

    it('matches the avatar example fixture', function (): void {
        assertFixtureMatches('components.avatar', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->direction(StackDirection::Row)->gap(Gap::Small)->schema([
                Avatar::make('https://i.pravatar.cc/96?img=13')->name('Ada Lovelace'),
                Avatar::make()->name('Grace Hopper'),
                Avatar::make()->name('Katherine Johnson')->size(Size::Lg),
                Avatar::make(),
            ]),
        ]))));
    });

    it('matches the image example fixture', function (): void {
        assertFixtureMatches('components.image', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->direction(StackDirection::Row)->gap(Gap::Small)->schema([
                Image::make('https://picsum.photos/id/1060/600/400')
                    ->alt('Coffee brewing setup')
                    ->size(96),
                Image::make('https://picsum.photos/id/1080/600/400')
                    ->alt('Strawberries')
                    ->size(96)
                    ->circular(),
                Image::make('https://picsum.photos/id/1084/600/400')
                    ->alt('Walrus resting')
                    ->size(96)
                    ->previewable(false),
            ]),
        ]))));
    });

    it('matches the separator example fixture', function (): void {
        assertFixtureMatches('components.separator', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->gap(Gap::Small)->schema([
                Text::make('Profile'),
                Separator::make(),
                Text::make('Billing'),
                Separator::make(),
                Text::make('Security'),
            ]),
        ]))));
    });

    it('matches the vertical separator example fixture', function (): void {
        assertFixtureMatches('components.separator-vertical', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Stack::make()->direction(StackDirection::Row)->gap(Gap::Small)->schema([
                Text::make('Draft'),
                Separator::make()->orientation(Orientation::Vertical),
                Text::make('Published'),
                Separator::make()->orientation(Orientation::Vertical),
                Text::make('Archived'),
            ]),
        ]))));
    });

    it('matches the tabs example fixture', function (): void {
        assertFixtureMatches('components.tabs', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Tabs::make()->defaultValue('details')->schema([
                Tab::make('details', 'Details')->schema([
                    Text::make('Team details go here.'),
                ]),
                Tab::make('history', 'History')->schema([
                    Text::make('Recent activity for the team.'),
                ]),
            ]),
        ]))));
    });
});
