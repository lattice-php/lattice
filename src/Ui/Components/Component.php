<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use JsonSerializable;
use Lattice\Lattice\Attributes\WireEnvelope;
use Lattice\Lattice\Ui\Components\Concerns\HasDataBindings;
use Lattice\Lattice\Ui\Components\Concerns\SerializesWireNode;
use Lattice\Lattice\Ui\Concerns\GatesRendering;
use Lattice\Lattice\Ui\Contracts\Renderable;

/**
 * @phpstan-consistent-constructor
 */
#[WireEnvelope('Node')]
abstract class Component implements JsonSerializable, Renderable
{
    use GatesRendering;
    use HasDataBindings;
    use SerializesWireNode;

    protected bool $hideWhenCollapsed = false;

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

        return $props;
    }
}
