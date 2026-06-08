<?php

namespace Bambamboole\Lattice\Components\Form;

use Bambamboole\Lattice\Components\Core\Component;

class PasswordInput extends Component
{
    public static function make(string $name, string $label): static
    {
        return (new static)->props([
            'label' => $label,
            'name' => $name,
        ]);
    }

    public function placeholder(string $placeholder): static
    {
        return $this->prop('placeholder', $placeholder);
    }

    public function required(bool $required = true): static
    {
        return $this->prop('required', $required);
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

    public function labelAction(string $label, string $href, ?int $tabIndex = null): static
    {
        return $this->prop('labelAction', array_filter([
            'href' => $href,
            'label' => $label,
            'tabIndex' => $tabIndex,
        ], fn (mixed $value): bool => $value !== null));
    }

    public function passwordRules(string $passwordRules): static
    {
        return $this->prop('passwordRules', $passwordRules);
    }

    public function needsConfirmation(?string $label = null, ?string $placeholder = null): static
    {
        return $this->prop('confirmation', [
            'label' => $label ?? 'Confirm password',
            'name' => $this->props['name'].'_confirmation',
            'placeholder' => $placeholder ?? $label ?? 'Confirm password',
        ]);
    }

    protected function type(): string
    {
        return 'form.password-input';
    }
}
