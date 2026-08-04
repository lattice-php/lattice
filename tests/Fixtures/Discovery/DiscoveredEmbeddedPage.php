<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Lattice\Lattice\Attributes\AsPage;
use Lattice\Lattice\Http\Page as BasePage;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\PageSchema;

#[AsPage(name: 'discovered.embedded')]
final class DiscoveredEmbeddedPage extends BasePage
{
    public function render(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Embedded'));
    }
}
