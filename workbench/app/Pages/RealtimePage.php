<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Realtime\Listen;
use Workbench\App\Components\EchoStatus;

#[AsPage(route: '/realtime')]
final class RealtimePage extends WorkbenchPage
{
    public function title(): string
    {
        return 'Realtime';
    }

    /**
     * @return array<int, Listen>
     */
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
