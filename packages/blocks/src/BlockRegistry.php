<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Core\DefinitionRegistry;
use Lattice\Core\Exceptions\UnknownComponent;
use Lattice\Form\Components\Field;
use Lattice\Form\FormData;
use Lattice\Form\FormSchemaWalker;
use Lattice\Ui\Components\Component;

/**
 * @extends DefinitionRegistry<BlockDefinition>
 */
final class BlockRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<BlockDefinition>  $definition
     */
    public function keyOf(string $definition): string
    {
        return $this->keyFor($definition);
    }

    public function has(string $key): bool
    {
        return array_key_exists($key, $this->definitions());
    }

    public function find(string $key): ?BlockDefinition
    {
        try {
            return $this->resolve($key);
        } catch (UnknownComponent) {
            return null;
        }
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        return array_keys($this->definitions());
    }

    /**
     * The slot rules for a block's current data, keyed by slot name.
     *
     * @param  array<string, mixed>|null  $data
     * @return array<string, SlotData>
     */
    public function slotsFor(BlockDefinition $definition, ?array $data): array
    {
        $slots = [];

        foreach ($definition->slots($data) as $slot) {
            $slots[$slot->name] = $slot->data($this);
        }

        return $slots;
    }

    public function typeData(string $key): BlockTypeData
    {
        $definition = $this->resolve($key);
        $fields = $definition->fields();

        return new BlockTypeData(
            type: $key,
            label: $definition->label(),
            icon: $definition->icon(),
            category: $definition->category(),
            description: $definition->description(),
            keywords: $definition->keywords(),
            schema: array_values(array_filter($fields, static fn (Component $field): bool => $field->shouldRender())),
            slots: array_values($this->slotsFor($definition, null)),
            supports: $definition->supports(),
            defaults: $this->defaults($fields),
        );
    }

    /**
     * Cast stored data through the block's fields without validating it, so a
     * half-filled draft still renders.
     *
     * @param  array<string, mixed>  $data
     */
    public function castData(BlockDefinition $definition, array $data): BlockData
    {
        $form = FormData::make($data);
        $cast = $data;

        foreach (app(FormSchemaWalker::class)->instances($definition->fields(), $form) as $instance) {
            if (! array_key_exists($instance->path, $cast)) {
                continue;
            }

            $cast[$instance->path] = $instance->field->castValue($instance->field->normalizeInput($cast[$instance->path]));
        }

        return BlockData::of($cast);
    }

    /**
     * @param  array<int, Field>  $fields
     * @return array<string, mixed>
     */
    private function defaults(array $fields): array
    {
        $defaults = [];

        foreach (app(FormSchemaWalker::class)->instances($fields, FormData::make([])) as $instance) {
            if ($instance->field->hasValue()) {
                $defaults[$instance->path] = $instance->field->value;
            }
        }

        return $defaults;
    }

    protected function definitionClass(): string
    {
        return BlockDefinition::class;
    }

    public function attributeClass(): string
    {
        return AsBlock::class;
    }

    protected function name(): string
    {
        return 'block';
    }

    public function group(): string
    {
        return 'blocks';
    }
}
