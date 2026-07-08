<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\FormData;

final readonly class BlockRenderer
{
    public function __construct(private BlockRegistry $blocks) {}

    /**
     * @param  array<int, array<string, mixed>>  $rows
     */
    public function render(array $rows): PageSchema
    {
        $schema = PageSchema::make();

        foreach ($this->components($rows) as $component) {
            $schema->component($component);
        }

        return $schema;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, Component>
     */
    private function components(array $rows): array
    {
        $components = [];

        foreach ($rows as $row) {
            foreach ($this->componentsForRow($row) as $component) {
                $components[] = $component;
            }
        }

        return $components;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Component>
     */
    private function componentsForRow(array $row): array
    {
        $type = is_string($row['type'] ?? null) ? $row['type'] : '';
        $block = $this->blocks->resolve($type);

        return $block->render(FormData::make($row), new BlockSlots)->renderable();
    }
}
