<?php

namespace Bambamboole\Lattice\Components;

use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Forms\FormRegistry;

class Form extends InteractiveComponent
{
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

    public function method(string $method): static
    {
        return $this->prop('method', $method);
    }

    public function submitLabel(string $submitLabel): static
    {
        return $this->prop('submitLabel', $submitLabel);
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

    protected function type(): string
    {
        return 'form';
    }
}
