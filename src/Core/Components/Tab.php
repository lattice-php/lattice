<?php

namespace Lattice\Lattice\Core\Components;

use Lattice\Lattice\Attributes;

#[Attributes\Component('tab', container: true)]
class Tab extends ContainerComponent
{
    public string $label = '';

    public string $value = '';

    /**
     * @var array{required: bool, redirectUrl: string, timeout?: int}|null
     */
    public ?array $confirm = null;

    public static function make(string $value, string $label, ?string $key = null): static
    {
        $tab = new static($key);
        $tab->label = $label;
        $tab->value = $value;

        return $tab;
    }

    public function confirm(?string $redirectUrl = null, ?int $timeout = null): static
    {
        $confirm = [
            'required' => true,
            'redirectUrl' => $redirectUrl ?? '/user/confirm-password',
        ];

        if ($timeout !== null) {
            $confirm['timeout'] = $timeout;
        }

        $this->confirm = $confirm;

        return $this;
    }

    public function value(): string
    {
        return $this->value;
    }

    public function requiresConfirmation(): bool
    {
        return is_array($this->confirm) && $this->confirm['required'] === true;
    }

    public function confirmationRedirectUrl(): string
    {
        $redirectUrl = $this->confirm['redirectUrl'] ?? null;

        return is_string($redirectUrl) && $redirectUrl !== '' ? $redirectUrl : '/user/confirm-password';
    }

    public function confirmationTimeout(): ?int
    {
        $timeout = $this->confirm['timeout'] ?? null;

        return is_int($timeout) ? $timeout : null;
    }

    public function withoutHiddenChildren(string $activeValue): static
    {
        if ($this->requiresConfirmation() && $this->value() !== $activeValue) {
            return (clone $this)->schema([]);
        }

        return $this;
    }
}
