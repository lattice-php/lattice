<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Avatar;
use Lattice\Lattice\Ui\Components\Badge;
use Lattice\Lattice\Ui\Components\Button;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Enums\ButtonVariant;
use Lattice\Lattice\Ui\Enums\Gap;
use Lattice\Lattice\Ui\Enums\Intent;
use Lattice\Lattice\Ui\Enums\Size;
use Lattice\Lattice\Ui\Enums\StackDirection;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/buttons')]
final class ButtonsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.buttons.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('buttons-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make(__('workbench.pages.home.button-variants')),
                    Stack::make('button-variants')
                        ->direction(StackDirection::Row)
                        ->gap(Gap::Small)
                        ->schema([
                            Button::make(__('workbench.pages.home.buttons.primary'), 'button-primary'),
                            Button::make(__('workbench.pages.home.buttons.secondary'), 'button-secondary')->color(Intent::Secondary),
                            Button::make(__('workbench.pages.home.buttons.success'), 'button-success')->color(Intent::Success),
                            Button::make(__('workbench.pages.home.buttons.info'), 'button-info')->color(Intent::Info),
                            Button::make(__('workbench.pages.home.buttons.warning'), 'button-warning')->color(Intent::Warning),
                            Button::make(__('workbench.pages.home.buttons.danger'), 'button-danger')->color(Intent::Danger),
                            Button::make(__('workbench.pages.home.buttons.outline'), 'button-outline')->variant(ButtonVariant::Outline),
                            Button::make(__('workbench.pages.home.buttons.ghost'), 'button-ghost')->variant(ButtonVariant::Ghost),
                        ]),
                    Heading::make(__('workbench.pages.components.buttons.badges'), 2),
                    Stack::make('badge-examples')
                        ->direction(StackDirection::Row)
                        ->gap(Gap::Small)
                        ->schema([
                            Badge::make(__('workbench.pages.components.buttons.badge-active')),
                            Badge::make(__('workbench.pages.components.buttons.badge-trialing')),
                        ]),
                    Heading::make(__('workbench.pages.components.buttons.avatars'), 2),
                    Stack::make('avatar-examples')
                        ->direction(StackDirection::Row)
                        ->gap(Gap::Small)
                        ->schema([
                            Avatar::make()->name('Ada Lovelace'),
                            Avatar::make()->name('Grace Hopper')->size(Size::Lg),
                            Avatar::make(),
                        ]),
                ]),
        ]);
    }
}
