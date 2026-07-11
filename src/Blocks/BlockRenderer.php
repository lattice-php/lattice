<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

use Lattice\Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Components\Text;

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

        try {
            $block = $this->blocks->resolve($type);
        } catch (UnknownComponent) {
            return [Text::make("Unknown block [{$type}]")];
        }

        return $block->render(FormData::make($row), $this->slotsFor($block, $row))->renderable();
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function slotsFor(BlockDefinition $block, array $row): BlockSlots
    {
        $rendered = [];

        foreach ($block->slots() as $name) {
            $childRows = $row['slots'][$name] ?? [];
            $rendered[$name] = is_array($childRows) ? $this->components($childRows) : [];
        }

        return new BlockSlots($rendered);
    }
}
