<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;

#[AsPage(route: '/settings', name: 'settings')]
final class SettingsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.settings.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('settings-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.settings.heading')),
                    Text::make(__('workbench.pages.settings.placeholder')),
                ]),
        ]);
    }
}
