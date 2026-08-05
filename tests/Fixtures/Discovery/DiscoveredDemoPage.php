<?php

declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Lattice\Core\Attributes\AsPage;
use Lattice\Http\Page as BasePage;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

#[AsPage(route: '/discovered-demo', name: 'discovered.demo', middleware: ['web'])]
final class DiscoveredDemoPage extends BasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Discovered'));
    }
}
