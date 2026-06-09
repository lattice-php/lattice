<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Forms\FormData;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class Select extends Field
{
    private ?Closure $searchResolver = null;

    /**
     * @return array{label: string, value: string}
     */
    public static function option(string $label, string $value): array
    {
        return [
            'label' => $label,
            'value' => $value,
        ];
    }

    /**
     * @param  array<int, array{label: string, value: string}>  $options
     */
    public function options(array $options): static
    {
        return $this->prop('options', $options);
    }

    public function multiple(bool $multiple = true): static
    {
        return $this->prop('multiple', $multiple);
    }

    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
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
     * @return array<int, array{label: string, value: string}>
     */
    public function resolveSearch(string $query, FormData $data, Request $request): array
    {
        if ($this->searchResolver === null) {
            return [];
        }

        $options = ($this->searchResolver)($query, $data, $request);

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
