<?php

namespace Bambamboole\Lattice\Forms\Components;

use Bambamboole\Lattice\Core\Concerns\HasAutoComplete;
use Bambamboole\Lattice\Core\Concerns\HasAutoFocus;
use Bambamboole\Lattice\Core\Concerns\HasPlaceholder;
use Bambamboole\Lattice\Core\Concerns\HasTabIndex;

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
            'name' => $this->props['name'].'_confirmation',
            'placeholder' => $placeholder ?? $label ?? 'Confirm password',
        ]);
    }

    protected function type(): string
    {
        return 'form.password-input';
    }
}
