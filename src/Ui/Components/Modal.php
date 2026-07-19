<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Ui\Enums\ModalWidth;
use Lattice\Lattice\Ui\Enums\Side;

#[AsComponent('modal')]
class Modal extends ContainerComponent
{
    use IsInteractive;

    public ?string $title = null;

    public ?string $description = null;

    public string $closeLabel;

    public bool $open = false;

    public ?Side $side = null;

    public ModalWidth $width = ModalWidth::Lg;

    public function __construct(?string $key = null)
    {
        parent::__construct($key);

        $this->closeLabel = __('lattice::common.close');
    }

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    public function title(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function description(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function closeLabel(string $label): static
    {
        $this->closeLabel = $label;

        return $this;
    }

    public function open(bool $open = true): static
    {
        $this->open = $open;

        return $this;
    }

    /**
     * Present the dialog as a full-height sheet docked to a viewport edge.
     */
    public function slideOut(Side $side = Side::End): static
    {
        $this->side = $side;

        return $this;
    }

    public function width(ModalWidth $width): static
    {
        $this->width = $width;

        return $this;
    }
}
