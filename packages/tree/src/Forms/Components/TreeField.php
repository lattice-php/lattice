<?php
declare(strict_types=1);

namespace Lattice\Tree\Forms\Components;

use Illuminate\Http\Request;
use InvalidArgumentException;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Components\Field;
use Lattice\Form\Components\TypedRowsField;
use Lattice\Form\FormData;
use LogicException;

/**
 * Typed rows arranged as a tree: each row may hold nested rows under the
 * reserved `children` key, validated and cast through the same templates.
 * Hierarchy is data — the submitted structure is the authoritative order and
 * nesting, so consumers persist parent/position straight from the value.
 *
 * Depth is enforced structurally: a row at the deepest allowed level gets no
 * `children` field, so deeper submitted rows fail with a `prohibited` error
 * instead of being silently dropped.
 *
 * @api
 */
#[AsField(type: 'tree')]
class TreeField extends TypedRowsField
{
    public const string CHILDREN = 'children';

    public ?int $maxDepth = null;

    /** @var list<string>|null Row types allowed to hold children; null allows every type. */
    public ?array $childBearingTypes = null;

    public function maxDepth(int $depth): static
    {
        if ($depth < 1) {
            throw new InvalidArgumentException('The tree depth must be at least 1.');
        }

        $this->maxDepth = $depth;

        return $this;
    }

    /**
     * @param  list<string>  $types
     */
    public function acceptsChildrenFor(array $types): static
    {
        $this->childBearingTypes = $types;

        return $this;
    }

    #[\Override]
    public function templates(array $templates): static
    {
        foreach ($templates as $template) {
            foreach ($template->fields() as $field) {
                if ($field->name() === self::CHILDREN) {
                    throw new LogicException(sprintf(
                        'Row templates must not declare a [%s] field: the key is reserved for the nested rows.',
                        self::CHILDREN,
                    ));
                }
            }
        }

        return parent::templates($templates);
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Field>
     */
    #[\Override]
    public function rowFields(array $row): array
    {
        $fields = parent::rowFields($row);

        if (! $this->rowAcceptsChildren($row)) {
            return $fields;
        }

        return [...$fields, $this->childrenField()];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    protected function rowAcceptsChildren(array $row): bool
    {
        if ($this->maxDepth !== null && $this->maxDepth <= 1) {
            return false;
        }

        if ($this->childBearingTypes === null) {
            return true;
        }

        $type = $row[self::TYPE] ?? null;

        return is_string($type) && in_array($type, $this->childBearingTypes, true);
    }

    /**
     * A fresh instance instead of a clone so root-only configuration (label,
     * value, rules, conditions, min/max items) never leaks into nested levels.
     */
    protected function childrenField(): static
    {
        $child = static::make(self::CHILDREN);
        $child->rowTemplates = $this->rowTemplates;
        $child->childBearingTypes = $this->childBearingTypes;
        $child->maxDepth = $this->maxDepth === null ? null : $this->maxDepth - 1;
        $child->reorderable = $this->reorderable;
        $child->addLabel = $this->addLabel;

        return $child;
    }

    /**
     * A row that has no children of its own must not inherit the enclosing
     * level's `children` through scope merging: the nested field would read
     * them as the row's rows and emit phantom rules.
     *
     * @param  array<string, mixed>  $row
     */
    #[\Override]
    public function rowScope(FormData $form, array $row): FormData
    {
        $base = $form->all();
        unset($base[self::CHILDREN]);

        return FormData::make([...$base, ...$row]);
    }

    #[\Override]
    protected function rulesForRows(array $rows, FormData $data, Request $request): array
    {
        $rules = parent::rulesForRows($rows, $data, $request);

        foreach ($rows as $index => $row) {
            if (! $this->rowAcceptsChildren(is_array($row) ? $row : [])) {
                $rules["{$this->name}.{$index}.".self::CHILDREN] = ['prohibited'];
            }
        }

        return $rules;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        $props = parent::decorateProps($props);

        if (is_array($props['value'] ?? null)) {
            $props['value'] = $this->stampRowIds($props['value']);
        }

        return $props;
    }

    /**
     * @param  array<int, mixed>  $rows
     * @return array<int, mixed>
     */
    private function stampRowIds(array $rows): array
    {
        return array_map(function (mixed $row): mixed {
            if (! is_array($row)) {
                return $row;
            }

            $row = [self::ROW_ID => self::rowIdOf($row), ...$row];

            if (is_array($row[self::CHILDREN] ?? null)) {
                $row[self::CHILDREN] = $this->stampRowIds(array_values($row[self::CHILDREN]));
            }

            return $row;
        }, array_values($rows));
    }
}
