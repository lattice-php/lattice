<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::Textarea)]
class Textarea extends Field
{
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public ?int $rows = null;

    public function rows(int $rows): static
    {
        $this->rows = $rows;

        return $this;
    }
}
