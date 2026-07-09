<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use JsonSerializable;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Concerns\SerializesToWire;
use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A dedicated, table-level filter: it owns its form schema, server-side
 * validation and query logic. Empty schemas render as a simple toggle.
 *
 * @phpstan-consistent-constructor
 */
abstract class Filter implements JsonSerializable
{
    use FiltersRenderableComponents;
    use SerializesToWire;

    protected string $label;

    protected ?string $attribute = null;

    public function __construct(protected readonly string $key)
    {
        $this->label = str($key)->headline()->toString();
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function key(): string
    {
        return $this->key;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    /**
     * Override the database column this filter constrains; defaults to the key.
     */
    public function attribute(string $attribute): static
    {
        $this->attribute = $attribute;

        return $this;
    }

    /**
     * @return array<int, Field>
     */
    public function schema(): array
    {
        return [];
    }

    public function toData(): FilterData
    {
        return new FilterData(
            $this->key,
            $this->label,
            $this->wireControl(),
            $this->renderSchema(),
            $this->decorateProps($this->wireProps()),
        );
    }

    private function wireControl(): FilterControl|string
    {
        $control = AsComponent::typeForClass(static::class);

        return FilterControl::tryFrom($control) ?? $control;
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $builder
     */
    abstract public function apply(Builder $builder, FormData $data): void;

    /**
     * @return string|list<string|FilterIndicator|array{label?: string, value: mixed}>|array<string, mixed>|null
     */
    public function indicator(FormData $data): string|array|null
    {
        return null;
    }

    /**
     * @return list<FilterIndicator>
     */
    public function indicators(FormData $data): array
    {
        $indicator = $this->indicator($data);

        return $indicator === null
            ? $this->defaultIndicators($data)
            : $this->normalizeIndicators($indicator);
    }

    protected function column(): string
    {
        return $this->attribute ?? $this->key;
    }

    public function jsonSerialize(): FilterData
    {
        return $this->toData();
    }

    /**
     * @return list<Field>
     */
    private function renderSchema(): array
    {
        return $this->renderableComponents($this->schema());
    }

    /**
     * @return list<FilterIndicator>
     */
    protected function defaultIndicators(FormData $data): array
    {
        if ($this->schema() === []) {
            return [new FilterIndicator($this->key, $this->label, '')];
        }

        $indicators = [];

        foreach ($this->schema() as $field) {
            $value = $data->get($field->name());

            if (! self::hasActiveValue($value)) {
                continue;
            }

            $indicators[] = new FilterIndicator(
                $this->key,
                $field->getLabel() ?? $this->label,
                $this->stringifyValue($value),
            );
        }

        return $indicators;
    }

    protected static function hasActiveValue(mixed $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        if (is_array($value)) {
            return array_any($value, self::hasActiveValue(...));
        }

        return true;
    }

    protected function stringifyValue(mixed $value): string
    {
        if (is_array($value)) {
            return implode(', ', array_map($this->stringifyValue(...), array_filter($value, self::hasActiveValue(...))));
        }

        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }

        return (string) $value;
    }

    /**
     * @param  string|list<string|FilterIndicator|array{label?: string, value: mixed}>|array<string, mixed>  $indicator
     * @return list<FilterIndicator>
     */
    private function normalizeIndicators(string|array $indicator): array
    {
        if (is_string($indicator)) {
            return [new FilterIndicator($this->key, $this->label, $indicator)];
        }

        if (array_is_list($indicator)) {
            return array_values(array_filter(array_map(
                $this->normalizeIndicatorItem(...),
                $indicator,
            )));
        }

        return array_values(array_filter(array_map(
            fn (mixed $value, string|int $label): ?FilterIndicator => $this->normalizeIndicatorItem([
                'label' => (string) $label,
                'value' => $value,
            ]),
            $indicator,
            array_keys($indicator),
        )));
    }

    private function normalizeIndicatorItem(mixed $item): ?FilterIndicator
    {
        if ($item instanceof FilterIndicator) {
            return $item;
        }

        if (is_string($item)) {
            return new FilterIndicator($this->key, $this->label, $item);
        }

        if (is_array($item) && array_key_exists('value', $item)) {
            return new FilterIndicator(
                $this->key,
                is_string($item['label'] ?? null) ? $item['label'] : $this->label,
                $this->stringifyValue($item['value']),
            );
        }

        return null;
    }
}
