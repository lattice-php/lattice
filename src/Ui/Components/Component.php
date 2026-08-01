<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use InvalidArgumentException;
use JsonSerializable;
use Lattice\Lattice\Attributes\WireEnvelope;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Components\Concerns\HasDataBindings;
use Lattice\Lattice\Ui\Components\Concerns\SerializesWireNode;
use Lattice\Lattice\Ui\Concerns\GatesRendering;
use Lattice\Lattice\Ui\Contracts\Renderable;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;
use Lattice\Lattice\Ui\Enums\Breakpoint;

/**
 * @phpstan-consistent-constructor
 */
#[WireEnvelope('Node')]
abstract class Component implements JsonSerializable, Renderable, SchemaEntry
{
    use GatesRendering;
    use HasDataBindings;
    use SerializesWireNode;

    protected bool $hideWhenCollapsed = false;

    /**
     * Breakpoint => span toward the nearest Grid ancestor.
     *
     * @var array<string, int|string>|null
     */
    protected ?array $columnSpan = null;

    public function __construct(protected ?string $key = null) {}

    /**
     * The render/reconciliation hint. Distinct from Column/Filter's `key(): string`
     * getter, which is data identity — a different concept entirely, not unified
     * here on purpose.
     */
    public function key(string $key): static
    {
        $this->key = $key;

        return $this;
    }

    public function hideWhenCollapsed(bool $hide = true): static
    {
        $this->hideWhenCollapsed = $hide;

        return $this;
    }

    /**
     * A bare integer applies from the `md` breakpoint up; `'full'` spans the
     * whole row at every breakpoint; a map sets each breakpoint explicitly.
     *
     * @param  int|string|array<string, int|string>  $span
     */
    public function columnSpan(int|string|array $span): static
    {
        if (! is_array($span)) {
            $span = $span === 'full' ? ['default' => 'full'] : ['md' => $span];
        }

        foreach ($span as $breakpoint => $value) {
            Breakpoint::validateKey($breakpoint);

            if ((! is_int($value) || $value < 1) && $value !== 'full') {
                throw new InvalidArgumentException(sprintf(
                    'Column span for "%s" must be a positive integer or "full".',
                    $breakpoint,
                ));
            }
        }

        $this->columnSpan = $span;

        return $this;
    }

    public function columnSpanFull(): static
    {
        return $this->columnSpan('full');
    }

    /**
     * @return array<int, Component>
     */
    final public function resolveComponents(): array
    {
        return [$this];
    }

    /**
     * All row keys this component subtree binds to: its own data bindings plus,
     * for a container, every descendant's.
     *
     * @return array<int, string>
     */
    public function boundRowKeys(): array
    {
        $keys = $this->dataBindingKeys();

        if ($this instanceof ContainerComponent) {
            foreach ($this->descendants() as $descendant) {
                array_push($keys, ...$descendant->dataBindingKeys());
            }
        }

        return array_values(array_unique($keys));
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        $props = $this->decorateDataBindings($props);

        if ($this->hideWhenCollapsed) {
            $props['hideWhenCollapsed'] = true;
        }

        if ($this->columnSpan !== null) {
            $props['columnSpan'] = Wire::map($this->columnSpan);
        }

        return $props;
    }
}
