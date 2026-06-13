<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Lattice\Lattice\Attributes\Page;
use Lattice\Lattice\Core\Components\Text;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Http\Page as BasePage;

#[Page(route: '/discovered-demo', name: 'discovered.demo', middleware: ['web'])]
final class DiscoveredDemoPage extends BasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Discovered'));
    }
}
