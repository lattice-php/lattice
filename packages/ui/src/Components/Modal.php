<?php
declare(strict_types=1);

namespace Lattice\Ui\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Ui\Components\Concerns\SealsReferences;
use Lattice\Ui\Enums\ModalHeight;
use Lattice\Ui\Enums\ModalWidth;
use Lattice\Ui\Enums\Side;

#[AsComponent('modal')]
class Modal extends ContainerComponent
{
    use SealsReferences;

    public ?string $title = null;

    public ?string $description = null;

    public string $closeLabel;

    public ?Side $side = null;

    public ModalWidth $width = ModalWidth::Lg;

    public ModalHeight $height = ModalHeight::Lg;

    public function __construct(?string $key = null)
    {
        parent::__construct($key);

        $this->closeLabel = __('lattice-ui::common.close');
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

    public function height(ModalHeight $height): static
    {
        $this->height = $height;

        return $this;
    }
}
