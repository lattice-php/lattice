<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

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
