<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Concerns\FiltersRenderableComponents;

#[AsComponent('tooltip')]
class Tooltip extends Component
{
    use FiltersRenderableComponents;

    public ?string $content = null;

    /**
     * @var array<int, Component>
     */
    public array $trigger = [];

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function content(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    /**
     * @param  array<int, Component>  $components
     */
    public function trigger(array $components): static
    {
        $this->trigger = $components;

        return $this;
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
            'trigger' => $this->renderableComponents($this->trigger),
        ];
    }
}
