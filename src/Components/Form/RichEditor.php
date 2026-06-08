<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Forms\RichContent;

class RichEditor extends Field
{
    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }

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
