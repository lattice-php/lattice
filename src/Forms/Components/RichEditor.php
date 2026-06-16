<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Forms\RichContent;

#[Component('form.rich-editor')]
class RichEditor extends Field
{
    use HasPlaceholder;

    #[\Override]
    public function castValue(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        $decoded = json_decode($value, true);

        if (! is_array($decoded)) {
            return $value;
        }

        return RichContent::make($decoded)->toArray();
    }
}
