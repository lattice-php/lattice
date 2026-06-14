<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasOptions;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Concerns\HasTabIndex;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\Contracts\OptionSource;
use Lattice\Lattice\Forms\FormData;

#[Component('form.select')]
class Select extends Field
{
    use HasAutoFocus;
    use HasOptions;
    use HasPlaceholder;
    use HasTabIndex;

    private ?Closure $searchResolver = null;

    private ?Closure $selectedResolver = null;

    private ?OptionSource $optionSource = null;

    public bool $multiple = false;

    public bool $searchable = false;

    public string $emptyLabel = 'No options';

    public string $searchPlaceholder = 'Search…';

    public function multiple(bool $multiple = true): static
    {
        $this->multiple = $multiple;

        return $this;
    }

    public function emptyLabel(string $label): static
    {
        $this->emptyLabel = $label;

        return $this;
    }

    public function searchPlaceholder(string $placeholder): static
    {
        $this->searchPlaceholder = $placeholder;

        return $this;
    }

    /**
     * Enable server-side search. The resolver is evaluated with utility injection:
     * `$search` (the query string), plus `$state`/`$get`/`$value`/`$component` and any
     * container-resolved type (e.g. `Request`). It returns the matching options.
     */
    public function searchable(Closure $resolver): static
    {
        $this->searchResolver = $resolver;
        $this->searchable = true;

        return $this;
    }

    /**
     * Resolve options (search + selected-label) from an {@see OptionSource} — e.g.
     * an Eloquent model — instead of inline closures. The source bears any
     * persistence concern, so the Select stays storage-agnostic.
     */
    public function optionsFrom(OptionSource $source): static
    {
        $this->optionSource = $source;
        $this->searchable = true;

        return $this;
    }

    /**
     * @internal
     */
    public function isSearchable(): bool
    {
        return $this->optionSource !== null || $this->searchResolver !== null;
    }

    /**
     * Resolve the currently selected value(s) to options for display on edit forms.
     * The resolver is evaluated with utility injection: `$values` (the currently-selected
     * values, always an array so a `whereIn` query works for both single and multiple
     * selects), plus `$component` and any container-resolved type (e.g. `Request`). It
     * returns the matching options.
     */
    public function resolveSelectedUsing(Closure $resolver): static
    {
        $this->selectedResolver = $resolver;

        return $this;
    }

    /**
     * @internal
     *
     * @return list<Option>
     */
    public function resolveSearch(string $query, FormData $data, Request $request): array
    {
        if ($this->optionSource !== null) {
            return $this->normalizeOptions($this->optionSource->search($query));
        }

        if ($this->searchResolver === null) {
            return [];
        }

        $context = $this->evaluationContext($data, $request)->named('search', $query);

        return $this->normalizeOptions(Evaluate::resolve($this->searchResolver, $context));
    }

    public function prefill(mixed $value): void
    {
        if ($this->optionSource === null && $this->selectedResolver === null) {
            return;
        }

        $values = array_values(array_filter(
            array_map(static fn (mixed $item): string => (string) $item, is_array($value) ? $value : [$value]),
            static fn (string $item): bool => $item !== '',
        ));

        if ($values === []) {
            return;
        }

        $resolved = $this->optionSource !== null
            ? $this->normalizeOptions($this->optionSource->selected($values))
            : $this->normalizeOptions(Evaluate::resolve(
                $this->selectedResolver,
                Evaluate::context()->named('values', $values)->named('component', $this),
            ));
        $existing = $this->options;

        $merged = [...$existing];
        $seen = array_map(static fn (Option $option): string => $option->value, $existing);

        foreach ($resolved as $option) {
            if (! in_array($option->value, $seen, true)) {
                $merged[] = $option;
            }
        }

        $this->options = $merged;
    }

    /**
     * @param  array<int, Option|array{label: string, value: string|int}>|Collection<int, Option|array{label: string, value: string|int}>  $options
     * @return list<Option>
     */
    private function normalizeOptions(array|Collection $options): array
    {
        if ($options instanceof Collection) {
            $options = $options->all();
        }

        return array_values(array_map(
            static fn (Option|array $option): Option => $option instanceof Option
                ? $option
                : new Option((string) $option['label'], (string) $option['value']),
            $options,
        ));
    }
}
