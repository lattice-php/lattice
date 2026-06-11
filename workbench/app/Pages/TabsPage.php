<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Tab;
use Lattice\Lattice\Core\Components\Tabs;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\Enums\Orientation;
use Lattice\Lattice\Core\PageSchema;

final class TabsPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Lattice Tabs';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('tabs-page')
                ->gap(Gap::ExtraLarge)
                ->schema([
                    Heading::make('Horizontal tabs'),
                    Tabs::make('horizontal-tabs')
                        ->queryKey('h')
                        ->defaultValue('overview')
                        ->schema([
                            Tab::make('overview', 'Overview')->schema([Text::make('Overview panel')]),
                            Tab::make('details', 'Details')->schema([Text::make('Details panel')]),
                            Tab::make('history', 'History')->schema([Text::make('History panel')]),
                        ]),
                    Heading::make('Vertical tabs'),
                    Tabs::make('vertical-tabs')
                        ->queryKey('v')
                        ->orientation(Orientation::Vertical)
                        ->defaultValue('account')
                        ->schema([
                            Tab::make('account', 'Account')->schema([Text::make('Account panel')]),
                            Tab::make('security', 'Security')->schema([Text::make('Security panel')]),
                            Tab::make('billing', 'Billing')->schema([Text::make('Billing panel')]),
                        ]),
                ]),
        ]);
    }
}
