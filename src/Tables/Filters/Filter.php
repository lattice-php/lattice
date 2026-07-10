<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use JsonSerializable;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Components\Concerns\SerializesWireNode;
use Lattice\Lattice\Ui\Concerns\FiltersRenderableComponents;
use Lattice\Lattice\Ui\Concerns\GatesRendering;
use Lattice\Lattice\Ui\Concerns\HasLabel;
use Lattice\Lattice\Ui\Contracts\Renderable;

/**
 * A dedicated, table-level filter: it owns its form schema, server-side
 * validation and query logic. Empty schemas render as a simple toggle.
 *
 * @phpstan-consistent-constructor
 */
abstract class Filter implements JsonSerializable, Renderable
{
    use FiltersRenderableComponents;
    use GatesRendering;
    use HasLabel;
    use SerializesWireNode;

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

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseSchema(array $data): array
    {
        $data['schema'] = $this->renderSchema();

        return $data;
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
        $schema = $this->schema();

        if ($schema === []) {
            return [new FilterIndicator($this->key, $this->label, '')];
        }

        $indicators = [];

        foreach ($schema as $field) {
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

    /**
     * Whether a value counts as an active constraint — null, empty strings and
     * arrays of only inactive values do not.
     */
    public static function hasActiveValue(mixed $value): bool
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
