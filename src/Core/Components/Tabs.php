<?php

namespace Lattice\Lattice\Core\Components;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Date;
use Lattice\Lattice\Attributes\SerializationHook;

class Tabs extends ContainerComponent
{
    public static function make(?string $key = null): static
    {
        return (new static($key))->queryKey('tabs');
    }

    public function defaultValue(string $value): static
    {
        return $this->prop('defaultValue', $value);
    }

    public function queryKey(string $key): static
    {
        return $this->prop('queryKey', $key);
    }

    protected function type(): string
    {
        return 'tabs';
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 200)]
    protected function serialiseProps(array $data): array
    {
        $activeValue = $this->activeValue();

        $this->ensureActiveTabIsConfirmed($activeValue);

        return [
            ...$data,
            'props' => [
                ...$this->props,
                'activeValue' => $activeValue,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    protected function serialiseSchema(array $data): array
    {
        $props = $data['props'] ?? [];
        $activeValue = is_array($props) && is_string($props['activeValue'] ?? null)
            ? $props['activeValue']
            : $this->activeValue();

        return [
            ...$data,
            'schema' => array_map(
                fn (Component $child): array => $child instanceof Tab
                    ? $child->toArrayForTabs($activeValue)
                    : $child->toArray(),
                $this->renderableChildren(),
            ),
        ];
    }

    private function activeValue(): string
    {
        $values = $this->tabValues();
        $queryValue = request()->query($this->queryKeyName());

        if (is_string($queryValue) && in_array($queryValue, $values, true)) {
            return $queryValue;
        }

        $pathValue = request()->segment(count(request()->segments()));

        if (is_string($pathValue) && in_array($pathValue, $values, true)) {
            return $pathValue;
        }

        $defaultValue = $this->props['defaultValue'] ?? null;

        if (is_string($defaultValue) && in_array($defaultValue, $values, true)) {
            return $defaultValue;
        }

        return $values[0] ?? '';
    }

    private function queryKeyName(): string
    {
        $queryKey = $this->props['queryKey'] ?? 'tabs';

        return is_string($queryKey) && $queryKey !== '' ? $queryKey : 'tabs';
    }

    /**
     * @return array<int, string>
     */
    private function tabValues(): array
    {
        return array_values(array_filter(
            array_map(
                fn (Component $child): string => $child instanceof Tab ? $child->value() : '',
                $this->renderableChildren(),
            ),
            fn (string $value): bool => $value !== '',
        ));
    }

    private function ensureActiveTabIsConfirmed(string $activeValue): void
    {
        $tab = $this->activeTab($activeValue);

        if (! $tab?->requiresConfirmation() || $this->passwordIsConfirmed($tab)) {
            return;
        }

        throw new HttpResponseException(response()->redirectGuest($tab->confirmationRedirectUrl()));
    }

    private function activeTab(string $activeValue): ?Tab
    {
        foreach ($this->renderableChildren() as $child) {
            if ($child instanceof Tab && $child->value() === $activeValue) {
                return $child;
            }
        }

        return null;
    }

    private function passwordIsConfirmed(Tab $tab): bool
    {
        $confirmedAt = (int) request()->session()->get('auth.password_confirmed_at', 0);
        $timeout = $tab->confirmationTimeout() ?? (int) config('auth.password_timeout', 10800);

        return Date::now()->unix() - $confirmedAt <= $timeout;
    }
}
