<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Components;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Date;
use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Attributes\SerializationHook;
use Lattice\Lattice\Ui\Enums\Orientation;
use Lattice\Lattice\Ui\Enums\TabsAlignment;

#[AsComponent('tabs')]
class Tabs extends ContainerComponent
{
    public ?string $defaultValue = null;

    public string $queryKey = 'tabs';

    public Orientation $orientation = Orientation::Horizontal;

    public TabsAlignment $alignment = TabsAlignment::Stretch;

    public string $activeValue;

    public static function make(?string $key = null): static
    {
        return new static($key);
    }

    public function defaultValue(string $value): static
    {
        $this->defaultValue = $value;

        return $this;
    }

    public function queryKey(string $key): static
    {
        $this->queryKey = $key;

        return $this;
    }

    public function orientation(Orientation $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }

    public function alignment(TabsAlignment $alignment): static
    {
        $this->alignment = $alignment;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 190)]
    protected function projectActiveValue(array $data): array
    {
        $this->activeValue = $this->resolveActiveValue();

        $this->ensureActiveTabIsConfirmed($this->activeValue);

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 300)]
    #[\Override]
    protected function serialiseSchema(array $data): array
    {
        return [
            ...$data,
            'schema' => array_map(
                fn (Component $child): Component => $child instanceof Tab
                    ? $child->withoutHiddenChildren($this->activeValue)
                    : $child,
                $this->renderableChildren(),
            ),
        ];
    }

    private function resolveActiveValue(): string
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

        if ($this->defaultValue !== null && in_array($this->defaultValue, $values, true)) {
            return $this->defaultValue;
        }

        return $values[0] ?? '';
    }

    private function queryKeyName(): string
    {
        return $this->queryKey !== '' ? $this->queryKey : 'tabs';
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
