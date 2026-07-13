<?php
declare(strict_types=1);

namespace Workbench\App\Pages\Components;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/components/notifications')]
final class NotificationsPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.components.notifications.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        $slideOut = request()->query('mode') === 'slide-out';

        return $schema->schema([
            Stack::make('notifications-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make($this->title()),
                    Text::make(
                        $slideOut
                            ? __('workbench.pages.components.notifications.slide-out')
                            : __('workbench.pages.components.notifications.popover'),
                        'notifications-mode-marker',
                    ),
                ]),
        ]);
    }
}
