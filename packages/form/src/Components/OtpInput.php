<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAutoFocus;

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
