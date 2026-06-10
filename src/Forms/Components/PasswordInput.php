<?php

namespace Lattice\Lattice\Forms\Components;

use Lattice\Lattice\Core\Concerns\HasAutoComplete;
use Lattice\Lattice\Core\Concerns\HasAutoFocus;
use Lattice\Lattice\Core\Concerns\HasPlaceholder;
use Lattice\Lattice\Core\Concerns\HasTabIndex;

class PasswordInput extends Field
{
    use HasAutoComplete;
    use HasAutoFocus;
    use HasPlaceholder;
    use HasTabIndex;

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
            'name' => $this->name.'_confirmation',
            'placeholder' => $placeholder ?? $label ?? 'Confirm password',
        ]);
    }

    protected function type(): string
    {
        return 'form.password-input';
    }
}
