<?php

namespace Lattice\Lattice\Core\Components;

class Tab extends ContainerComponent
{
    public static function make(string $value, string $label, ?string $key = null): static
    {
        return (new static($key))->props([
            'label' => $label,
            'value' => $value,
        ]);
    }

    public function confirm(?string $redirectUrl = null, ?int $timeout = null): static
    {
        return $this->prop('confirm', array_filter([
            'required' => true,
            'redirectUrl' => $redirectUrl ?? '/user/confirm-password',
            'timeout' => $timeout,
        ], fn (mixed $value): bool => $value !== null));
    }

    public function value(): string
    {
        return (string) ($this->props['value'] ?? '');
    }

    public function requiresConfirmation(): bool
    {
        $confirm = $this->props['confirm'] ?? null;

        return is_array($confirm) && ($confirm['required'] ?? false) === true;
    }

    public function confirmationRedirectUrl(): string
    {
        $confirm = $this->props['confirm'] ?? null;
        $redirectUrl = is_array($confirm) ? ($confirm['redirectUrl'] ?? null) : null;

        return is_string($redirectUrl) && $redirectUrl !== '' ? $redirectUrl : '/user/confirm-password';
    }

    public function confirmationTimeout(): ?int
    {
        $confirm = $this->props['confirm'] ?? null;
        $timeout = is_array($confirm) ? ($confirm['timeout'] ?? null) : null;

        return is_int($timeout) ? $timeout : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArrayForTabs(string $activeValue): array
    {
        $data = $this->toArray();

        if ($this->requiresConfirmation() && $this->value() !== $activeValue) {
            unset($data['children']);
        }

        return $data;
    }

    protected function type(): string
    {
        return 'tab';
    }
}
