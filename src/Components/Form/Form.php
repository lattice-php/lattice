<?php

namespace Bambamboole\Lattice\Components\Form;

use BackedEnum;
use Bambamboole\Lattice\Attributes\SerializationHook;
use Bambamboole\Lattice\Components\Core\Component;
use Bambamboole\Lattice\Components\Core\ContainerComponent;
use Bambamboole\Lattice\Components\Core\IsInteractive;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Forms\FormRegistry;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;

class Form extends ContainerComponent
{
    use IsInteractive;

    public static function make(string $id): static
    {
        return (new static)->id($id);
    }

    /**
     * @param  class-string<FormDefinition>  $form
     */
    public static function use(string $form): static
    {
        $registered = app(FormRegistry::class)->component($form);

        return (new static)
            ->id($registered->id)
            ->props($registered->props)
            ->children($registered->children);
    }

    public function action(string $action): static
    {
        return $this->prop('action', $action);
    }

    public function method(BackedEnum|string $method): static
    {
        return $this->prop('method', $method instanceof BackedEnum ? (string) $method->value : $method);
    }

    public function submitLabel(string $submitLabel): static
    {
        return $this->prop('submitLabel', $submitLabel);
    }

    /**
     * @param  Arrayable<array-key, mixed>|array<string, mixed>  $state
     */
    public function fill(Arrayable|array $state): static
    {
        return $this->prop('state', $state instanceof Arrayable ? $state->toArray() : $state);
    }

    public function precognitive(int $delay = 1500): static
    {
        return $this
            ->prop('precognitive', true)
            ->prop('validationTimeout', $delay);
    }

    public function withoutSubmitButton(): static
    {
        return $this->prop('submitButton', false);
    }

    /**
     * @param  array<int, Component>  $components
     */
    public function schema(array $components): static
    {
        return $this->children($components);
    }

    /**
     * @return Collection<int, Field>
     */
    public function fields(): Collection
    {
        return collect($this->descendants())
            ->filter(fn (Component $component): bool => $component instanceof Field)
            ->values();
    }

    /**
     * @param  array<int, string>|bool  $fields
     */
    public function resetOnSuccess(array|bool $fields = true): static
    {
        return $this->prop('resetOnSuccess', $fields);
    }

    /**
     * @param  array<int, string>|bool  $fields
     */
    public function resetOnError(array|bool $fields = true): static
    {
        return $this->prop('resetOnError', $fields);
    }

    public function status(?string $status): static
    {
        if ($status === null) {
            return $this;
        }

        return $this->prop('status', $status);
    }

    /**
     * Distribute the filled state to fields before children are serialized, so a
     * field can react to its stored value (e.g. a Select resolving labels for ids).
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    #[SerializationHook(priority: 250)]
    protected function prefillFields(array $data): array
    {
        $state = $this->props['state'] ?? null;

        if (! is_array($state)) {
            return $data;
        }

        foreach ($this->descendants() as $component) {
            if ($component instanceof Field && array_key_exists($component->name(), $state)) {
                $component->prefill($state[$component->name()]);
            }
        }

        return $data;
    }

    protected function type(): string
    {
        return 'form';
    }
}
