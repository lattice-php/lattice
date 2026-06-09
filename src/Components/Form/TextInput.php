<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Forms\FormData;
use Illuminate\Http\Request;

class TextInput extends Field
{
    protected bool $strictEmail = false;

    public function email(): static
    {
        $this->strictEmail = true;

        return $this->prop('type', 'email');
    }

    /**
     * @return array<int, mixed>
     */
    public function resolveRules(FormData $data, Request $request): array
    {
        $rules = parent::resolveRules($data, $request);

        if (! $this->strictEmail) {
            return $rules;
        }

        $rules = array_values(array_filter(
            $rules,
            static fn (mixed $rule): bool => ! (is_string($rule) && str_starts_with($rule, 'email')),
        ));

        $rules[] = 'email:rfc,filter';

        return $rules;
    }

    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }

    public function autoFocus(bool $autoFocus = true): static
    {
        return $this->prop('autoFocus', $autoFocus);
    }

    public function autoComplete(string $autoComplete): static
    {
        return $this->prop('autoComplete', $autoComplete);
    }

    public function tabIndex(int $tabIndex): static
    {
        return $this->prop('tabIndex', $tabIndex);
    }

    protected function type(): string
    {
        return 'form.text-input';
    }
}
