<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use JsonSerializable;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Concerns\SerializesToWire;
use Lattice\Lattice\Tables\Enums\FilterControl;

/**
 * A dedicated, table-level filter — named, not bound to a column, owning its own
 * control and query logic. The Tables-side analogue of a form field: the wire
 * descriptor ({@see toData}) renders a control, and {@see apply} constrains the
 * query from the value the client posts back.
 *
 * @phpstan-consistent-constructor
 */
abstract class BaseFilter implements JsonSerializable
{
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

    public function toData(): FilterData
    {
        return new FilterData(
            $this->key,
            $this->label,
            $this->wireControl(),
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
    abstract public function apply(Builder $builder, mixed $value): void;

    /**
     * Whether a posted value is well-formed for this filter. Rejected values are
     * dropped during request parsing rather than applied.
     */
    public function accepts(mixed $value): bool
    {
        return true;
    }

    protected function column(): string
    {
        return $this->attribute ?? $this->key;
    }

    public function jsonSerialize(): FilterData
    {
        return $this->toData();
    }
}
