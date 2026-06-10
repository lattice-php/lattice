<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\ComponentAttribute;
use Lattice\Lattice\Attributes\Form;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Forms\Components\Form as FormComponent;

/**
 * @extends DefinitionRegistry<FormDefinition>
 */
final class FormRegistry extends DefinitionRegistry
{
    /**
     * @param  class-string<FormDefinition>  $form
     */
    public function component(string $form): FormComponent
    {
        $key = $this->registeredKeyFor($form);

        return $this->make($form)
            ->definition(FormComponent::make($key), $this->container->make(Request::class))
            ->action($this->endpointFor($key))
            ->errorBag($this->errorBagFor($key));
    }

    public function errorBagFor(string $id): string
    {
        return (string) preg_replace('/[^A-Za-z0-9_]+/', '_', $id);
    }

    /**
     * @return class-string<FormDefinition>
     */
    protected function definitionClass(): string
    {
        return FormDefinition::class;
    }

    /**
     * @return class-string<ComponentAttribute>
     */
    public function attributeClass(): string
    {
        return Form::class;
    }

    protected function name(): string
    {
        return 'form';
    }

    public function group(): string
    {
        return 'forms';
    }
}
