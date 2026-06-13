<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Badge;
use Lattice\Lattice\Core\Components\Button;
use Lattice\Lattice\Core\Components\Card;
use Lattice\Lattice\Core\Components\Grid;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\ButtonVariant;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Tables\Components\Table;
use Workbench\App\Tables\UsersTable;

#[Page(route: '/')]
final class HomePage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.home.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('workbench-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Stack::make('workbench-hero')
                        ->gap(Gap::Large)
                        ->schema([
                            Badge::make(__('workbench.pages.home.badge')),
                            Heading::make(__('workbench.pages.home.heading')),
                            Text::make(__('workbench.pages.home.intro')),
                        ]),
                    Grid::make('workbench-capabilities')
                        ->columns(2)
                        ->schema([
                            Card::make(__('workbench.pages.home.components-title'), __('workbench.pages.home.components-description')),
                            Card::make(__('workbench.pages.home.renderer-title'), __('workbench.pages.home.renderer-description')),
                        ]),
                    Heading::make(__('workbench.pages.home.button-variants'), 2),
                    Stack::make('workbench-buttons')
                        ->direction('row')
                        ->gap(Gap::Small)
                        ->schema([
                            Button::make(__('workbench.pages.home.buttons.default'), 'button-default')->variant(ButtonVariant::Default),
                            Button::make(__('workbench.pages.home.buttons.secondary'), 'button-secondary')->variant(ButtonVariant::Secondary),
                            Button::make(__('workbench.pages.home.buttons.success'), 'button-success')->variant(ButtonVariant::Success),
                            Button::make(__('workbench.pages.home.buttons.info'), 'button-info')->variant(ButtonVariant::Info),
                            Button::make(__('workbench.pages.home.buttons.destructive'), 'button-destructive')->variant(ButtonVariant::Destructive),
                            Button::make(__('workbench.pages.home.buttons.outline'), 'button-outline')->variant(ButtonVariant::Outline),
                            Button::make(__('workbench.pages.home.buttons.ghost'), 'button-ghost')->variant(ButtonVariant::Ghost),
                        ]),
                    Heading::make(__('workbench.pages.home.users'), 2),
                    Table::use(UsersTable::class),
                ]),
        ]);
    }
}
