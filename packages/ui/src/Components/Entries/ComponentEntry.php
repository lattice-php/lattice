<?php
declare(strict_types=1);

namespace Lattice\Ui\Components\Entries;

use Lattice\Ui\Attributes\AsEntry;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Enums\EntryType;

/**
 * An entry whose value is a component rather than a formatted scalar — a stack
 * of text and an icon, a segmented control, anything the schema can express.
 */
#[AsEntry(EntryType::Component)]
class ComponentEntry extends Entry
{
    /**
     * @var array<int, Component>
     */
    protected array $components = [];

    /**
     * @param  Component|array<int, Component>  $value
     */
    #[\Override]
    public function value(mixed $value): static
    {
        $this->components = $value instanceof Component ? [$value] : array_values($value);

        return parent::value(null);
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        return [
            ...parent::decorateProps($props),
            'value' => $this->renderableComponents($this->components),
        ];
    }
}
