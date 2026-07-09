<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Lattice\Lattice\Forms\Components\Concerns\HandlesRowSchemas;
use Lattice\Lattice\Forms\Contracts\ProvidesRowFields;
use Lattice\Lattice\Forms\Contracts\ProvidesRowPrefills;
use Lattice\Lattice\Forms\FormData;

/**
 * Base for fields whose value is an ordered list of rows, each validated,
 * cast, and prefilled through the child Fields supplied by rowFields().
 *
 * Every row carries a stable UUID under the reserved `rowId` key: server-filled
 * rows are stamped during serialization, the client mints one for rows it
 * creates, and casting preserves (or mints) it so validated data always
 * identifies each row. Row schemas must not declare their own `rowId` field.
 *
 * @api Stable extension point for custom row fields; the per-row validation,
 *      casting, and prefill wiring live here so subclasses only describe
 *      which fields make up a row.
 */
abstract class RowsField extends Field implements ProvidesRowFields, ProvidesRowPrefills
{
    use HandlesRowSchemas;

    public const string ROW_ID = 'rowId';

    public ?int $minItems = null;

    public ?int $maxItems = null;

    public bool $reorderable = true;

    public ?string $addLabel = null;

    public int $defaultItems = 0;

    public function minItems(int $min): static
    {
        $this->minItems = $min;

        return $this;
    }

    public function maxItems(int $max): static
    {
        $this->maxItems = $max;

        return $this;
    }

    public function reorderable(bool $reorderable = true): static
    {
        $this->reorderable = $reorderable;

        return $this;
    }

    public function addLabel(string $label): static
    {
        $this->addLabel = $label;

        return $this;
    }

    public function defaultItems(int $count): static
    {
        $this->defaultItems = $count;

        return $this;
    }

    /**
     * The rows value is always an array; array-level rules live here so they
     * are not clobbered by the nested per-row rules (which use per-index keys).
     *
     * @return array<int, mixed>
     */
    #[\Override]
    public function resolveRules(FormData $data, Request $request): array
    {
        $rules = ['array'];

        if ($this->minItems !== null) {
            $rules[] = "min:{$this->minItems}";
        }

        if ($this->maxItems !== null) {
            $rules[] = "max:{$this->maxItems}";
        }

        return $rules;
    }

    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        $rows = $this->rows($data);
        $rules = $this->rowRules($this->name, $rows, $data, $request);

        foreach (array_keys($rows) as $index) {
            $rules["{$this->name}.{$index}.".self::ROW_ID] = ['sometimes', 'nullable', 'uuid'];
        }

        return $rules;
    }

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_array($value)) {
            return [];
        }

        return array_map(
            static fn (array $castRow, mixed $original): array => [
                self::ROW_ID => self::rowIdOf($original),
                ...$castRow,
            ],
            $this->castRows($value),
            array_values($value),
        );
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
            $props['value'] = array_map(
                static fn (mixed $row): mixed => is_array($row)
                    ? [self::ROW_ID => self::rowIdOf($row), ...$row]
                    : $row,
                array_values($props['value']),
            );
        }

        return $props;
    }

    /**
     * The row's uuid when it already carries a valid one, a fresh uuid otherwise.
     */
    protected static function rowIdOf(mixed $row): string
    {
        $rowId = is_array($row) ? ($row[self::ROW_ID] ?? null) : null;

        return is_string($rowId) && Str::isUuid($rowId) ? $rowId : Str::uuid()->toString();
    }

    /**
     * @return array<int, mixed>
     */
    protected function rows(FormData $data): array
    {
        $rows = $data->get($this->name);

        return is_array($rows) ? $rows : [];
    }
}
