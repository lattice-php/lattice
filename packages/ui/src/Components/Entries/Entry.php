<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Entries;

use Closure;
use Lattice\Core\Attributes\SerializationHook;
use Lattice\Core\Support\Evaluation\Evaluator;
use Lattice\Ui\Components\ContainerComponent;
use Lattice\Ui\Components\DescriptionList;
use Lattice\Ui\Concerns\HasLabel;
use Lattice\Ui\Contracts\SchemaEntry;

/**
 * One label/value pair in a {@see DescriptionList}. The
 * value is either given outright with {@see value()} or read from the list's
 * record by {@see name}; a Closure resolves against the render context.
 */
abstract class Entry extends ContainerComponent
{
    use HasLabel;

    public string $name = '';

    public mixed $value = null;

    public ?string $description = null;

    private ?Closure $valueResolver = null;

    private bool $hasExplicitValue = false;

    public static function make(string $name, ?string $label = null, ?string $key = null): static
    {
        $entry = new static($key);
        $entry->name = $name;
        $entry->label = $label ?? str($name)->headline()->toString();
        $entry->dataKey('value', $name);

        return $entry;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function value(mixed $value): static
    {
        $this->hasExplicitValue = true;
        $this->forgetDataBinding('value');

        if ($value instanceof Closure) {
            $this->valueResolver = $value;

            return $this;
        }

        $this->value = $value;

        return $this;
    }

    public function description(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Content revealed when the row is expanded. An entry that has any turns
     * its row into a disclosure trigger.
     *
     * @param  array<int, SchemaEntry>  $components
     */
    public function disclosure(array $components): static
    {
        return $this->schema($components);
    }

    public function hasDisclosure(): bool
    {
        return $this->resolvedChildren() !== [];
    }

    /**
     * Take the value from the list's record unless the caller set one. Called
     * by the owning list before entries serialize.
     *
     * @internal
     */
    public function hydrateFromRecord(mixed $record): void
    {
        if ($this->hasExplicitValue) {
            return;
        }

        $this->value = data_get($record, $this->name);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 150)]
    protected function resolveValueClosure(array $data): array
    {
        if ($this->valueResolver instanceof Closure) {
            $this->value = app(Evaluator::class)->resolve($this->valueResolver, $this->renderContext());
        }

        return $data;
    }
}
