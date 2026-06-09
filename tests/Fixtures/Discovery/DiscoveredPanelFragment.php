<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests\Fixtures\Discovery;

use Bambamboole\Lattice\Attributes\Fragment;
use Bambamboole\Lattice\Core\Components\Text;
use Bambamboole\Lattice\Core\PageSchema;
use Bambamboole\Lattice\Fragments\FragmentDefinition;

#[Fragment('fixtures.panel')]
class DiscoveredPanelFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Discovered fragment'));
    }
}
