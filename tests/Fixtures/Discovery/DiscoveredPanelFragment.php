<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Discovery;

use Lattice\Core\Attributes\AsFragment;
use Lattice\Fragments\FragmentDefinition;
use Lattice\Ui\Components\Text;
use Lattice\Ui\PageSchema;

#[AsFragment('fixtures.panel')]
class DiscoveredPanelFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Discovered fragment'));
    }
}
