<?php

declare(strict_types=1);

namespace Workbench\App\Pages;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Heading;
use Lattice\Lattice\Core\Components\Stack;
use Lattice\Lattice\Core\Components\Stream;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\Enums\Gap;
use Lattice\Lattice\Core\PageSchema;

#[Page(route: '/streaming')]
class StreamDemoPage extends WorkbenchPage
{
    public function title(): string
    {
        return __('workbench.pages.streaming.title');
    }

    public function render(PageSchema $schema): PageSchema
    {
        return $schema->schema([
            Stack::make('streaming-page')
                ->gap(Gap::Large)
                ->schema([
                    Heading::make(__('workbench.pages.streaming.heading')),
                    Text::make(__('workbench.pages.streaming.description')),
                    Stream::make('stream-demo')->endpoint('/workbench/stream-demo'),
                ]),
        ]);
    }
}
