<?php
declare(strict_types=1);

namespace Lattice\Form\Components;

use Lattice\Form\Attributes\AsField;
use Lattice\Form\Enums\FieldType;
use Lattice\Ui\Concerns\HasAffixes;
use Lattice\Ui\Concerns\HasAutoComplete;
use Lattice\Ui\Concerns\HasAutoFocus;
use Lattice\Ui\Concerns\HasCopyable;
use Lattice\Ui\Concerns\HasPlaceholder;
use Lattice\Ui\Concerns\HasTabIndex;

#[AsField(FieldType::TextInput)]
class TextInput extends Field
{
    use HasAffixes;
    use HasAutoComplete;
    use HasAutoFocus;
    use HasCopyable;
    use HasPlaceholder;
    use HasTabIndex;

    public ?string $type = null;

    public function email(): static
    {
        $this->type = 'email';

        return $this->rules(['email:rfc,filter']);
    }
}
