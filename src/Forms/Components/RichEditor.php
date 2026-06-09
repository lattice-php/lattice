<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasPlaceholder;
use Bambamboole\Lattice\Forms\RichContent;

class RichEditor extends Field
{
    use HasPlaceholder;

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

    protected function type(): string
    {
        return 'form.rich-editor';
    }
}
