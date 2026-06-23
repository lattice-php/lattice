<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes\AsComponent;

#[AsComponent('collapsible')]
class Collapsible extends ContainerComponent
{
    public bool $collapsed = true;

    public bool $rememberState = false;

    /**
     * @var array<int, Component>
     */
    public array $trigger = [];

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function collapsed(bool $collapsed = true): static
    {
        $this->collapsed = $collapsed;

        return $this;
    }

    public function rememberState(bool $rememberState = true): static
    {
        $this->rememberState = $rememberState;

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
     * @param  array<int, Component>  $components
     */
    public function content(array $components): static
    {
        return $this->schema($components);
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
