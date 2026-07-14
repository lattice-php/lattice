<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Facades\Evaluate;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasOptions;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Select)]
class Select extends Field
{
    use FiltersRenderableComponents;
    use HasAutoFocus;
    use HasOptions;
    use HasPlaceholder;
    use HasTabIndex;

    private ?Closure $searchResolver = null;

    private ?Closure $selectedResolver = null;

    private ?OptionSource $optionSource = null;

    /**
     * @var array<int, Component>
     */
    protected array $optionSchema = [];

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
     * Render each option through a schema of bound components instead of the
     * plain label. Components bind option fields with `->dataKey($prop, $key)`;
     * bindings resolve against the option's `data` record plus its `label` and
     * `value`. The schema ships once on the wire — options only carry data.
     *
     * @param  array<int, Component>  $components
     */
    public function optionSchema(array $components): static
    {
        $this->optionSchema = $components;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseOptionSchema(array $data): array
    {
        if ($this->optionSchema === []) {
            return $data;
        }

        $data['props']['optionSchema'] = $this->renderableComponents($this->optionSchema);

        return $data;
    }

    /**
     * @internal
     */
    public function isSearchable(): bool
    {
        return $this->optionSource instanceof OptionSource || $this->searchResolver instanceof Closure;
    }

    /**
     * Resolve the currently selected value(s) to options for display on edit forms.
     * The resolver is evaluated with utility injection: `$values` (the currently-selected
     * values, always an array so a `whereIn` query works for both single and multiple
     * selects), plus `$component` and any container-resolved type (e.g. `Request`). When
     * hydrated from a bound form (the normal `hydrateState` path), the full field surface
     * is also available: `$state`, `$get`, `$value`, and typed `FormData`/`Request`. Direct
     * calls to `hydrateState()` without a form/request (e.g. in isolation) fall back to
     * `$values`/`$component` only.
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
        if ($this->optionSource instanceof OptionSource) {
            return $this->normalizeOptions($this->optionSource->search($query));
        }

        if (! $this->searchResolver instanceof Closure) {
            return [];
        }

        $context = $this->evaluationContext($data, $request)->named('search', $query);

        return $this->normalizeOptions(Evaluate::resolve($this->searchResolver, $context));
    }

    #[\Override]
    public function hydrateState(mixed $value, ?FormData $form = null, ?Request $request = null): void
    {
        if (! $this->optionSource instanceof OptionSource && ! $this->selectedResolver instanceof Closure) {
            return;
        }

        $values = array_values(array_filter(
            array_map(static fn (mixed $item): string => (string) $item, is_array($value) ? $value : [$value]),
            static fn (string $item): bool => $item !== '',
        ));

        if ($values === []) {
            return;
        }

        $context = ($form instanceof FormData && $request instanceof Request)
            ? $this->evaluationContext($form, $request)
            : Evaluate::context()->named('component', $this);

        $resolved = $this->optionSource instanceof OptionSource
            ? $this->normalizeOptions($this->optionSource->selected($values))
            : $this->normalizeOptions(Evaluate::resolve(
                $this->selectedResolver,
                $context->named('values', $values),
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
     * @param  array<int, Option|array{label: string, value: string|int, data?: array<string, mixed>|null}>|Collection<int, Option|array{label: string, value: string|int, data?: array<string, mixed>|null}>  $options
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
                : new Option((string) $option['label'], (string) $option['value'], $option['data'] ?? null),
            $options,
        ));
    }
}
