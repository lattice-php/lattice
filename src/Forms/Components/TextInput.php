<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Lattice\Lattice\Ui\Concerns\HasAffixes;
use Lattice\Lattice\Ui\Concerns\HasAutoComplete;
use Lattice\Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::TextInput)]
class TextInput extends Field
{
    use HasAffixes;
    use HasAutoComplete;
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

    public ?string $type = null;

    public function email(): static
    {
        $this->type = 'email';

        return $this->rules(['email:rfc,filter']);
    }
}
