<?php

declare(strict_types=1);

namespace Workbench\App\Pages\Platform;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Realtime\Listen;
use Lattice\Lattice\Ui\Components\Heading;
use Lattice\Lattice\Ui\Components\Stack;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\Enums\Gap;
use Workbench\App\Components\EchoStatus;
use Workbench\App\Pages\WorkbenchPage;

#[AsPage(route: '/platform/realtime')]
final class RealtimePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Realtime';
    }

    /**
     * @return array<int, Listen>
     */
    #[\Override]
    protected function listeners(): array
    {
        return [
            Listen::channel('orders')->on('.OrderShipped')->toast('Order shipped'),
        ];
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('realtime-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make('Realtime'),
                    Text::make('Subscribes to the orders channel and toasts on OrderShipped.'),
                    EchoStatus::make('echo-status'),
                ]),
        ]);
    }
}
