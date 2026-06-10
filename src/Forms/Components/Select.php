<?php

namespace Lattice\Lattice\Forms\Components;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Lattice\Lattice\Core\Concerns\HasOptions;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Forms\FormData;

class Select extends Field
{
    use HasOptions;
    use HasPlaceholder;

    private ?Closure $searchResolver = null;

    private ?Closure $selectedResolver = null;

    public function multiple(bool $multiple = true): static
    {
        return $this->prop('multiple', $multiple);
    }

    /**
     * Enable server-side search. The resolver receives the query string (and the
     * current form data and request) and returns the matching options. The option
     * value is the entity identifier and is fully controlled by the resolver.
     *
     * @param  Closure(string, FormData, Request): (array<int, array{label: string, value: string|int}>|Collection<int, array{label: string, value: string|int}>)  $resolver
     */
    public function searchable(Closure $resolver): static
    {
        $this->searchResolver = $resolver;

        return $this->prop('searchable', true);
    }

    public function isSearchable(): bool
    {
        return $this->searchResolver !== null;
    }

    /**
     * Resolve the currently selected value(s) to options for display on edit forms.
     * The resolver always receives an array of values (one entry for a single select),
     * so a `whereIn` query works for both single and multiple selects.
     *
     * @param  Closure(array<int, string>): (array<int, array{label: string, value: string|int}>|Collection<int, array{label: string, value: string|int}>)  $resolver
     */
    public function resolveSelectedUsing(Closure $resolver): static
    {
        $this->selectedResolver = $resolver;

        return $this;
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    public function resolveSearch(string $query, FormData $data, Request $request): array
    {
        if ($this->searchResolver === null) {
            return [];
        }

        return $this->normalizeOptions(($this->searchResolver)($query, $data, $request));
    }

    public function prefill(mixed $value): void
    {
        if ($this->selectedResolver === null) {
            return;
        }

        $values = array_values(array_filter(
            array_map(static fn (mixed $item): string => (string) $item, is_array($value) ? $value : [$value]),
            static fn (string $item): bool => $item !== '',
        ));

        if ($values === []) {
            return;
        }

        $resolved = $this->normalizeOptions(($this->selectedResolver)($values));
        $existing = is_array($this->props['options'] ?? null) ? $this->props['options'] : [];

        $merged = [...$existing];
        $seen = array_column($existing, 'value');

        foreach ($resolved as $option) {
            if (! in_array($option['value'], $seen, true)) {
                $merged[] = $option;
            }
        }

        $this->prop('options', $merged);
    }

    /**
     * @param  array<int, array{label: string, value: string|int}>|Collection<int, array{label: string, value: string|int}>  $options
     * @return array<int, array{label: string, value: string}>
     */
    private function normalizeOptions(array|Collection $options): array
    {
        if ($options instanceof Collection) {
            $options = $options->all();
        }

        return array_values(array_map(
            static fn (array $option): array => [
                'label' => (string) $option['label'],
                'value' => (string) $option['value'],
            ],
            $options,
        ));
    }

    protected function type(): string
    {
        return 'form.select';
    }
}
