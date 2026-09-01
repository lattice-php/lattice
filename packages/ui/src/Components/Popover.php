<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Concerns\HasLabel;
use Lattice\Ui\Enums\ContentAlign;
use Lattice\Ui\Enums\Placement;

#[AsComponent('popover')]
class Popover extends ContainerComponent
{
    use HasLabel;

    public Placement $side = Placement::Bottom;

    public ContentAlign $align = ContentAlign::Start;

    /**
     * @var array<int, Component>
     */
    public array $trigger = [];

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function side(Placement $side): static
    {
        $this->side = $side;

        return $this;
    }

    public function align(ContentAlign $align): static
    {
        $this->align = $align;

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
