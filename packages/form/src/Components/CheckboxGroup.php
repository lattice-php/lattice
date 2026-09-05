<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use InvalidArgumentException;
use Lattice\Core\Attributes\WireMap;
use Lattice\Core\Enums\Breakpoint;
use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Form\FormData;
use Lattice\Ui\Components\Grid;
use Lattice\Ui\Concerns\HasOptions;

#[AsField(FieldType::CheckboxGroup)]
class CheckboxGroup extends Field
{
    use HasOptions;

    /**
     * Breakpoint => column count, mirroring {@see Grid::columns()}.
     *
     * @var array<string, int>|null
     */
    #[WireMap]
    public ?array $columns = null;

    public bool $bulkToggleable = false;

    public bool $collapsible = false;

    public bool $collapsed = false;

    /**
     * Lay the checkboxes out in columns. A bare count applies from the `md`
     * breakpoint up (one column below); a map sets each breakpoint explicitly.
     *
     * @param  int|array<string, int>  $columns
     */
    public function columns(int|array $columns): static
    {
        if (! is_array($columns)) {
            $columns = ['md' => $columns];
        }

        foreach ($columns as $breakpoint => $count) {
            Breakpoint::validateKey($breakpoint);

            if ($count < 1) {
                throw new InvalidArgumentException(sprintf(
                    'Checkbox group columns for "%s" must be a positive integer.',
                    $breakpoint,
                ));
            }
        }

        $this->columns = $columns;

        return $this;
    }

    /**
     * Offer a select-all control for the whole field and for each group.
     */
    public function bulkToggleable(bool $bulkToggleable = true): static
    {
        $this->bulkToggleable = $bulkToggleable;

        return $this;
    }

    /**
     * Render each group as a collapsible section. Pass `collapsed: true` to
     * start every section closed. Options without a group stay above the
     * sections and are never collapsed.
     */
    public function collapsible(bool $collapsible = true, bool $collapsed = false): static
    {
        $this->collapsible = $collapsible;
        $this->collapsed = $collapsed;

        return $this;
    }

    /**
     * @return array<int, mixed>
     */
    #[\Override]
    protected function defaultRules(): array
    {
        return ['array'];
    }

    /**
     * The submitted values are constrained to the configured options, the way a
     * {@see Choice} constrains its single value.
     *
     * @return array<string, array<int, mixed>>
     */
    #[\Override]
    public function nestedRules(FormData $data, Request $request): array
    {
        if ($this->options === []) {
            return [];
        }

        return ["{$this->name()}.*" => [Rule::in($this->optionValues())]];
    }

    /**
     * Every box unchecked posts no key at all, so an absent input means "none
     * selected" rather than "field missing" — the array counterpart to what
     * {@see Checkbox} does with `false`.
     */
    #[\Override]
    public function fillsAbsentInput(): bool
    {
        return true;
    }

    /**
     * @return array<int, string>
     */
    #[\Override]
    public function absentInput(): array
    {
        return [];
    }

    #[\Override]
    public function normalizeInput(mixed $value): mixed
    {
        if ($value === null || $value === '') {
            return [];
        }

        return is_array($value) ? array_values($value) : [$value];
    }

    /**
     * @return list<string>
     */
    #[\Override]
    public function castValue(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_map(static fn (mixed $item): string => (string) $item, $value));
    }
}
