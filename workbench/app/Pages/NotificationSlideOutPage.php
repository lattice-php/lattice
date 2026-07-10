<?php
declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\PageSchema;

#[AsPage(route: '/notifications-slide-out')]
final class NotificationSlideOutPage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Notification Slide Out';
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Text::make('Notification Slide Out', 'notification-slide-out-marker'),
        ]);
    }
}
