<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Blocks\BlockRegistry;
use Lattice\Lattice\Blocks\BlockRenderer;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\IsInteractive;
use LogicException;

#[AsField(FieldType::BlockEditor)]
class BlockEditor extends TypedRowsField
{
    use IsInteractive {
        decorateProps as decorateInteractiveProps;
    }

    public const string SLOTS = 'slots';

    public ?string $endpoint = null;

    /**
     * @param  array<int, class-string<BlockDefinition>>  $blocks
     */
    public function blocks(array $blocks): static
    {
        $registry = app(BlockRegistry::class);

        $this->templates(array_map(
            function (string $block) use ($registry): RowTemplate {
                $definition = app($block);

                return RowTemplate::make($registry->keyFor($block))
                    ->schema($definition->attributes())
                    ->slots($definition->slots());
            },
            $blocks,
        ));

        foreach ($this->templates as $template) {
            foreach ($template->fields() as $field) {
                if ($field->name() === self::SLOTS) {
                    throw new LogicException(sprintf(
                        'Block schemas must not declare a [%s] field: the key is reserved for nested block rows.',
                        self::SLOTS,
                    ));
                }
            }
        }

        $this->id ??= $this->name;
        $this->endpoint ??= '/'.ltrim((string) config('lattice.blocks.endpoint', 'lattice/blocks/render'), '/');
        $this->signedAs('block-editor');
        $this->context(['allowedBlocks' => array_map(
            static fn (RowTemplate $template): string => $template->type,
            $this->templates,
        )]);

        return $this;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, string>
     */
    private function slotNamesFor(array $row): array
    {
        $type = $row[self::TYPE] ?? null;

        foreach ($this->templates as $template) {
            if ($template->type === $type) {
                return $template->slotNames();
            }
        }

        return [];
    }

    #[\Override]
    protected function rowRulesAt(string $prefix, array $row, FormData $data, Request $request): array
    {
        $rules = parent::rowRulesAt($prefix, $row, $data, $request);
        $slots = $this->slotNamesFor($row);

        if ($slots === []) {
            return $rules;
        }

        $rules["{$prefix}.".self::SLOTS] = ['sometimes', 'array'];

        foreach ($slots as $slot) {
            $rules["{$prefix}.".self::SLOTS.".{$slot}"] = ['sometimes', 'array'];

            $childRows = $row[self::SLOTS][$slot] ?? [];

            foreach (array_values(is_array($childRows) ? $childRows : []) as $index => $childRow) {
                $rules = [...$rules, ...$this->rowRulesAt(
                    "{$prefix}.".self::SLOTS.".{$slot}.{$index}",
                    is_array($childRow) ? $childRow : [],
                    $data,
                    $request,
                )];
            }
        }

        return $rules;
    }

    #[\Override]
    protected function castRow(array $castRow, mixed $original): array
    {
        $castRow = parent::castRow($castRow, $original);
        $row = is_array($original) ? $original : [];
        $slots = $this->slotNamesFor($row);

        if ($slots === []) {
            return $castRow;
        }

        $originalSlots = is_array($row[self::SLOTS] ?? null) ? $row[self::SLOTS] : [];
        $cast = [];

        foreach ($slots as $slot) {
            $cast[$slot] = $this->castValue($originalSlots[$slot] ?? []);
        }

        return [...$castRow, self::SLOTS => $cast];
    }

    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props = $this->decorateInteractiveProps($props);

        if (is_array($props['value'] ?? null)) {
            $props['value'] = array_map(
                fn (mixed $row): mixed => is_array($row) ? $this->withNestedRowIds($row) : $row,
                $props['value'],
            );
        }

        return $props;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function withNestedRowIds(array $row): array
    {
        foreach ($this->slotNamesFor($row) as $slot) {
            $childRows = $row[self::SLOTS][$slot] ?? [];

            $row[self::SLOTS][$slot] = array_map(
                fn (mixed $child): mixed => is_array($child)
                    ? $this->withNestedRowIds([self::ROW_ID => self::rowIdOf($child), ...$child])
                    : $child,
                array_values(is_array($childRows) ? $childRows : []),
            );
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 350)]
    protected function serialiseRenderedRows(array $data): array
    {
        $rows = is_array($this->value) ? array_values($this->value) : [];

        return [...$data, 'rendered' => $this->renderedTree($rows)];
    }

    /**
     * The per-row previews the canvas seeds from, mirroring the value's slot
     * nesting so every block at any depth ships its own rendered wire.
     *
     * @param  array<int, mixed>  $rows
     * @return array<int, array{wire: array<int, mixed>, slots: array<string, mixed>}>
     */
    private function renderedTree(array $rows): array
    {
        $renderer = app(BlockRenderer::class);

        return array_map(function (mixed $row) use ($renderer): array {
            $row = is_array($row) ? $row : [];
            $slots = [];

            foreach ($this->slotNamesFor($row) as $slot) {
                $childRows = $row[self::SLOTS][$slot] ?? [];
                $slots[$slot] = $this->renderedTree(is_array($childRows) ? array_values($childRows) : []);
            }

            return [
                'wire' => $renderer->render([$row])->renderable(),
                'slots' => $slots,
            ];
        }, $rows);
    }
}
