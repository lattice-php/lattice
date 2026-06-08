<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms;

use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Components\Form\Form as FormComponent;
use Illuminate\Contracts\Container\Container;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Spatie\Attributes\Attributes;

class FormRegistry
{
    /**
     * @var array<string, class-string<FormDefinition>>
     */
    private array $forms = [];

    public function __construct(private readonly Container $container) {}

    /**
     * @param  class-string<FormDefinition>|array<int, class-string<FormDefinition>>  $forms
     */
    public function register(string|array $forms): void
    {
        foreach ((array) $forms as $form) {
            $this->forms[$this->keyFor($form)] = $form;
        }
    }

    /**
     * @param  class-string<FormDefinition>  $form
     */
    public function component(string $form): FormComponent
    {
        $key = $this->registeredKeyFor($form);

        return $this->make($form)
            ->definition(FormComponent::make($key), $this->container->make(Request::class))
            ->action($this->actionFor($key))
            ->prop('errorBag', $this->errorBagFor($key));
    }

    public function resolve(string $key): FormDefinition
    {
        if (! array_key_exists($key, $this->forms)) {
            throw new InvalidArgumentException("Lattice form [{$key}] is not registered.");
        }

        return $this->make($this->forms[$key]);
    }

    public function actionFor(string $key): string
    {
        $endpoint = (string) config('lattice.forms.endpoint', 'lattice/forms/{form}');
        $path = str_replace('{form}', rawurlencode($key), ltrim($endpoint, '/'));

        return '/'.$path;
    }

    public function errorBagFor(string $id): string
    {
        return (string) preg_replace('/[^A-Za-z0-9_]+/', '_', $id);
    }

    /**
     * @param  class-string<FormDefinition>  $form
     */
    private function registeredKeyFor(string $form): string
    {
        $key = $this->keyFor($form);

        if (($this->forms[$key] ?? null) !== $form) {
            throw new InvalidArgumentException("Lattice form [{$form}] is not registered.");
        }

        return $key;
    }

    /**
     * @param  class-string<FormDefinition>  $form
     */
    private function keyFor(string $form): string
    {
        if (! is_subclass_of($form, FormDefinition::class)) {
            throw new InvalidArgumentException("Lattice form [{$form}] must extend [".FormDefinition::class.'].');
        }

        $attribute = Attributes::get($form, Form::class);

        if (! $attribute instanceof Form) {
            throw new InvalidArgumentException("Lattice form [{$form}] is missing the [Form] attribute.");
        }

        return $attribute->key;
    }

    /**
     * @param  class-string<FormDefinition>  $form
     */
    private function make(string $form): FormDefinition
    {
        return $this->container->make($form);
    }
}
