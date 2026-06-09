<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tests\Fixtures\Discovery;

use Bambamboole\Lattice\Attributes\Fragment;
use Bambamboole\Lattice\Core\Components\Text;
use Bambamboole\Lattice\Fragments\FragmentDefinition;
use Bambamboole\Lattice\Pages\PageSchema;

#[Fragment('fixtures.panel')]
class DiscoveredPanelFragment extends FragmentDefinition
{
    public function schema(PageSchema $schema): PageSchema
    {
        return $schema->component(Text::make('Discovered fragment'));
    }
}
