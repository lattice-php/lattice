<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Lattice\Lattice\Attributes\AsFragment;
use Lattice\Lattice\Fragments\FragmentDefinition;
use Lattice\Lattice\Ui\Components\Text;
use Lattice\Lattice\Ui\PageSchema;

#[AsFragment('fixtures.panel')]
class DiscoveredPanelFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Discovered fragment'));
    }
}
