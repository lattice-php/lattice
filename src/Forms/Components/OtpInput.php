<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;

#[AsField(FieldType::Otp)]
class OtpInput extends Field
{
    use HasAutoFocus;

    public int $length = 6;

    public function length(int $length): static
    {
        $this->length = $length;

        return $this;
    }
}
